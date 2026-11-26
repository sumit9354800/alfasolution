import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getPaymentByReference } from "@/server/finance/payments";
import { queryOne } from "@/server/db";
import { AutoRefresh } from "@/components/site/AutoRefresh";
import { formatDateTime, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Payment status | Alfa Solution", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function PaymentStatusPage({ searchParams }: Props) {
  const { ref = "" } = await searchParams;
  const payment = await getPaymentByReference(ref.toUpperCase());
  const invoice = payment?.invoice_id ? await queryOne<{ public_token: string; invoice_number: string }>("SELECT public_token, invoice_number FROM invoices WHERE id = ?", [payment.invoice_id]) : null;

  return (
    <section className="bg-paper">
      <div className="container-site max-w-2xl py-16 sm:py-24">
        {!payment ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-8">
            <h1 className="text-2xl">We couldn’t find that payment</h1>
            <p className="mt-2 text-slate">Check the link from your email, or <Link href="/contact" className="link">contact us</Link> with your payment reference.</p>
          </div>
        ) : payment.status === "paid" ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-8">
            <CheckCircle2 size={36} className="text-success" aria-hidden="true" />
            <h1 className="mt-4 text-3xl">Payment successful</h1>
            <p className="mt-2 text-slate">Thank you, {payment.payer_name}. A receipt and invoice have been sent to {payment.payer_email}.</p>
            <dl className="mt-6 divide-y divide-line border-y border-line text-[0.95rem]">
              {[
                ["Amount", formatMoney(payment.amount)],
                ["For", payment.description],
                ["Reference", payment.reference],
                ["Paid on", formatDateTime(payment.paid_at)],
                ...(invoice ? [["Invoice", invoice.invoice_number]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-slate">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {invoice ? <Link href={`/invoice/${invoice.public_token}`} className="btn btn-dark">View invoice</Link> : null}
              {invoice ? <a href={`/api/invoices/${invoice.public_token}/pdf`} className="btn btn-outline">Download PDF</a> : null}
            </div>
          </div>
        ) : payment.status === "failed" ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-8">
            <XCircle size={36} className="text-danger" aria-hidden="true" />
            <h1 className="mt-4 text-3xl">Payment didn’t go through</h1>
            <p className="mt-2 text-slate">{payment.failure_reason ?? "Your bank declined the payment."} You haven’t been charged. If money was debited, it will be refunded automatically by your bank.</p>
            <div className="mt-6 flex gap-3">
              {payment.link_token ? <Link href={`/pay/${payment.link_token}`} className="btn btn-dark">Try again</Link> : <Link href="/pricing" className="btn btn-dark">Back to pricing</Link>}
              <Link href="/contact" className="btn btn-outline">Get help</Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-8">
            <Clock size={36} className="text-warning" aria-hidden="true" />
            <h1 className="mt-4 text-3xl">Confirming your payment</h1>
            <p className="mt-2 text-slate">We’re waiting for confirmation from the bank. This page updates automatically — it usually takes a few seconds.</p>
            <p className="mt-4 text-sm text-slate">Reference: {payment.reference}</p>
            <AutoRefresh seconds={5} />
          </div>
        )}
      </div>
    </section>
  );
}
