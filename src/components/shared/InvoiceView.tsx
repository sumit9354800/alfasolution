import type { Invoice, InvoiceItem } from "@/server/finance/invoices";
import type { BillingSettings } from "@/server/settings";
import { formatDate, formatMoney, round2 } from "@/lib/format";

const STATUS: Record<Invoice["status"], { label: string; className: string }> =
  {
    draft: { label: "Draft", className: "bg-paper text-slate" },
    issued: {
      label: "Awaiting payment",
      className: "bg-accent-tint text-accent-deep",
    },
    partially_paid: {
      label: "Partially paid",
      className: "bg-amber-50 text-warning",
    },
    paid: { label: "Paid", className: "bg-emerald-50 text-success" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-danger" },
  };

export function InvoiceView({
  invoice,
  items,
  billing,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  billing: BillingSettings;
}) {
  const balance = Math.max(
    0,
    Number(invoice.total) - Number(invoice.amount_paid),
  );
  const status = STATUS[invoice.status];
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-10">
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row">
        <div>
          <p className="text-sm text-slate">Invoice</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">
            {invoice.invoice_number}
          </h1>
          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <div className="text-sm sm:text-right">
          <p className="font-semibold">{billing.legalName}</p>
          <p className="whitespace-pre-line text-slate">{billing.address}</p>
          {billing.gstin ? (
            <p className="text-slate">GSTIN {billing.gstin}</p>
          ) : null}
          <p className="text-slate">{billing.email}</p>
        </div>
      </header>
      <div className="grid gap-6 border-b border-line py-8 text-sm sm:grid-cols-2">
        <div>
          <p className="text-slate">Billed to</p>
          <p className="mt-1 font-semibold">{invoice.billing_name}</p>
          {invoice.billing_company ? <p>{invoice.billing_company}</p> : null}
          {invoice.billing_address ? (
            <p className="whitespace-pre-line text-slate">
              {invoice.billing_address}
            </p>
          ) : null}
          <p className="text-slate">{invoice.billing_email}</p>
          {invoice.billing_gstin ? (
            <p className="text-slate">GSTIN {invoice.billing_gstin}</p>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-y-1.5 sm:text-right">
          <dt className="text-slate">Issued</dt>
          <dd>{formatDate(invoice.issue_date, "long")}</dd>
          {invoice.due_date ? (
            <>
              <dt className="text-slate">Due</dt>
              <dd>{formatDate(invoice.due_date, "long")}</dd>
            </>
          ) : null}
          <dd>
            {invoice.due_date
              ? formatDate(invoice.due_date, "long")
              : "On receipt"}
          </dd>
          {invoice.project_title ? (
            <>
              <dt className="text-slate">Project</dt>
              <dd>{invoice.project_title}</dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-line bg-white p-4 sm:p-5"
          >
            {/* Description - Always Top */}
            <div className="border-b border-line pb-4">
              <p className="mb-1 text-xs font-medium text-slate">Description</p>

              <p className="break-words text-sm leading-6 text-ink">
                {item.description}
              </p>
            </div>

            {/* Qty, Rate, Amount - Always Bottom */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="min-w-0">
                <p className="text-xs text-slate">Qty</p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {Number(item.quantity)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate">Rate</p>
                <p className="mt-1 break-words text-sm font-medium tabular-nums">
                  {formatMoney(item.unit_price)}
                </p>
              </div>

              <div className="min-w-0 text-right">
                <p className="text-xs text-slate">Amount</p>
                <p className="mt-1 break-words text-sm font-semibold tabular-nums">
                  {formatMoney(item.amount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate">Subtotal</dt>
          <dd>{formatMoney(invoice.subtotal)}</dd>
        </div>
        {Number(invoice.discount) > 0 ? (
          <div className="flex justify-between">
            <dt className="text-slate">Discount</dt>
            <dd>−{formatMoney(invoice.discount)}</dd>
          </div>
        ) : null}
        {Number(invoice.tax_rate) > 0 ? (
          <>
            <div className="flex justify-between">
              <dt className="text-slate">
                CGST ({Number(invoice.tax_rate) / 2}%)
              </dt>
              <dd>{formatMoney(round2(Number(invoice.tax_amount) / 2))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate">
                SGST ({Number(invoice.tax_rate) / 2}%)
              </dt>
              <dd>
                {formatMoney(
                  round2(
                    Number(invoice.tax_amount) -
                      round2(Number(invoice.tax_amount) / 2),
                  ),
                )}
              </dd>
            </div>
          </>
        ) : null}
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(invoice.total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate">Paid</dt>
          <dd>{formatMoney(invoice.amount_paid)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Balance</dt>
          <dd>{formatMoney(balance)}</dd>
        </div>
      </dl>
      {invoice.notes ? (
        <p className="mt-8 border-t border-line pt-6 text-sm text-slate">
          {invoice.notes}
        </p>
      ) : null}
    </article>
  );
}
