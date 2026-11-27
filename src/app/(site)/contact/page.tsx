import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { getPackageBySlug, listServices } from "@/server/repos/content";
import { PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { ContactForm } from "@/components/site/ContactForm";

const SEO_DESCRIPTION =
  "Contact Alfa Solution for website, ecommerce, web app and mobile app development anywhere in India. We reply within one working day with next steps and an estimate.";

export async function generateMetadata(): Promise<Metadata> {
  // An entry for /contact in Admin → SEO → Page titles & descriptions takes priority over these.
  return buildMetadata({
    path: "/contact",
    title: "Contact Our Website Developers in India",
    description: SEO_DESCRIPTION,
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: packageSlug } = await searchParams;
  const [general, services, pkg] = await Promise.all([
    getSetting("site.general"),
    listServices(),
    packageSlug ? getPackageBySlug(packageSlug) : Promise.resolve(null),
  ]);
  const options = services.map((service) => service.title);
  if (pkg) options.unshift(`${pkg.name} package`);
  const whatsapp = general.whatsapp.replace(/\D/g, "");
  const phone = general.phone.replace(/\s+/g, "");

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Contact" }]}
        title="Talk to our website & app development team"
        lede="Tell us what you’re building — a few lines is enough. We work with businesses across India and reply within one working day with questions, a rough estimate and the next step."
      />
      <section className="bg-white">
        <div className="container-site grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.35fr_0.65fr]">
          <ContactForm
            services={options}
            defaultService={pkg ? `${pkg.name} package` : undefined}
            source={pkg ? "pricing" : "contact"}
          />
          <aside className="space-y-8 lg:border-l lg:border-line lg:pl-10">
            <div>
              <h2 className="text-sm font-semibold text-slate">Email</h2>
              <a
                href={`mailto:${general.email}`}
                className="mt-1 block text-lg font-semibold hover:text-accent"
              >
                {general.email}
              </a>
            </div>
            {general.phone ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">Phone</h2>
                <a
                  href={`tel:${phone}`}
                  className="mt-1 block text-lg font-semibold hover:text-accent"
                >
                  {general.phone}
                </a>
              </div>
            ) : null}
            {whatsapp ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">WhatsApp</h2>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-lg font-semibold hover:text-accent"
                >
                  Message us
                </a>
              </div>
            ) : null}
            {general.address ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">Address</h2>
                <address className="mt-1 whitespace-pre-line not-italic">
                  {general.address}
                </address>
                <p className="mt-1 text-sm text-slate">
                  Serving clients across India, online and on-site.
                </p>
              </div>
            ) : null}
            {general.hours ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">
                  Working hours
                </h2>
                <p className="mt-1">{general.hours}</p>
              </div>
            ) : null}
            <div className="rounded-[var(--radius-card)] bg-paper p-6">
              <h2 className="text-lg">What happens next</h2>
              <ol className="mt-4 space-y-3 text-[0.95rem] text-slate">
                <li>
                  1. We read your message and reply with questions within a
                  working day.
                </li>
                <li>
                  2. A short call to understand goals, scope and timeline.
                </li>
                <li>3. A written proposal with a fixed price and schedule.</li>
              </ol>
            </div>
            <p className="text-sm text-slate">
              Want to see prices first?{" "}
              <Link href="/pricing" className="link">
                View our packages
              </Link>
              . Have a quick question?{" "}
              <Link href="/faq" className="link">
                Read the FAQ
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>

      {/* Map — follows the address saved in Admin → Settings → Company & contact details */}
      {general.address ? (
        <section className="bg-white pb-16 sm:pb-20">
          <div className="container-site">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate">Visit us</h2>
                <p className="mt-1 text-lg font-semibold">{general.address}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(general.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Get directions
              </a>
            </div>
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
              <iframe
                title={`Map showing ${general.address}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(general.address)}&z=15&output=embed`}
                className="block h-[360px] w-full sm:h-[440px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Alfa Solution",
          url: `${env.siteUrl}/contact`,
          description: SEO_DESCRIPTION,
          inLanguage: "en-IN",
          mainEntity: {
            "@type": "ProfessionalService",
            name: general.companyName,
            url: env.siteUrl,
            image: `${env.siteUrl}/images/logo-black.png`,
            email: general.email || undefined,
            telephone: general.phone || undefined,
            areaServed: { "@type": "Country", name: "India" },
            address: {
              "@type": "PostalAddress",
              streetAddress: general.address || undefined,
              addressCountry: "IN",
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: general.phone || undefined,
              email: general.email || undefined,
              areaServed: "IN",
              availableLanguage: ["English", "Hindi"],
            },
          },
        }}
      />
    </>
  );
}
