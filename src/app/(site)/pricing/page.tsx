import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import {
  isBuyable,
  listFaqs,
  listPackages,
  type PricingPackage,
} from "@/server/repos/content";
import { FaqList, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatMoney } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const packages = await listPackages();
  const prices = packages.map((p) => Number(p.price)).filter((p) => p > 0);
  const from = prices.length
    ? ` Packages start at ${formatMoney(Math.min(...prices))}.`
    : "";
  // An entry for /pricing in Admin → SEO → Page titles & descriptions takes priority over these.
  return buildMetadata({
    path: "/pricing",
    title: "Website Development Packages & Prices in India",
    description: `Clear website and app development packages for Indian businesses, with online payment and GST invoices.${from}`,
  });
}

const CATEGORY_LABELS: Record<
  PricingPackage["category"],
  { title: string; lede: string }
> = {
  website: {
    title: "Website packages",
    lede: "Fixed-scope websites with design, CMS, SEO setup, hosting and support included.",
  },
  application: {
    title: "Application packages",
    lede: "Mobile and web applications are priced on scope. These packages show what’s typically included.",
  },
  other: { title: "Other services", lede: "" },
};

const COST_FACTORS = [
  [
    "Number of pages",
    "A 5-page business site and a 20-page site with service and location pages take very different amounts of design and content work.",
  ],
  [
    "Custom design or template",
    "Custom design is planned around your brand and customers; it takes longer than adapting a ready-made theme.",
  ],
  [
    "Online store features",
    "Products, cart, payment gateway, shipping and order management add development and testing time.",
  ],
  [
    "Integrations",
    "CRMs, WhatsApp, booking tools, ERPs and custom admin panels each add scope.",
  ],
  [
    "Content and SEO",
    "Writing copy, product data, photography and an SEO plan can be done by you or by us.",
  ],
  [
    "Support after launch",
    "Ongoing updates, security, backups and improvements are priced separately as a monthly plan.",
  ],
];

function PackageCard({
  pkg,
  taxLabel,
}: {
  pkg: PricingPackage;
  taxLabel: string;
}) {
  const buyable = isBuyable(pkg);
  const featured = Boolean(pkg.is_featured);
  return (
    <article
      id={pkg.slug}
      className={`relative flex scroll-mt-28 flex-col rounded-[var(--radius-card)] border p-7 ${featured ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
    >
      {featured ? (
        <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
          Most chosen
        </span>
      ) : null}
      <h3 className="text-2xl">{pkg.name}</h3>
      {pkg.tagline ? (
        <p
          className={`mt-2 min-h-12 text-[0.95rem] ${featured ? "text-white/65" : "text-slate"}`}
        >
          {pkg.tagline}
        </p>
      ) : null}
      <div className="mt-6">
        {pkg.price ? (
          <>
            <p className="font-display text-4xl font-semibold tracking-tight">
              {formatMoney(pkg.price)}
            </p>
            <p
              className={`mt-1 text-sm ${featured ? "text-white/55" : "text-slate"}`}
            >
              {pkg.price_note || `one-time, excl. ${taxLabel}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-semibold tracking-tight">
              Custom quote
            </p>
            <p
              className={`mt-1 text-sm ${featured ? "text-white/55" : "text-slate"}`}
            >
              {pkg.price_note || "based on your scope"}
            </p>
          </>
        )}
      </div>
      <ul
        className={`mt-7 flex-1 space-y-2.5 border-t pt-6 text-[0.95rem] ${featured ? "border-white/15" : "border-line"}`}
      >
        {pkg.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <Check
              size={17}
              className={`mt-0.5 shrink-0 ${featured ? "text-accent-light" : "text-accent"}`}
              aria-hidden="true"
            />
            <span className={featured ? "text-white/85" : ""}>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-2">
        {buyable ? (
          <>
            <Link
              href={`/checkout/${pkg.slug}`}
              className={`btn ${featured ? "bg-white text-ink hover:bg-accent-tint" : "btn-primary"}`}
            >
              Buy this package
            </Link>
            <p
              className={`text-center text-xs ${featured ? "text-white/55" : "text-slate"}`}
            >
              Pay in full or {pkg.advance_percent}% advance
            </p>
          </>
        ) : (
          <Link
            href={`/contact?package=${pkg.slug}`}
            className={`btn ${featured ? "bg-white text-ink hover:bg-accent-tint" : "btn-dark"}`}
          >
            Request a quote
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function PricingPage() {
  const [packages, billing, faqs] = await Promise.all([
    listPackages(),
    getSetting("billing"),
    listFaqs({ category: "Payments" }),
  ]);
  const categories = (["website", "application", "other"] as const).filter(
    (c) => packages.some((p) => p.category === c),
  );
  const taxLabel = billing.taxLabel || "GST";

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Pricing" }]}
        title="Website & app development packages and prices in India"
        lede={`Clear packages with a fixed scope. Choose one and pay online, or ask for a quote tailored to your project. Every payment gets an instant ${taxLabel} invoice.`}
      >
        {categories.length > 1 ? (
          <nav aria-label="Package types" className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <a key={c} href={`#${c}`} className="chip hover:text-ink">
                {CATEGORY_LABELS[c].title}
              </a>
            ))}
          </nav>
        ) : null}
      </PageIntro>

      {categories.map((category, index) => (
        <section
          key={category}
          id={category}
          className={`scroll-mt-24 ${index % 2 ? "bg-white" : "bg-paper"}`}
        >
          <div className="container-site py-16 sm:py-20">
            <h2 className="display-md">{CATEGORY_LABELS[category].title}</h2>
            {CATEGORY_LABELS[category].lede ? (
              <p className="mt-3 max-w-2xl text-slate">
                {CATEGORY_LABELS[category].lede}
              </p>
            ) : null}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages
                .filter((p) => p.category === category)
                .map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} taxLabel={taxLabel} />
                ))}
            </div>
          </div>
        </section>
      ))}

      {/* Real content for “website development cost in India” searches */}
      <section className="border-t border-line bg-white">
        <div className="container-site py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="display-md">
              What affects the cost of a website in India?
            </h2>
            <p className="mt-4 text-slate">
              Packages cover the most common needs. If your project is
              different, these are the things that change the price — tell us
              which apply and we’ll send a fixed quote.
            </p>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {COST_FACTORS.map(([title, body]) => (
              <div key={title} className="border-t border-line pt-5">
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate">
                  {body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-slate">
            Not sure what you need? See{" "}
            <Link href="/services" className="link">
              all our services
            </Link>
            , read our{" "}
            <Link href="/blog" className="link">
              guides
            </Link>
            , or{" "}
            <Link href="/contact" className="link">
              ask for a free estimate
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-site grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="display-md">Paying online</h2>
            <p className="mt-4 text-slate">
              Payments are processed by Razorpay — UPI, cards, net banking and
              wallets. Your payment details never touch our servers, and every
              payment is verified on our side before it’s confirmed.
            </p>
          </div>
          {/* FAQ schema lives only on /faq to avoid duplicate markup */}
          <FaqList items={faqs} withSchema={false} />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Website and app development",
          serviceType: "Website development",
          url: `${env.siteUrl}/pricing`,
          areaServed: { "@type": "Country", name: "India" },
          provider: {
            "@type": "Organization",
            name: "Alfa Solution",
            url: env.siteUrl,
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Alfa Solution packages",
            itemListElement: packages
              .filter((p) => Number(p.price) > 0)
              .map((p) => ({
                "@type": "Offer",
                name: p.name,
                description: p.tagline ?? undefined,
                url: `${env.siteUrl}/pricing#${p.slug}`,
                priceSpecification: {
                  "@type": "PriceSpecification",
                  price: Number(p.price),
                  priceCurrency: "INR",
                  valueAddedTaxIncluded: false,
                },
                availability: "https://schema.org/InStock",
              })),
          },
        }}
      />
    </>
  );
}
