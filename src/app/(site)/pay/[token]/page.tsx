import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPaymentByLinkToken, isLinkUsable, PAYMENT_PURPOSES } from "@/server/finance/payments";
import { parseJson } from "@/server/db";
import { env } from "@/server/env";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Make a payment | Alfa Solution", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

export default async function PayLinkPage({ params }: Props) {
  const { token } = await params;
  const payment = await getPaymentByLinkToken(token);
  if (!payment) notFound();
  const usable = isLinkUsable(payment);
  const details = parseJson<Record<string, string | null>>(payment.billing_details, {});

  return (
    <section className="bg-paper">
      <div className="container-site max-w-4xl py-12 sm:py-16">
        <p className="text-sm text-slate">Payment request · Ref {payment.reference}</p>
        <h1 className="display-md mt-2">{payment.description}</h1>
        <dl className="mt-8 grid gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:grid-cols-3">
          <div><dt className="text-sm text-slate">Amount</dt><dd className="font-display text-3xl font-semibold">{formatMoney(payment.amount)}</dd></div>
          <div><dt className="text-sm text-slate">For</dt><dd className="font-medium">{payment.project_title ?? PAYMENT_PURPOSES[payment.purpose]}</dd></div>
          <div><dt className="text-sm text-slate">{payment.status === "paid" ? "Paid on" : "Valid until"}</dt><dd className="font-medium">{formatDate(payment.status === "paid" ? payment.paid_at : payment.link_expires_at, "long")}</dd></div>
        </dl>

        {payment.status === "paid" ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-6">
            <h2 className="text-xl">This request has been paid</h2>
            <p className="mt-2 text-slate">Thank you. <Link className="link" href={`/payment/status?ref=${payment.reference}`}>View receipt and invoice</Link>.</p>
          </div>
        ) : !usable ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-6">
            <h2 className="text-xl">This payment link has expired</h2>
            <p className="mt-2 text-slate">Please <Link href="/contact" className="link">contact us</Link> for a new link.</p>
          </div>
        ) : (
          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
            <CheckoutForm
              mode="link"
              token={token}
              amountLabel={formatMoney(payment.amount)}
              enabled={env.razorpay.configured}
              prefill={{ name: details.name ?? "", email: details.email ?? "", phone: details.phone ?? "", company: details.company ?? "", gstin: details.gstin ?? "", address: details.address ?? "" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
