import "server-only";
import { randomBytes } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { round2, toDateInput } from "@/lib/format";
import { execute, query, queryOne } from "../db";
import { getSetting } from "../settings";

export const INVOICE_STATUSES = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially paid",
  paid: "Paid",
  cancelled: "Cancelled",
} as const;
export type InvoiceStatus = keyof typeof INVOICE_STATUSES;

export type InvoiceItemInput = { description: string; quantity: number; unit_price: number };

export type Invoice = {
  id: number;
  invoice_number: string;
  public_token: string;
  client_id: number | null;
  client_project_id: number | null;
  project_title?: string | null;
  status: InvoiceStatus;
  issue_date: Date;
  due_date: Date | null;
  billing_name: string;
  billing_company: string | null;
  billing_email: string;
  billing_phone: string | null;
  billing_address: string | null;
  billing_gstin: string | null;
  subtotal: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  currency: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type InvoiceItem = { id: number; description: string; quantity: number; unit_price: number; amount: number };

/** Indian financial year label (April–March), e.g. "2026-27". */
export function fiscalYear(date = new Date()) {
  const ist = new Date(date.getTime() + 330 * 60_000);
  const year = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/**
 * Allocates the next invoice number for the financial year. The sequence row is
 * locked for the rest of the transaction, so concurrent payments can never
 * receive the same number.
 */
export async function nextInvoiceNumber(connection: PoolConnection) {
  const billing = await getSetting("billing");
  const prefix = (billing.invoicePrefix || "INV").replace(/[^A-Za-z0-9-]/g, "").slice(0, 10) || "INV";
  const fy = fiscalYear();
  await execute("INSERT IGNORE INTO invoice_sequences (fiscal_year, last_number) VALUES (?, 0)", [fy], connection);
  const row = await queryOne<{ last_number: number }>("SELECT last_number FROM invoice_sequences WHERE fiscal_year = ? FOR UPDATE", [fy], connection);
  const next = Number(row?.last_number ?? 0) + 1;
  await execute("UPDATE invoice_sequences SET last_number = ? WHERE fiscal_year = ?", [next, fy], connection);
  return `${prefix}/${fy}/${String(next).padStart(4, "0")}`;
}

export function computeTotals(items: InvoiceItemInput[], taxRate: number, discount = 0) {
  const lines = items.map((item) => ({ ...item, amount: round2(item.quantity * item.unit_price) }));
  const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
  const safeDiscount = Math.min(Math.max(round2(discount), 0), subtotal);
  const taxable = round2(subtotal - safeDiscount);
  const taxAmount = round2((taxable * taxRate) / 100);
  return { lines, subtotal, discount: safeDiscount, taxAmount, total: round2(taxable + taxAmount) };
}

export type CreateInvoiceInput = {
  clientId: number | null;
  clientProjectId?: number | null;
  billing: { name: string; company?: string | null; email: string; phone?: string | null; address?: string | null; gstin?: string | null };
  items: InvoiceItemInput[];
  taxRate: number;
  discount?: number;
  amountPaid?: number;
  status?: InvoiceStatus;
  issueDate?: Date;
  dueDate?: Date | null;
  notes?: string | null;
  createdBy?: number | null;
};

export async function createInvoice(connection: PoolConnection, input: CreateInvoiceInput) {
  if (!input.items.length) throw new Error("An invoice needs at least one line item.");
  const totals = computeTotals(input.items, input.taxRate, input.discount);
  const number = await nextInvoiceNumber(connection);
  const amountPaid = round2(Math.min(input.amountPaid ?? 0, totals.total));
  const status: InvoiceStatus =
    input.status === "draft" || input.status === "cancelled"
      ? input.status
      : amountPaid >= totals.total && totals.total > 0
        ? "paid"
        : amountPaid > 0
          ? "partially_paid"
          : "issued";

  const issue = input.issueDate ?? new Date();
  const result = await execute(
    `INSERT INTO invoices (invoice_number, public_token, client_id, client_project_id, status, issue_date, due_date,
       billing_name, billing_company, billing_email, billing_phone, billing_address, billing_gstin,
       subtotal, discount, tax_rate, tax_amount, total, amount_paid, currency, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?)`,
    [
      number,
      randomBytes(32).toString("base64url"),
      input.clientId,
      input.clientProjectId ?? null,
      status,
      // DATE columns store the Indian calendar date, not a UTC instant.
      toDateInput(issue),
      input.dueDate ? toDateInput(input.dueDate) : null,
      input.billing.name,
      input.billing.company ?? null,
      input.billing.email,
      input.billing.phone ?? null,
      input.billing.address ?? null,
      input.billing.gstin ?? null,
      totals.subtotal,
      totals.discount,
      input.taxRate,
      totals.taxAmount,
      totals.total,
      amountPaid,
      input.notes ?? null,
      input.createdBy ?? null,
    ],
    connection
  );
  for (const [index, line] of totals.lines.entries()) {
    await execute(
      "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
      [result.insertId, line.description, line.quantity, line.unit_price, line.amount, index],
      connection
    );
  }
  return { id: result.insertId, number, total: totals.total };
}

/** Adds a payment to an invoice and moves it to partially paid / paid. */
export async function applyPaymentToInvoice(connection: PoolConnection, invoiceId: number, amount: number) {
  // Note: MySQL applies SET assignments left to right, so status is computed
  // first, from the amount_paid value before this payment.
  await execute(
    `UPDATE invoices SET
       status = CASE WHEN status IN ('draft','cancelled') THEN status
                     WHEN amount_paid + ? >= total THEN 'paid'
                     ELSE 'partially_paid' END,
       amount_paid = LEAST(total, amount_paid + ?)
     WHERE id = ?`,
    [amount, amount, invoiceId],
    connection
  );
}

const SELECT = `SELECT i.*, p.title AS project_title FROM invoices i LEFT JOIN client_projects p ON p.id = i.client_project_id`;

export async function getInvoice(id: number) {
  const invoice = await queryOne<Invoice>(`${SELECT} WHERE i.id = ?`, [id]);
  if (!invoice) return null;
  const items = await query<InvoiceItem>("SELECT id, description, quantity, unit_price, amount FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order, id", [id]);
  return { invoice, items };
}

export async function getInvoiceByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const row = await queryOne<{ id: number }>("SELECT id FROM invoices WHERE public_token = ? AND status <> 'draft'", [token]);
  return row ? getInvoice(row.id) : null;
}

export async function listInvoices(filters: { status?: string; client?: number; q?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.status && filters.status in INVOICE_STATUSES) {
    where.push("i.status = ?");
    params.push(filters.status);
  }
  if (filters.client) {
    where.push("i.client_id = ?");
    params.push(filters.client);
  }
  if (filters.q) {
    const like = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push("(i.invoice_number LIKE ? OR i.billing_name LIKE ? OR i.billing_company LIKE ? OR i.billing_email LIKE ?)");
    params.push(like, like, like, like);
  }
  return query<Invoice>(`${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY i.created_at DESC LIMIT 300`, params);
}
