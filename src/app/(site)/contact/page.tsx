import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { getSetting } from "@/server/settings";
import { getPackageBySlug, listServices } from "@/server/repos/content";
import { PageIntro } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/contact", title: "Contact" });
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const { package: packageSlug } = await searchParams;
  const [general, services, pkg] = await Promise.all([
    getSetting("site.general"),
    listServices(),
    packageSlug ? getPackageBySlug(packageSlug) : Promise.resolve(null),
  ]);
  const options = services.map((service) => service.title);
  if (pkg) options.unshift(`${pkg.name} package`);
  const whatsapp = general.whatsapp.replace(/\D/g, "");

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Contact" }]}
        title="Tell us what you’re building."
        lede="A few lines is enough to start. We reply within one working day with questions, a rough estimate and the next step."
      />
      <section className="bg-white">
        <div className="container-site grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.35fr_0.65fr]">
          <ContactForm services={options} defaultService={pkg ? `${pkg.name} package` : undefined} source={pkg ? "pricing" : "contact"} />
          <aside className="space-y-8 lg:border-l lg:border-line lg:pl-10">
            <div>
              <h2 className="text-sm font-semibold text-slate">Email</h2>
              <a href={`mailto:${general.email}`} className="mt-1 block text-lg font-semibold hover:text-accent">
                {general.email}
              </a>
            </div>
            {general.phone ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">Phone</h2>
                <a href={`tel:${general.phone.replace(/\s+/g, "")}`} className="mt-1 block text-lg font-semibold hover:text-accent">
                  {general.phone}
                </a>
              </div>
            ) : null}
            {whatsapp ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">WhatsApp</h2>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-1 block text-lg font-semibold hover:text-accent">
                  Message us
                </a>
              </div>
            ) : null}
            {general.hours ? (
              <div>
                <h2 className="text-sm font-semibold text-slate">Working hours</h2>
                <p className="mt-1">{general.hours}</p>
              </div>
            ) : null}
            <div className="rounded-[var(--radius-card)] bg-paper p-6">
              <h2 className="text-lg">What happens next</h2>
              <ol className="mt-4 space-y-3 text-[0.95rem] text-slate">
                <li>1. We read your message and reply with questions within a working day.</li>
                <li>2. A short call to understand goals, scope and timeline.</li>
                <li>3. A written proposal with a fixed price and schedule.</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
