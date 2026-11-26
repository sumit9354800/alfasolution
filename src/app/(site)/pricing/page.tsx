import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { buildMetadata } from "@/server/seo";
import { getSetting } from "@/server/settings";
import { isBuyable, listFaqs, listPackages, type PricingPackage } from "@/server/repos/content";
import { FaqList, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatMoney } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/pricing", title: "Pricing & packages" });
}

const CATEGORY_LABELS: Record<PricingPackage["category"], { title: string; lede: string }> = {
  website: { title: "Website packages", lede: "Fixed-scope websites with design, CMS, SEO setup, hosting and support included." },
  application: { title: "Application packages", lede: "Mobile and web applications are priced on scope. These packages show what’s typically included." },
  other: { title: "Other services", lede: "" },
};

function PackageCard({ pkg, taxLabel }: { pkg: PricingPackage; taxLabel: string }) {
  const buyable = isBuyable(pkg);
  const featured = Boolean(pkg.is_featured);
  return (
    <article className={`relative flex flex-col rounded-[var(--radius-card)] border p-7 ${featured ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
      {featured ? <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Most chosen</span> : null}
      <h3 className="text-2xl">{pkg.name}</h3>
      {pkg.tagline ? <p className={`mt-2 min-h-12 text-[0.95rem] ${featured ? "text-white/65" : "text-slate"}`}>{pkg.tagline}</p> : null}
      <div className="mt-6">
        {pkg.price ? (
          <>
            <p className="font-display text-4xl font-semibold tracking-tight">{formatMoney(pkg.price)}</p>
            <p className={`mt-1 text-sm ${featured ? "text-white/55" : "text-slate"}`}>{pkg.price_note || `one-time, excl. ${taxLabel}`}</p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-semibold tracking-tight">Custom quote</p>
            <p className={`mt-1 text-sm ${featured ? "text-white/55" : "text-slate"}`}>{pkg.price_note || "based on your scope"}</p>
          </>
        )}
      </div>
      <ul className={`mt-7 flex-1 space-y-2.5 border-t pt-6 text-[0.95rem] ${featured ? "border-white/15" : "border-line"}`}>
        {pkg.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check size={17} className={`mt-0.5 shrink-0 ${featured ? "text-accent-light" : "text-accent"}`} aria-hidden="true" />
            <span className={featured ? "text-white/85" : ""}>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-2">
        {buyable ? (
          <>
            <Link href={`/checkout/${pkg.slug}`} className={`btn ${featured ? "bg-white text-ink hover:bg-accent-tint" : "btn-primary"}`}>
              Buy this package
            </Link>
            <p className={`text-center text-xs ${featured ? "text-white/55" : "text-slate"}`}>Pay in full or {pkg.advance_percent}% advance</p>
          </>
        ) : (
          <Link href={`/contact?package=${pkg.slug}`} className={`btn ${featured ? "bg-white text-ink hover:bg-accent-tint" : "btn-dark"}`}>
            Request a quote
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function PricingPage() {
  const [packages, billing, faqs] = await Promise.all([listPackages(), getSetting("billing"), listFaqs({ category: "Payments" })]);
  const categories = (["website", "application", "other"] as const).filter((c) => packages.some((p) => p.category === c));

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Pricing" }]}
        title="Clear packages. Secure online payment."
        lede="Choose a package and pay online, or ask for a quote tailored to your scope. Every payment gets an instant GST invoice."
      >
        {categories.length > 1 ? (
          <nav aria-label="Package types" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <a key={c} href={`#${c}`} className="chip hover:text-ink">{CATEGORY_LABELS[c].title}</a>
            ))}
          </nav>
        ) : null}
      </PageIntro>

      {categories.map((category, index) => (
        <section key={category} id={category} className={`scroll-mt-24 ${index % 2 ? "bg-white" : "bg-paper"}`}>
          <div className="container-site py-16 sm:py-20">
            <h2 className="display-md">{CATEGORY_LABELS[category].title}</h2>
            {CATEGORY_LABELS[category].lede ? <p className="mt-3 max-w-2xl text-slate">{CATEGORY_LABELS[category].lede}</p> : null}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.filter((p) => p.category === category).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} taxLabel={billing.taxLabel || "GST"} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-white">
        <div className="container-site grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="display-md">Paying online</h2>
            <p className="mt-4 text-slate">
              Payments are processed by Razorpay — UPI, cards, net banking and wallets. Your payment details never touch our servers, and every
              payment is verified on our side before it’s confirmed.
            </p>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: "Alfa Solution packages",
          itemListElement: packages
            .filter((p) => p.price)
            .map((p) => ({ "@type": "Offer", name: p.name, description: p.tagline ?? undefined, price: p.price, priceCurrency: "INR" })),
        }}
      />
    </>
  );
}
