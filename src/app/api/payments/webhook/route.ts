import { execute } from "@/server/db";
import { finalizeGatewayPayment, markFailed } from "@/server/finance/payments";
import { verifyWebhookSignature } from "@/server/finance/razorpay";

type WebhookBody = {
  event: string;
  payload?: { payment?: { entity?: { id: string; order_id: string; status: string; error_description?: string } } };
};

/**
 * Razorpay webhook (configure in Razorpay Dashboard → Webhooks with events
 * payment.captured, payment.failed and order.paid). Confirms payments even if
 * the customer closes the browser before returning to the site.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) return new Response("Invalid signature", { status: 401 });

  let body: WebhookBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Idempotency: Razorpay may deliver the same event more than once.
  const eventId = request.headers.get("x-razorpay-event-id") ?? `${body.event}:${body.payload?.payment?.entity?.id ?? "na"}`;
  const inserted = await execute("INSERT IGNORE INTO webhook_events (provider, event_id, event_type, payload) VALUES ('razorpay', ?, ?, ?)", [eventId.slice(0, 100), body.event.slice(0, 100), raw]);
  if (inserted.affectedRows === 0) return Response.json({ ok: true, duplicate: true });

  try {
    const entity = body.payload?.payment?.entity;
    if (entity?.order_id) {
      if (body.event === "payment.captured" || body.event === "order.paid") {
        await finalizeGatewayPayment(entity.order_id, entity.id, null);
      } else if (body.event === "payment.failed") {
        await markFailed(entity.order_id, entity.error_description ?? "Payment failed.");
      }
    }
    await execute("UPDATE webhook_events SET processed_at = UTC_TIMESTAMP() WHERE provider = 'razorpay' AND event_id = ?", [eventId.slice(0, 100)]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[payments/webhook] processing failed", error);
    // Allow Razorpay to retry: forget the event so the retry is processed.
    await execute("DELETE FROM webhook_events WHERE provider = 'razorpay' AND event_id = ? AND processed_at IS NULL", [eventId.slice(0, 100)]);
    return new Response("Processing failed", { status: 500 });
  }
}


