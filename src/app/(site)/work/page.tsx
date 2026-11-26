import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { listPortfolio, listServices } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { ProjectCard } from "@/components/site/ProjectCard";

type Props = { searchParams: Promise<{ service?: string; type?: string }> };

const absolute = (src: string) =>
  src.startsWith("http") ? src : `${env.siteUrl}${src}`;

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const [{ service, type }, projects] = await Promise.all([
    searchParams,
    listPortfolio(),
  ]);
  // An entry for /work in Admin → SEO → Page titles & descriptions takes priority over these.
  const meta = await buildMetadata({
    path: "/work",
    title: "Website & App Development Portfolio — India",
    description: `${projects.length ? `${projects.length} websites and apps` : "Websites and apps"} we’ve designed and built for schools, travel, retail and B2B businesses across India. See live projects and case studies.`,
  });
  // Filtered views duplicate the main portfolio, so they stay out of the index.
  return service || type
    ? { ...meta, robots: { index: false, follow: true } }
    : meta;
}

export default async function WorkPage({ searchParams }: Props) {
  const { service, type } = await searchParams;
  const [projects, services] = await Promise.all([
    listPortfolio(),
    listServices(),
  ]);

  const usedServices = services.filter((s) =>
    projects.some((p) => p.service_id === s.id),
  );
  const filtered = projects.filter(
    (project) =>
      (!service || project.service_slug === service) &&
      (!type || project.project_type === type),
  );
  const filtering = Boolean(service || type);

  const filterHref = (next: { service?: string; type?: string }) => {
    const params = new URLSearchParams();
    const s = "service" in next ? next.service : service;
    const t = "type" in next ? next.type : type;
    if (s) params.set("service", s);
    if (t) params.set("type", t);
    const qs = params.toString();
    return qs ? `/work?${qs}` : "/work";
  };
  const pill = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${active ? "border-ink bg-ink text-white" : "border-line bg-white text-slate hover:text-ink"}`;

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Work" }]}
        title="Website & app development portfolio"
        lede="Work you can click through, not just look at. Websites, web apps and online stores we’ve built for businesses across India — open any project to read the case study or try the live site."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/work/live" className="btn btn-dark">
            Open the live preview gallery
          </Link>
          <Link href="/services" className="btn btn-outline">
            Our services
          </Link>
        </div>
      </PageIntro>

      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <div className="flex flex-col gap-4 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
            <nav
              aria-label="Filter by service"
              className="flex flex-wrap gap-2"
            >
              <Link
                href={filterHref({ service: undefined })}
                className={pill(!service)}
                aria-current={!service ? "true" : undefined}
              >
                All work
              </Link>
              {usedServices.map((s) => (
                <Link
                  key={s.id}
                  href={filterHref({ service: s.slug })}
                  className={pill(service === s.slug)}
                  aria-current={service === s.slug ? "true" : undefined}
                >
                  {s.title}
                </Link>
              ))}
            </nav>
            <nav aria-label="Filter by project type" className="flex gap-2">
              {[
                [undefined, "All"],
                ["client", "Client projects"],
                ["independent", "Studio projects"],
              ].map(([value, label]) => (
                <Link
                  key={label}
                  href={filterHref({ type: value })}
                  className={pill(type === value)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {filtered.length ? (
            <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {filtered.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState
                title="No projects match these filters"
                body="Try a different service or project type."
                action={
                  <Link href="/work" className="btn btn-outline">
                    Show all work
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>
      <CtaBand
        title="Want something like this?"
        body="Tell us which project is closest to what you need — it makes estimating much faster."
        label="Start a project"
        href="/contact"
      />

      {!filtering && projects.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Alfa Solution portfolio",
            url: `${env.siteUrl}/work`,
            inLanguage: "en-IN",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: projects.map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "CreativeWork",
                  name: project.title,
                  url: `${env.siteUrl}/work/${project.slug}`,
                  description: project.summary,
                  ...(project.cover_image
                    ? { image: absolute(project.cover_image) }
                    : {}),
                  ...(project.technologies.length
                    ? { keywords: project.technologies.join(", ") }
                    : {}),
                  creator: {
                    "@type": "Organization",
                    name: "Alfa Solution",
                    url: env.siteUrl,
                  },
                },
              })),
            },
          }}
        />
      ) : null}
    </>
  );
}
