import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { listServices } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatMoney, canOptimizeImage } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  // An entry for /services in Admin → SEO → Page titles & descriptions takes priority over these.
  return buildMetadata({
    path: "/services",
    title: "Web & App Development Services in India",
    description:
      "Website development, ecommerce, web applications, mobile apps, UI/UX design and SEO for businesses across India — planned, built and supported by one team.",
  });
}

const HOW_WE_WORK = [
  ["Anywhere in India", "We work with clients across India over video calls, WhatsApp and shared project boards — no office visits needed."],
  ["Fixed scope and price", "You get a written proposal with deliverables, timeline and cost before any work starts."],
  ["Pay securely online", "Advance and milestone payments by UPI, card or net banking, with a GST invoice for every payment."],
];

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Services" }]}
        title="Website, app & software development services in India"
        lede="Everything a business needs to run online — designed and built properly. Pick one service or bring us the whole product: every engagement starts with a fixed scope, a clear timeline and one team accountable for the result."
      />
      <section className="bg-white">
        <div className="container-site py-16 sm:py-20">
          {services.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {services.map((service) => (
                <li key={service.id}>
                  <Link href={`/services/${service.slug}`} className="group grid gap-6 py-10 md:grid-cols-[1fr_1.3fr_auto] md:items-start md:gap-10">
                    <div>
                      <h2 className="text-3xl transition-colors group-hover:text-accent">{service.title}</h2>
                      {service.starting_price ? <p className="mt-2 text-sm text-slate">From {formatMoney(service.starting_price)}</p> : null}
                    </div>
                    <div>
                      <p className="text-[1.05rem] leading-relaxed text-slate">{service.short_description}</p>
                      {service.features.length ? (
                        <ul className="mt-5 flex flex-wrap gap-2">
                          {service.features.slice(0, 5).map((feature) => (
                            <li key={feature} className="chip">
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    {service.image ? (
                      <div className="relative hidden aspect-[4/3] w-44 overflow-hidden rounded-[var(--radius-card)] lg:block">
                        <Image src={service.image} alt={service.title} fill sizes="176px" className="object-cover" unoptimized={!canOptimizeImage(service.image)} />
                      </div>
                    ) : (
                      <span className="hidden w-44 lg:block" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Services are being updated" body="Tell us what you need and we'll tell you how we can help." action={<Link href="/contact" className="btn btn-dark">Contact us</Link>} />
          )}
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-site py-16 sm:py-20">
          <h2 className="display-md max-w-2xl">Working with clients across India</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {HOW_WE_WORK.map(([title, body]) => (
              <div key={title} className="border-t border-line pt-5">
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-slate">
            See <Link href="/pricing" className="link">packages and prices</Link>, or browse <Link href="/work" className="link">projects we’ve delivered</Link>.
          </p>
        </div>
      </section>

      <CtaBand title="Not sure which service you need?" body="Describe the problem. We'll recommend the smallest thing that solves it." label="Talk to us" href="/contact" />

      {services.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alfa Solution services",
            itemListElement: services.map((service, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Service",
                name: service.title,
                description: service.short_description,
                url: `${env.siteUrl}/services/${service.slug}`,
                areaServed: { "@type": "Country", name: "India" },
                provider: { "@type": "Organization", name: "Alfa Solution", url: env.siteUrl },
              },
            })),
          }}
        />
      ) : null}
    </>
  );
}