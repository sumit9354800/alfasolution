import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getPackageBySlug, isBuyable } from "@/server/repos/content";
import { quotePackage } from "@/server/finance/payments";
import { getSetting } from "@/server/settings";
import { env } from "@/server/env";
import { Breadcrumbs } from "@/components/site/blocks";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { formatMoney } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Checkout | Alfa Solution", robots: { index: false, follow: false } };

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg || !isBuyable(pkg)) notFound();
  const billing = await getSetting("billing");
  const [full, advance] = await Promise.all([quotePackage(pkg, "full"), quotePackage(pkg, "advance")]);
  const tax = billing.taxLabel || "GST";
  const detail = (q: typeof full) => (q.taxAmount > 0 ? `${formatMoney(q.subtotal)} + ${formatMoney(q.taxAmount)} ${tax} (${q.taxRate}%)` : "No tax applied");

  return (
    <section className="bg-paper">
      <div className="container-site py-12 sm:py-16">
        <Breadcrumbs items={[{ label: "Pricing", href: "/pricing" }, { label: "Checkout" }]} />
        <h1 className="display-md mt-6">Checkout — {pkg.name}</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
            <CheckoutForm
              mode="package"
              slug={pkg.slug}
              enabled={env.razorpay.configured}
              quotes={[
                { option: "full", label: "Pay in full", total: formatMoney(full.total), detail: detail(full) },
                { option: "advance", label: `${pkg.advance_percent}% advance now`, total: formatMoney(advance.total), detail: `${detail(advance)}. Balance invoiced on delivery.` },
              ]}
            />
          </div>
          <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-white p-6">
            <h2 className="text-lg">{pkg.name}</h2>
            {pkg.tagline ? <p className="mt-1 text-sm text-slate">{pkg.tagline}</p> : null}
            <p className="mt-4 font-display text-3xl font-semibold">{formatMoney(pkg.price)}</p>
            <p className="text-sm text-slate">{pkg.price_note || `excl. ${tax}`}</p>
            <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
              {pkg.features.map((f) => (
                <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />{f}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-slate">
              Prefer to talk first? <Link href={`/contact?package=${pkg.slug}`} className="link">Ask a question</Link>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
