import "server-only";
import { randomBytes } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { formatMoney, round2, toPaise } from "@/lib/format";
import { execute, parseJson, query, queryOne, transaction } from "../db";
import { env } from "../env";
import { escapeHtml, layout, notifyTeam, sendMail } from "../mail";
import { getSetting } from "../settings";
import { findOrCreateClient } from "../repos/crm";
import type { PricingPackage } from "../repos/content";
import { applyPaymentToInvoice, createInvoice, getInvoice } from "./invoices";
import { renderInvoicePdf } from "./invoice-pdf";
import * as razorpay from "./razorpay";

export const PAYMENT_STATUSES = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;
export type PaymentStatus = keyof typeof PAYMENT_STATUSES;

export const PAYMENT_PURPOSES = {
  advance: "Advance",
  milestone: "Milestone",
  final: "Final / remaining",
  full: "Full payment",
  package: "Package purchase",
  other: "Other",
} as const;
export type PaymentPurpose = keyof typeof PAYMENT_PURPOSES;

export const PAYMENT_METHODS = {
  razorpay: "Online (Razorpay)",
  bank_transfer: "Bank transfer",
  upi: "UPI (direct)",
  cash: "Cash",
  cheque: "Cheque",
  other: "Other",
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export type BillingDetails = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  gstin?: string | null;
  address?: string | null;
};

/** How the charged amount splits into taxable value and tax, fixed when the payment is created. */
type Breakdown = { subtotal: number; taxRate: number; taxAmount: number; line: string };

export type Payment = {
  id: number;
  reference: string;
  client_id: number | null;
  client_name?: string | null;
  client_project_id: number | null;
  project_title?: string | null;
  package_id: number | null;
  invoice_id: number | null;
  invoice_number?: string | null;
  purpose: PaymentPurpose;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  payer_name: string | null;
  payer_email: string | null;
  payer_phone: string | null;
  billing_details: string | null;
  link_token: string | null;
  link_expires_at: Date | null;
  failure_reason: string | null;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export class PaymentError extends Error {}

const newReference = () => randomBytes(10).toString("base64url").replace(/[-_]/g, "X").slice(0, 12).toUpperCase().padEnd(12, "0");
const newToken = () => randomBytes(32).toString("base64url");

const SELECT = `SELECT y.*, c.name AS client_name, p.title AS project_title, i.invoice_number
  FROM payments y
  LEFT JOIN clients c ON c.id = y.client_id
  LEFT JOIN client_projects p ON p.id = y.client_project_id
  LEFT JOIN invoices i ON i.id = y.invoice_id`;

export function getPayment(id: number) {
  return queryOne<Payment>(`${SELECT} WHERE y.id = ?`, [id]);
}

export function getPaymentByReference(reference: string) {
  if (!/^[A-Z0-9]{12}$/.test(reference)) return Promise.resolve(null);
  return queryOne<Payment>(`${SELECT} WHERE y.reference = ?`, [reference]);
}

export async function getPaymentByLinkToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return queryOne<Payment>(`${SELECT} WHERE y.link_token = ?`, [token]);
}

export function listPayments(filters: { status?: string; client?: number; q?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.status && filters.status in PAYMENT_STATUSES) {
    where.push("y.status = ?");
    params.push(filters.status);
  }
  if (filters.client) {
    where.push("y.client_id = ?");
    params.push(filters.client);
  }
  if (filters.q) {
    const like = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    where.push("(y.reference LIKE ? OR y.description LIKE ? OR y.payer_name LIKE ? OR y.payer_email LIKE ? OR y.gateway_payment_id LIKE ?)");
    params.push(like, like, like, like, like);
  }
  return query<Payment>(`${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY y.created_at DESC LIMIT 300`, params);
}

export function isLinkUsable(payment: Payment) {
  if (payment.status === "paid" || payment.status === "cancelled" || payment.status === "refunded") return false;
  return !payment.link_expires_at || new Date(payment.link_expires_at).getTime() > Date.now();
}

// ---------------------------------------------------------------------------
// Creating payments
// ---------------------------------------------------------------------------

/** Price for a package checkout, computed on the server from the database — never from the browser. */
export async function quotePackage(pkg: PricingPackage, option: "full" | "advance") {
  if (!pkg.price || pkg.price <= 0) throw new PaymentError("This package is quoted on request.");
  const billing = await getSetting("billing");
  const share = option === "advance" ? Math.min(Math.max(pkg.advance_percent, 10), 100) / 100 : 1;
  const subtotal = round2(pkg.price * share);
  const taxRate = Number(billing.taxRate) || 0;
  const taxAmount = round2((subtotal * taxRate) / 100);
  return {
    subtotal,
    taxRate,
    taxAmount,
    total: round2(subtotal + taxAmount),
    line: option === "advance" ? `${pkg.name} — ${pkg.advance_percent}% advance` : `${pkg.name} — full payment`,
  };
}

async function openGatewayOrder(paymentId: number, reference: string, amount: number, notes: Record<string, string>) {
  const order = await razorpay.createOrder({ amountPaise: toPaise(amount), currency: "INR", receipt: reference, notes });
  await execute("UPDATE payments SET gateway_order_id = ?, status = 'pending' WHERE id = ?", [order.id, paymentId]);
  return order;
}

export async function startPackageCheckout(pkg: PricingPackage, option: "full" | "advance", billing: BillingDetails) {
  const quote = await quotePackage(pkg, option);
  const reference = newReference();
  const breakdown: Breakdown = { subtotal: quote.subtotal, taxRate: quote.taxRate, taxAmount: quote.taxAmount, line: quote.line };
  const result = await execute(
    `INSERT INTO payments (reference, package_id, purpose, description, amount, status, method, payer_name, payer_email, payer_phone, billing_details)
     VALUES (?, ?, ?, ?, ?, 'pending', 'razorpay', ?, ?, ?, ?)`,
    [reference, pkg.id, option === "advance" ? "advance" : "package", quote.line, quote.total, billing.name, billing.email, billing.phone ?? null, JSON.stringify({ ...billing, breakdown })]
  );
  const order = await openGatewayOrder(result.insertId, reference, quote.total, { reference, package: pkg.slug });
  return { reference, orderId: order.id, amount: quote.total, amountPaise: order.amount, description: quote.line };
}

/** Starts (or resumes) checkout for an admin-created payment link. */
export async function startLinkCheckout(payment: Payment, billing: BillingDetails) {
  if (!isLinkUsable(payment)) throw new PaymentError("This payment link is no longer active.");
  const existing = parseJson<Record<string, unknown>>(payment.billing_details, {});
  await execute("UPDATE payments SET payer_name = ?, payer_email = ?, payer_phone = ?, billing_details = ? WHERE id = ?", [
    billing.name,
    billing.email,
    billing.phone ?? null,
    JSON.stringify({ ...existing, ...billing }),
    payment.id,
  ]);
  let orderId = payment.gateway_order_id;
  if (!orderId) {
    const order = await openGatewayOrder(payment.id, payment.reference, Number(payment.amount), { reference: payment.reference });
    orderId = order.id;
  }
  return { reference: payment.reference, orderId, amount: Number(payment.amount), amountPaise: toPaise(Number(payment.amount)), description: payment.description };
}

export type PaymentRequestInput = {
  clientId: number;
  projectId: number | null;
  invoiceId: number | null;
  purpose: PaymentPurpose;
  description: string;
  amount: number;
  expiresInDays: number;
  createdBy: number;
};

/** Admin creates a payment request; the client pays it at /pay/<token>. */
export async function createPaymentRequest(input: PaymentRequestInput) {
  const client = await queryOne<{ name: string; email: string; phone: string | null; company: string | null; gstin: string | null }>(
    "SELECT name, email, phone, company, gstin FROM clients WHERE id = ?",
    [input.clientId]
  );
  if (!client) throw new PaymentError("Choose a client.");
  if (input.invoiceId) {
    const inv = await getInvoice(input.invoiceId);
    if (!inv || inv.invoice.client_id !== input.clientId) throw new PaymentError("That invoice does not belong to this client.");
    const balance = round2(inv.invoice.total - inv.invoice.amount_paid);
    if (input.amount > balance + 0.001) throw new PaymentError(`The invoice balance is only ${formatMoney(balance)}.`);
  }
  const billing = await getSetting("billing");
  const taxRate = Number(billing.taxRate) || 0;
  // Payment-link amounts are tax-inclusive; split them for the auto-generated invoice.
  const subtotal = round2(input.amount / (1 + taxRate / 100));
  const breakdown: Breakdown = { subtotal, taxRate, taxAmount: round2(input.amount - subtotal), line: input.description };
  const token = newToken();
  const reference = newReference();
  const result = await execute(
    `INSERT INTO payments (reference, client_id, client_project_id, invoice_id, purpose, description, amount, status, method,
       payer_name, payer_email, payer_phone, billing_details, link_token, link_expires_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'razorpay', ?, ?, ?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? DAY, ?)`,
    [
      reference,
      input.clientId,
      input.projectId,
      input.invoiceId,
      input.purpose,
      input.description,
      round2(input.amount),
      client.name,
      client.email,
      client.phone,
      JSON.stringify({ name: client.name, email: client.email, phone: client.phone, company: client.company, gstin: client.gstin, breakdown }),
      token,
      input.expiresInDays,
      input.createdBy,
    ]
  );
  return { id: result.insertId, token, url: `${env.siteUrl}/pay/${token}` };
}

// ---------------------------------------------------------------------------
// Completing payments
// ---------------------------------------------------------------------------

/**
 * Marks a gateway payment as paid and issues/updates its invoice — exactly once.
 * Called from checkout verification, the webhook and the admin "sync" button;
 * the row lock makes concurrent calls safe.
 */
async function settle(
  connection: PoolConnection,
  payment: Payment,
  gateway: { paymentId: string | null; signature: string | null; method: PaymentMethod; paidAt?: Date }
) {
  const details = parseJson<BillingDetails & { breakdown?: Breakdown }>(payment.billing_details, {
    name: payment.payer_name ?? "Customer",
    email: payment.payer_email ?? "",
  });
  const clientId =
    payment.client_id ??
    (details.email
      ? await findOrCreateClient({ name: details.name, email: details.email, phone: details.phone, company: details.company, gstin: details.gstin, address: details.address }, connection)
      : null);

  let invoiceId = payment.invoice_id;
  if (invoiceId) {
    await applyPaymentToInvoice(connection, invoiceId, Number(payment.amount));
  } else {
    const billing = await getSetting("billing");
    const breakdown = details.breakdown ?? { subtotal: Number(payment.amount), taxRate: 0, taxAmount: 0, line: payment.description };
    const created = await createInvoice(connection, {
      clientId,
      clientProjectId: payment.client_project_id,
      billing: { name: details.name, company: details.company, email: details.email, phone: details.phone, address: details.address, gstin: details.gstin },
      items: [{ description: breakdown.line, quantity: 1, unit_price: breakdown.subtotal }],
      taxRate: breakdown.taxRate,
      amountPaid: Number(payment.amount),
      notes: billing.invoiceNotes || null,
    });
    invoiceId = created.id;
  }

  await execute(
    `UPDATE payments SET status = 'paid', method = ?, gateway_payment_id = COALESCE(?, gateway_payment_id), gateway_signature = COALESCE(?, gateway_signature),
       client_id = ?, invoice_id = ?, paid_at = ?, failure_reason = NULL WHERE id = ?`,
    [gateway.method, gateway.paymentId, gateway.signature, clientId, invoiceId, gateway.paidAt ?? new Date(), payment.id],
    connection
  );
  return invoiceId;
}

export type FinalizeResult = { status: "paid" | "already_paid" | "failed" | "pending"; reference: string; invoiceId?: number | null };

export async function finalizeGatewayPayment(orderId: string, paymentId: string, signature: string | null): Promise<FinalizeResult> {
  const payment = await queryOne<Payment>("SELECT * FROM payments WHERE gateway_order_id = ?", [orderId]);
  if (!payment) throw new PaymentError("Unknown order.");
  if (payment.status === "paid") return { status: "already_paid", reference: payment.reference, invoiceId: payment.invoice_id };

  // Confirm with Razorpay: amount, currency and order must match what we created.
  let gatewayPayment: razorpay.RazorpayPayment | null = null;
  try {
    gatewayPayment = await razorpay.fetchPayment(paymentId);
  } catch (error) {
    // The signature alone is cryptographic proof from Razorpay; we still record
    // the payment if the confirmation call is temporarily unavailable.
    if (!signature) throw error;
    console.warn("[payments] could not fetch payment from Razorpay, relying on verified signature", error);
  }
  if (gatewayPayment) {
    if (gatewayPayment.order_id !== orderId) throw new PaymentError("Payment does not belong to this order.");
    if (gatewayPayment.amount !== toPaise(Number(payment.amount)) || gatewayPayment.currency !== payment.currency) {
      throw new PaymentError("Payment amount does not match the order.");
    }
    if (gatewayPayment.status === "authorized") {
      gatewayPayment = await razorpay.capturePayment(paymentId, gatewayPayment.amount, gatewayPayment.currency);
    }
    if (gatewayPayment.status === "failed") {
      await markFailed(orderId, gatewayPayment.error_description ?? "Payment failed at the bank.");
      return { status: "failed", reference: payment.reference };
    }
    if (gatewayPayment.status !== "captured") return { status: "pending", reference: payment.reference };
  }

  const outcome = await transaction(async (connection) => {
    const locked = await queryOne<Payment>("SELECT * FROM payments WHERE id = ? FOR UPDATE", [payment.id], connection);
    if (!locked) throw new PaymentError("Payment disappeared.");
    if (locked.status === "paid") return { status: "already_paid" as const, invoiceId: locked.invoice_id };
    const invoiceId = await settle(connection, locked, { paymentId, signature, method: "razorpay" });
    return { status: "paid" as const, invoiceId };
  });

  if (outcome.status === "paid") void sendPaymentEmails(payment.id);
  return { ...outcome, reference: payment.reference };
}

export async function markFailed(orderId: string, reason: string) {
  await execute("UPDATE payments SET status = 'failed', failure_reason = ? WHERE gateway_order_id = ? AND status IN ('pending','processing')", [
    reason.slice(0, 400),
    orderId,
  ]);
}

/** Admin: re-check an order with Razorpay (useful locally where webhooks can't reach you). */
export async function syncWithGateway(paymentIdInDb: number) {
  const payment = await getPayment(paymentIdInDb);
  if (!payment?.gateway_order_id) throw new PaymentError("This payment has no Razorpay order yet.");
  if (payment.status === "paid") return "already_paid";
  const { items } = await razorpay.fetchOrderPayments(payment.gateway_order_id);
  const captured = items.find((item) => item.status === "captured" || item.status === "authorized");
  if (captured) {
    const result = await finalizeGatewayPayment(payment.gateway_order_id, captured.id, null);
    return result.status;
  }
  const failed = items.find((item) => item.status === "failed");
  if (failed) {
    await markFailed(payment.gateway_order_id, failed.error_description ?? "Payment failed.");
    return "failed";
  }
  return "pending";
}

export type ManualPaymentInput = {
  clientId: number;
  projectId: number | null;
  invoiceId: number | null;
  purpose: PaymentPurpose;
  method: Exclude<PaymentMethod, "razorpay">;
  description: string;
  amount: number;
  paidAt: Date;
  createdBy: number;
};

/** Records a payment received outside the website (bank transfer, cash…). */
export async function recordManualPayment(input: ManualPaymentInput) {
  const client = await queryOne<{ name: string; email: string; phone: string | null; company: string | null; gstin: string | null }>(
    "SELECT name, email, phone, company, gstin FROM clients WHERE id = ?",
    [input.clientId]
  );
  if (!client) throw new PaymentError("Choose a client.");
  const billing = await getSetting("billing");
  const taxRate = Number(billing.taxRate) || 0;
  const subtotal = round2(input.amount / (1 + taxRate / 100));
  const details = { ...client, breakdown: { subtotal, taxRate, taxAmount: round2(input.amount - subtotal), line: input.description } };

  return transaction(async (connection) => {
    const result = await execute(
      `INSERT INTO payments (reference, client_id, client_project_id, invoice_id, purpose, description, amount, status, method,
         payer_name, payer_email, payer_phone, billing_details, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [newReference(), input.clientId, input.projectId, input.invoiceId, input.purpose, input.description, round2(input.amount), input.method,
        client.name, client.email, client.phone, JSON.stringify(details), input.createdBy],
      connection
    );
    const payment = await queryOne<Payment>("SELECT * FROM payments WHERE id = ? FOR UPDATE", [result.insertId], connection);
    await settle(connection, payment!, { paymentId: null, signature: null, method: input.method, paidAt: input.paidAt });
    return result.insertId;
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function sendPaymentEmails(paymentId: number) {
  try {
    const payment = await getPayment(paymentId);
    if (!payment || payment.status !== "paid") return;
    const invoice = payment.invoice_id ? await getInvoice(payment.invoice_id) : null;
    const pdf = invoice ? await renderInvoicePdf(invoice.invoice, invoice.items) : null;
    const amount = formatMoney(payment.amount);
    const invoiceUrl = invoice ? `${env.siteUrl}/invoice/${invoice.invoice.public_token}` : null;
    const attachments = pdf && invoice ? [{ filename: `${invoice.invoice.invoice_number.replace(/\//g, "-")}.pdf`, content: Buffer.from(pdf) }] : undefined;

    if (payment.payer_email) {
      await sendMail({
        to: payment.payer_email,
        subject: `Payment received — ${amount}${invoice ? ` (Invoice ${invoice.invoice.invoice_number})` : ""}`,
        text: `Hi ${payment.payer_name ?? ""},\n\nWe've received your payment of ${amount} for "${payment.description}".\nReference: ${payment.reference}\n${invoiceUrl ? `Invoice: ${invoiceUrl}\n` : ""}\nThank you,\nAlfa Solution`,
        html: layout(
          "Payment received",
          `<p>Hi ${escapeHtml(payment.payer_name ?? "")},</p>
           <p>We've received your payment of <strong>${escapeHtml(amount)}</strong> for “${escapeHtml(payment.description)}”.</p>
           <p>Payment reference: <strong>${escapeHtml(payment.reference)}</strong></p>
           ${invoiceUrl ? `<p>Your invoice <strong>${escapeHtml(invoice!.invoice.invoice_number)}</strong> is attached. You can also <a href="${invoiceUrl}">download it here</a>.</p>` : ""}
           <p>Thank you for working with us.<br/>Alfa Solution</p>`
        ),
        attachments,
      });
    }
    await notifyTeam(
      `Payment received: ${amount} — ${payment.payer_name ?? "customer"}`,
      [
        ["Amount", amount],
        ["For", payment.description],
        ["Payer", `${payment.payer_name ?? ""} <${payment.payer_email ?? ""}>`],
        ["Reference", payment.reference],
        ["Razorpay payment", payment.gateway_payment_id ?? "—"],
        ["Invoice", invoice?.invoice.invoice_number ?? "—"],
      ],
      payment.payer_email ?? undefined,
      attachments
    );
  } catch (error) {
    console.error("[payments] failed to send payment emails", error);
  }
}
