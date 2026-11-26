"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { adminAction, UserFacingError, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute } from "@/server/db";
import { logActivity } from "@/server/audit";
import { escapeHtml, layout, sendMail } from "@/server/mail";
import { env } from "@/server/env";
import { formatMoney, fromISTInput } from "@/lib/format";
import {
  PAYMENT_METHODS,
  PAYMENT_PURPOSES,
  PaymentError,
  createPaymentRequest,
  getPayment,
  recordManualPayment,
  sendPaymentEmails,
  syncWithGateway,
} from "@/server/finance/payments";
import { PaymentGatewayError } from "@/server/finance/razorpay";

const base = z.object({
  client_id: z.coerce.number().int().positive("Choose a client."),
  project_id: z.union([z.literal(""), z.coerce.number().int().positive()]),
  invoice_id: z.union([z.literal(""), z.coerce.number().int().positive()]),
  purpose: z.enum(Object.keys(PAYMENT_PURPOSES) as [string, ...string[]]),
  description: z.string().trim().min(3, "Describe what this payment is for.").max(400),
  amount: z.coerce.number({ error: "Enter an amount." }).min(1, "Amount must be at least ₹1.").max(10000000, "That amount is too large."),
});

function parseBase(form: FormData) {
  const r = base.safeParse({
    client_id: form.get("client_id"),
    project_id: form.get("project_id") ?? "",
    invoice_id: form.get("invoice_id") ?? "",
    purpose: form.get("purpose"),
    description: form.get("description"),
    amount: form.get("amount"),
  });
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  return { ...r.data, project_id: r.data.project_id || null, invoice_id: r.data.invoice_id || null };
}

function wrapPaymentErrors<T>(work: () => Promise<T>) {
  return work().catch((error) => {
    if (error instanceof PaymentError || error instanceof PaymentGatewayError) throw new UserFacingError(error.message);
    throw error;
  });
}

export async function createRequestAction(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("finance.manage", async (user) => {
    const d = parseBase(form);
    const days = Math.min(Math.max(Number(form.get("expires_days") ?? 14) || 14, 1), 90);
    const created = await wrapPaymentErrors(() =>
      createPaymentRequest({ clientId: d.client_id, projectId: d.project_id, invoiceId: d.invoice_id, purpose: d.purpose as never, description: d.description, amount: d.amount, expiresInDays: days, createdBy: user.id })
    );
    id = created.id;
    await logActivity(user.id, "create", "payment", id, `Payment request ${formatMoney(d.amount)} — ${d.description}`);
    if (form.get("send_email") === "on") await emailPaymentLink(id);
  });
  if (result.status === "success") redirect(`/admin/payments/${id}`);
  return result;
}

export async function recordManualAction(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("finance.manage", async (user) => {
    const d = parseBase(form);
    const method = String(form.get("method") ?? "");
    if (!(method in PAYMENT_METHODS) || method === "razorpay") throw new ValidationError({ method: "Choose how the payment was received." });
    const paidAt = fromISTInput(String(form.get("paid_at") ?? "")) ?? new Date();
    id = await wrapPaymentErrors(() =>
      recordManualPayment({ clientId: d.client_id, projectId: d.project_id, invoiceId: d.invoice_id, purpose: d.purpose as never, method: method as never, description: d.description, amount: d.amount, paidAt, createdBy: user.id })
    );
    await logActivity(user.id, "create", "payment", id, `Recorded ${PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]} payment ${formatMoney(d.amount)}`);
    if (form.get("send_email") === "on") void sendPaymentEmails(id);
  });
  if (result.status === "success") redirect(`/admin/payments/${id}`);
  return result;
}

async function emailPaymentLink(id: number) {
  const payment = await getPayment(id);
  if (!payment?.link_token || !payment.payer_email) throw new UserFacingError("This payment has no link or client email.");
  const url = `${env.siteUrl}/pay/${payment.link_token}`;
  const sent = await sendMail({
    to: payment.payer_email,
    subject: `Payment request — ${formatMoney(payment.amount)} for ${payment.description}`,
    text: `Hi ${payment.payer_name ?? ""},\n\nPlease use this secure link to pay ${formatMoney(payment.amount)} for "${payment.description}":\n${url}\n\nThank you,\nAlfa Solution`,
    html: layout("Payment request", `<p>Hi ${escapeHtml(payment.payer_name ?? "")},</p><p>Please use the secure link below to pay <strong>${escapeHtml(formatMoney(payment.amount))}</strong> for “${escapeHtml(payment.description)}”.</p><p><a href="${url}" style="display:inline-block;background:#191D27;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Pay ${escapeHtml(formatMoney(payment.amount))}</a></p><p style="color:#5D6575;font-size:13px">You can pay by UPI, card or net banking. An invoice is issued automatically.</p>`),
  });
  if (!sent) throw new UserFacingError("The link was created, but the email couldn’t be sent. Check the email settings, or copy the link and send it yourself.");
}

export async function sendLinkAction(id: number, _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    await emailPaymentLink(id);
    await logActivity(user.id, "email", "payment", id, "Emailed payment link to client");
    return { status: "success", message: "Payment link emailed to the client.", at: Date.now() };
  });
}

export async function syncAction(id: number, _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    const status = await wrapPaymentErrors(() => syncWithGateway(id));
    await logActivity(user.id, "sync", "payment", id, `Checked payment with Razorpay: ${status}`);
    revalidatePath(`/admin/payments/${id}`);
    const messages: Record<string, string> = {
      paid: "Payment confirmed and invoice issued.",
      already_paid: "This payment was already confirmed.",
      failed: "Razorpay reports this payment failed.",
      pending: "No completed payment on this order yet.",
    };
    return { status: "success", message: messages[status] ?? `Status: ${status}`, at: Date.now() };
  });
}

export async function cancelAction(id: number, _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    const r = await execute("UPDATE payments SET status = 'cancelled' WHERE id = ? AND status IN ('pending','failed')", [id]);
    if (!r.affectedRows) throw new UserFacingError("Only pending or failed payments can be cancelled.");
    await logActivity(user.id, "cancel", "payment", id, `Cancelled payment #${id}`);
    revalidatePath(`/admin/payments/${id}`);
    return { status: "success", message: "Payment request cancelled. The link no longer works.", at: Date.now() };
  });
}

export async function resendReceiptAction(id: number, _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    await sendPaymentEmails(id);
    await logActivity(user.id, "email", "payment", id, "Re-sent payment receipt");
    return { status: "success", message: "Receipt and invoice sent (if email is configured).", at: Date.now() };
  });
}
