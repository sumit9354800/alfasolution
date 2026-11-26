import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";

/**
 * Minimal Razorpay REST client. The key secret never leaves the server; the
 * browser only ever receives the public key id and an order id.
 */

export class PaymentGatewayError extends Error {}

function auth() {
  const { keyId, keySecret } = env.razorpay;
  if (!keyId || !keySecret) throw new PaymentGatewayError("Online payments are not configured.");
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.razorpay.apiBase}/v1${path}`, {
      method,
      headers: { Authorization: auth(), "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("[razorpay] request failed", path, error);
    throw new PaymentGatewayError("We couldn’t reach the payment provider. Please try again in a moment.");
  }
  const data = (await response.json().catch(() => ({}))) as T & { error?: { description?: string } };
  if (!response.ok) {
    throw new PaymentGatewayError(data?.error?.description ?? `Razorpay request failed (${response.status}).`);
  }
  return data;
}

export type RazorpayOrder = { id: string; amount: number; currency: string; receipt: string; status: string };
export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
  email?: string;
  contact?: string;
  error_description?: string | null;
};

export function createOrder(input: { amountPaise: number; currency: string; receipt: string; notes?: Record<string, string> }) {
  return call<RazorpayOrder>("POST", "/orders", {
    amount: input.amountPaise,
    currency: input.currency,
    receipt: input.receipt,
    notes: input.notes,
    payment_capture: 1,
  });
}

export function fetchPayment(paymentId: string) {
  return call<RazorpayPayment>("GET", `/payments/${encodeURIComponent(paymentId)}`);
}

export function fetchOrderPayments(orderId: string) {
  return call<{ items: RazorpayPayment[] }>("GET", `/orders/${encodeURIComponent(orderId)}/payments`);
}

export function capturePayment(paymentId: string, amountPaise: number, currency: string) {
  return call<RazorpayPayment>("POST", `/payments/${encodeURIComponent(paymentId)}/capture`, { amount: amountPaise, currency });
}

function safeEqualHex(expected: string, received: string) {
  if (!/^[a-f0-9]+$/i.test(received) || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

/** Verifies the checkout signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = env.razorpay.keySecret;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Verifies a webhook body against X-Razorpay-Signature using the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = env.razorpay.webhookSecret;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
