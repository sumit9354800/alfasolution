"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { adminAction, UserFacingError, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, transaction } from "@/server/db";
import { logActivity } from "@/server/audit";
import { escapeHtml, layout, sendMail } from "@/server/mail";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { formatClientAddress, getClient } from "@/server/repos/crm";
import { createInvoice, getInvoice } from "@/server/finance/invoices";
import { renderInvoicePdf } from "@/server/finance/invoice-pdf";
import { formatMoney } from "@/lib/format";

const itemSchema = z.object({
  description: z.string().trim().min(1, "Every line needs a description.").max(400),
  quantity: z.coerce.number().positive("Quantity must be more than 0.").max(100000),
  unit_price: z.coerce.number().min(0, "Rates can’t be negative.").max(10000000),
});

const schema = z.object({
  client_id: z.coerce.number().int().positive("Choose a client."),
  project_id: z.union([z.literal(""), z.coerce.number().int().positive()]),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the issue date."),
  due_date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  tax_rate: z.coerce.number().min(0).max(50),
  discount: z.coerce.number().min(0),
  notes: z.string().trim().max(2000),
  status: z.enum(["draft", "issued"]),
});

export async function createInvoiceAction(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("finance.manage", async (user) => {
    const parsed = schema.safeParse({
      client_id: form.get("client_id"),
      project_id: form.get("project_id") ?? "",
      issue_date: form.get("issue_date"),
      due_date: form.get("due_date") ?? "",
      tax_rate: form.get("tax_rate") || 0,
      discount: form.get("discount") || 0,
      notes: form.get("notes") ?? "",
      status: form.get("status") === "draft" ? "draft" : "issued",
    });
    if (!parsed.success) throw new ValidationError(zodFieldErrors(parsed.error));
    let rawItems: unknown;
    try {
      rawItems = JSON.parse(String(form.get("items") ?? "[]"));
    } catch {
      rawItems = [];
    }
    const items = z.array(itemSchema).min(1, "Add at least one line item.").max(50).safeParse(
      (Array.isArray(rawItems) ? rawItems : []).filter((l) => l && (String(l.description ?? "").trim() || String(l.unit_price ?? "").trim()))
    );
    if (!items.success) throw new UserFacingError(items.error.issues[0]?.message ?? "Check the line items.");

    const d = parsed.data;
    const client = await getClient(d.client_id);
    if (!client) throw new ValidationError({ client_id: "Choose a client." });

    const created = await transaction((connection) =>
      createInvoice(connection, {
        clientId: client.id,
        clientProjectId: d.project_id || null,
        billing: { name: client.name, company: client.company, email: client.email, phone: client.phone, gstin: client.gstin, address: formatClientAddress(client) },
        items: items.data,
        taxRate: d.tax_rate,
        discount: d.discount,
        status: d.status,
        issueDate: new Date(`${d.issue_date}T00:00:00+05:30`),
        dueDate: d.due_date ? new Date(`${d.due_date}T00:00:00+05:30`) : null,
        notes: d.notes || null,
        createdBy: user.id,
      })
    );
    id = created.id;
    await logActivity(user.id, "create", "invoice", id, `Created invoice ${created.number} for ${formatMoney(created.total)}`);
  });
  if (result.status === "success") redirect(`/admin/invoices/${id}`);
  return result;
}

export async function setInvoiceStatus(id: number, status: "issued" | "cancelled", _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    if (status !== "issued" && status !== "cancelled") throw new UserFacingError("Invalid status.");
    const allowed = status === "issued" ? "status = 'draft'" : "status IN ('draft','issued')";
    const r = await execute(`UPDATE invoices SET status = ? WHERE id = ? AND ${allowed}`, [status, id]);
    if (!r.affectedRows) throw new UserFacingError(status === "issued" ? "Only drafts can be issued." : "Only unpaid invoices can be cancelled.");
    await logActivity(user.id, "update", "invoice", id, `Invoice #${id} ${status}`);
    revalidatePath(`/admin/invoices/${id}`);
    return { status: "success", message: status === "issued" ? "Invoice issued." : "Invoice cancelled.", at: Date.now() };
  });
}

export async function emailInvoiceAction(id: number, _: ActionState, _form: FormData) {
  return adminAction("finance.manage", async (user) => {
    const data = await getInvoice(id);
    if (!data) throw new UserFacingError("Invoice not found.");
    const { invoice, items } = data;
    if (invoice.status === "draft") throw new UserFacingError("Issue the invoice before sending it.");
    const billing = await getSetting("billing");
    const pdf = await renderInvoicePdf(invoice, items);
    const url = `${env.siteUrl}/invoice/${invoice.public_token}`;
    const balance = Number(invoice.total) - Number(invoice.amount_paid);
    const sent = await sendMail({
      to: invoice.billing_email,
      subject: `Invoice ${invoice.invoice_number} from ${billing.legalName}`,
      text: `Hi ${invoice.billing_name},\n\nPlease find invoice ${invoice.invoice_number} for ${formatMoney(invoice.total)} attached.${balance > 0 ? ` Balance: ${formatMoney(balance)}.` : ""}\nView online: ${url}\n\nThank you,\n${billing.legalName}`,
      html: layout(`Invoice ${invoice.invoice_number}`, `<p>Hi ${escapeHtml(invoice.billing_name)},</p><p>Please find invoice <strong>${escapeHtml(invoice.invoice_number)}</strong> for <strong>${escapeHtml(formatMoney(invoice.total))}</strong> attached.${balance > 0 ? ` Balance: <strong>${escapeHtml(formatMoney(balance))}</strong>.` : ""}</p><p><a href="${url}">View the invoice online</a></p><p>Thank you,<br/>${escapeHtml(billing.legalName)}</p>`),
      attachments: [{ filename: `${invoice.invoice_number.replace(/\//g, "-")}.pdf`, content: Buffer.from(pdf) }],
    });
    if (!sent) throw new UserFacingError("The email couldn’t be sent. Check the email settings (RESEND_API_KEY), or download the PDF and send it yourself.");
    await logActivity(user.id, "email", "invoice", id, `Emailed invoice ${invoice.invoice_number} to ${invoice.billing_email}`);
    return { status: "success", message: `Invoice emailed to ${invoice.billing_email}.`, at: Date.now() };
  });
}
