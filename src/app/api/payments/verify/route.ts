import { z } from "zod";
import { PaymentError, finalizeGatewayPayment } from "@/server/finance/payments";
import { verifyPaymentSignature } from "@/server/finance/razorpay";
import { queryOne } from "@/server/db";
import { rateLimit } from "@/server/security/rate-limit";
import { ipFromHeaders, isSameOrigin, jsonError } from "@/server/security/request";

const schema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

/**
 * Called by the browser after Razorpay checkout succeeds. The browser's word is
 * never trusted: the signature is checked with our secret key and the payment
 * is re-fetched from Razorpay before anything is marked as paid.
 */
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return jsonError("Request blocked.", 403);
    if (!(await rateLimit(`pay-verify:${ipFromHeaders(request.headers)}`, 30, 600))) return jsonError("Too many attempts.", 429);

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid payment confirmation.", 400);
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data;

    const payment = await queryOne<{ reference: string }>("SELECT reference FROM payments WHERE gateway_order_id = ?", [orderId]);
    if (!payment) return jsonError("Unknown order.", 404);

    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      console.warn("[payments/verify] signature mismatch", { orderId, paymentId });
      return jsonError("Payment could not be verified.", 400, { reference: payment.reference });
    }

    const result = await finalizeGatewayPayment(orderId, paymentId, signature);
    return Response.json({ success: result.status === "paid" || result.status === "already_paid", status: result.status, reference: result.reference });
  } catch (error) {
    if (error instanceof PaymentError) return jsonError(error.message, 400);
    console.error("[payments/verify] failed", error);
    return jsonError("We couldn’t confirm the payment yet. If you were charged, it will be confirmed automatically.", 500);
  }
}
