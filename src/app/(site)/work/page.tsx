import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { listPortfolio, listServices } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { ProjectCard } from "@/components/site/ProjectCard";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/work", title: "Our work" });
}

type Props = { searchParams: Promise<{ service?: string; type?: string }> };

export default async function WorkPage({ searchParams }: Props) {
  const { service, type } = await searchParams;
  const [projects, services] = await Promise.all([listPortfolio(), listServices()]);

  const usedServices = services.filter((s) => projects.some((p) => p.service_id === s.id));
  const filtered = projects.filter(
    (project) => (!service || project.service_slug === service) && (!type || project.project_type === type)
  );

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
        title="Work you can click through, not just look at."
        lede="Every project with a live site opens in an interactive preview — try the real website on desktop or mobile before you talk to us."
      >
        <Link href="/work/live" className="btn btn-dark">
          Open the live preview gallery
        </Link>
      </PageIntro>

      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <div className="flex flex-col gap-4 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Filter by service" className="flex flex-wrap gap-2">
              <Link href={filterHref({ service: undefined })} className={pill(!service)} aria-current={!service ? "true" : undefined}>
                All work
              </Link>
              {usedServices.map((s) => (
                <Link key={s.id} href={filterHref({ service: s.slug })} className={pill(service === s.slug)} aria-current={service === s.slug ? "true" : undefined}>
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
                <Link key={label} href={filterHref({ type: value })} className={pill(type === value)}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {filtered.length ? (
            <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {filtered.map((project, index) => (
                <ProjectCard key={project.id} project={project} priority={index < 2} />
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
      <CtaBand title="Want something like this?" body="Tell us which project is closest to what you need — it makes estimating much faster." label="Start a project" href="/contact" />
    </>
  );
}
