import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { listServices } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { formatMoney, canOptimizeImage } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/services", title: "Services" });
}

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Services" }]}
        title="Everything a business needs to run online — designed and built properly."
        lede="Pick one service or bring us the whole product. Every engagement starts with a fixed scope, a clear timeline and one team accountable for the result."
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
                        <Image src={service.image} alt="" fill sizes="176px" className="object-cover" unoptimized={!canOptimizeImage(service.image)} />
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
      <CtaBand title="Not sure which service you need?" body="Describe the problem. We'll recommend the smallest thing that solves it." label="Talk to us" href="/contact" />
    </>
  );
}
