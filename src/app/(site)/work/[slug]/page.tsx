import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { canEmbed, getProjectBySlug, listPortfolio } from "@/server/repos/content";
import { Breadcrumbs, CtaBand } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { LiveBrowser } from "@/components/site/LiveBrowser";
import { hostOf, canOptimizeImage } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return buildMetadata({
    path: `/work/${project.slug}`,
    title: project.seo_title || `${project.title} — case study`,
    description: project.seo_description || project.summary,
    image: project.cover_image,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await listPortfolio();
  const position = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(position + 1) % all.length] : null;

  const facts: [string, React.ReactNode][] = [
    ["Client", project.client_name || (project.project_type === "independent" ? "Studio project" : "Confidential")],
    ["Year", project.year ?? "—"],
    ["Our role", project.role ?? "—"],
    ["Service", project.service_slug ? <Link href={`/services/${project.service_slug}`} className="link">{project.service_title}</Link> : project.category],
  ];

  const story: [string, string | null][] = [
    ["The challenge", project.challenge],
    ["What we built", project.solution],
    ["The outcome", project.results],
  ];

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-site pb-12 pt-12 sm:pt-16">
          <Breadcrumbs items={[{ label: "Work", href: "/work" }, { label: project.title }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="text-slate">{project.category}</p>
              <h1 className="display-lg mt-2">{project.title}</h1>
              <p className="lede mt-5">{project.summary}</p>
            </div>
            {project.live_url ? (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                  Visit {hostOf(project.live_url)} <ExternalLink size={15} aria-hidden="true" />
                </a>
                <Link href={`/work/${project.slug}/preview`} className="btn btn-outline">
                  Full-screen preview
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="container-site py-10 sm:py-14">
          {project.live_url ? (
            <LiveBrowser
              sites={[{ slug: project.slug, title: project.title, url: project.live_url, cover: project.cover_image, embeddable: canEmbed(project) }]}
              height={680}
            />
          ) : project.cover_image ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-frame)] border border-line">
              <Image src={project.cover_image} alt={`${project.title} screenshot`} fill priority sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover object-top" unoptimized={!canOptimizeImage(project.cover_image)} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site grid gap-14 py-16 sm:py-20 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <aside>
            <dl className="divide-y divide-line border-y border-line">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3.5 text-[0.95rem]">
                  <dt className="text-slate">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {project.technologies.length ? (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-slate">Built with</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>

          <div className="space-y-14">
            {story
              .filter(([, body]) => body)
              .map(([title, body]) => (
                <div key={title}>
                  <h2 className="display-md">{title}</h2>
                  <p className="mt-5 max-w-[65ch] text-[1.1rem] leading-relaxed text-slate">{body}</p>
                </div>
              ))}
            {project.features.length ? (
              <div>
                <h2 className="display-md">Key features</h2>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex gap-3 border-b border-line pb-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {next ? (
        <section className="border-t border-line bg-paper">
          <Link href={`/work/${next.slug}`} className="container-site group flex flex-col gap-2 py-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate">Next project</p>
              <p className="display-md mt-2 transition-colors group-hover:text-accent">{next.title}</p>
            </div>
            <span className="text-slate">{next.category}</span>
          </Link>
        </section>
      ) : null}

      <CtaBand title="Want results like this?" body="Tell us about your project and we’ll show you how we’d approach it." label="Start a project" href="/contact" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: `${env.siteUrl}/work/${project.slug}`,
          image: project.cover_image ?? undefined,
          creator: { "@type": "Organization", name: "Alfa Solution" },
          dateCreated: project.year ? String(project.year) : undefined,
          keywords: project.technologies.join(", "),
        }}
      />
    </>
  );
}
