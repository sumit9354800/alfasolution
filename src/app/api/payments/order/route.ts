import { z } from "zod";
import { billingSchema } from "@/lib/validations/contact";
import { env } from "@/server/env";
import { getPackageBySlug, isBuyable } from "@/server/repos/content";
import { PaymentError, getPaymentByLinkToken, startLinkCheckout, startPackageCheckout } from "@/server/finance/payments";
import { PaymentGatewayError } from "@/server/finance/razorpay";
import { rateLimit } from "@/server/security/rate-limit";
import { ipFromHeaders, isSameOrigin, jsonError } from "@/server/security/request";

const requestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("package"), slug: z.string().max(160), option: z.enum(["full", "advance"]), billing: z.unknown() }),
  z.object({ type: z.literal("link"), token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), billing: z.unknown() }),
]);

/**
 * Creates a Razorpay order. The amount is always calculated on the server from
 * the database; anything amount-like sent by the browser is ignored.
 */
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return jsonError("Request blocked.", 403);
    if (!env.razorpay.configured) return jsonError("Online payments are not available right now.", 503);
    if (!(await rateLimit(`pay-order:${ipFromHeaders(request.headers)}`, 15, 600))) return jsonError("Too many attempts. Please wait a few minutes.", 429);

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid payment request.", 400);
    const billing = billingSchema.safeParse(parsed.data.billing);
    if (!billing.success) {
      return jsonError(billing.error.issues[0]?.message ?? "Check your billing details.", 400, { errors: billing.error.flatten().fieldErrors });
    }

    let checkout;
    if (parsed.data.type === "package") {
      const pkg = await getPackageBySlug(parsed.data.slug);
      if (!pkg || !isBuyable(pkg)) return jsonError("This package can’t be bought online.", 404);
      checkout = await startPackageCheckout(pkg, parsed.data.option, billing.data);
    } else {
      const payment = await getPaymentByLinkToken(parsed.data.token);
      if (!payment) return jsonError("This payment link is not valid.", 404);
      checkout = await startLinkCheckout(payment, billing.data);
    }

    return Response.json({
      success: true,
      keyId: env.razorpay.keyId,
      orderId: checkout.orderId,
      amountPaise: checkout.amountPaise,
      currency: "INR",
      description: checkout.description,
      reference: checkout.reference,
      prefill: { name: billing.data.name, email: billing.data.email, contact: billing.data.phone },
    });
  } catch (error) {
    if (error instanceof PaymentError || error instanceof PaymentGatewayError) return jsonError(error.message, 400);
    console.error("[payments/order] failed", error);
    return jsonError("We couldn’t start the payment. Please try again.", 500);
  }
}
