import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { getServiceBySlug, listPortfolio, listServices } from "@/server/repos/content";
import { env } from "@/server/env";
import { PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ContactForm } from "@/components/site/ContactForm";
import { formatMoney, canOptimizeImage } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return buildMetadata({
    path: `/services/${service.slug}`,
    title: service.seo_title || service.title,
    description: service.seo_description || service.short_description,
    image: service.image,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [projects, services] = await Promise.all([listPortfolio(), listServices()]);
  const related = projects.filter((project) => project.service_id === service.id).slice(0, 2);
  const others = services.filter((item) => item.id !== service.id).slice(0, 4);

  return (
    <>
      <PageIntro crumbs={[{ label: "Services", href: "/services" }, { label: service.title }]} title={service.title} lede={service.short_description}>
        <div className="flex flex-wrap items-center gap-3">
          <a href="#enquire" className="btn btn-primary">
            Discuss your project
          </a>
          <Link href="/pricing" className="btn btn-outline">
            See packages
          </Link>
          {service.starting_price ? <span className="text-sm text-slate">Projects from {formatMoney(service.starting_price)}</span> : null}
        </div>
      </PageIntro>

      <section className="bg-white">
        <div className="container-site grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            {service.description ? <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: service.description }} /> : null}
            {service.features.length ? (
              <div className="mt-12">
                <h2 className="text-2xl">What’s included</h2>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex gap-3 border-b border-line pb-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <aside className="space-y-8">
            {service.image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
                <Image src={service.image} alt="" fill sizes="(max-width: 1024px) 100vw, 35vw" className="object-cover" unoptimized={!canOptimizeImage(service.image)} />
              </div>
            ) : null}
            {service.deliverables.length ? (
              <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
                <h2 className="text-lg">You receive</h2>
                <ul className="mt-4 space-y-2.5 text-[0.95rem] text-slate">
                  {service.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {service.technologies.length ? (
              <div>
                <h2 className="text-lg">Typical stack</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {service.technologies.map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {service.process_steps.length ? (
        <section className="bg-ink text-white">
          <div className="container-site py-16 sm:py-20">
            <h2 className="display-md">How we deliver it</h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {service.process_steps.map((step, index) => (
                <li key={step.title} className="border-t border-white/15 pt-5">
                  <span className="font-display text-sm text-accent-light">Step {index + 1}</span>
                  <h3 className="mt-2 text-xl">{step.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-white/60">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-paper">
          <div className="container-site py-16 sm:py-20">
            <h2 className="display-md">{service.title} we’ve shipped</h2>
            <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
              {related.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="enquire" className="scroll-mt-24 bg-white">
        <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="display-md">Tell us about your project</h2>
            <p className="mt-4 text-slate">We reply within one working day with questions, a rough estimate and next steps.</p>
            {others.length ? (
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-slate">Other services</h3>
                <ul className="mt-3 space-y-2">
                  {others.map((item) => (
                    <li key={item.id}>
                      <Link href={`/services/${item.slug}`} className="link">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <ContactForm services={services.map((s) => s.title)} defaultService={service.title} source={`service:${service.slug}`} />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.short_description,
          provider: { "@type": "Organization", name: "Alfa Solution", url: env.siteUrl },
          areaServed: "IN",
          url: `${env.siteUrl}/services/${service.slug}`,
          ...(service.starting_price ? { offers: { "@type": "Offer", priceCurrency: "INR", price: service.starting_price } } : {}),
        }}
      />
    </>
  );
}
