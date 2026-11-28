import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { canEmbed, listPortfolio } from "@/server/repos/content";
import { EmptyState, PageIntro } from "@/components/site/blocks";
import { LiveBrowser } from "@/components/site/LiveBrowser";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/work/live",
    title: "Live project previews",
    description: "Try live websites built by Alfa Solution in an interactive desktop, tablet and mobile preview.",
  });
}

type Props = { searchParams: Promise<{ project?: string }> };

export default async function LivePreviewPage({ searchParams }: Props) {
  const { project } = await searchParams;
  const projects = (await listPortfolio()).filter((p) => p.live_url);
  const sites = projects.map((p) => ({ slug: p.slug, title: p.title, url: p.live_url!, cover: p.cover_image, embeddable: canEmbed(p) }));
  const initial = Math.max(0, sites.findIndex((site) => site.slug === project));

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Work", href: "/work" }, { label: "Live previews" }]}
        title="Live previews"
        lede="Switch between projects and devices. Everything inside the frame is the real website — scroll, click and use it."
      />
      <section className="bg-paper">
        <div className="container-site py-10 sm:py-14">
          {sites.length ? (
            <>
              <LiveBrowser sites={sites} initial={initial} showSwitcher variant="full" height={720} />
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {projects.map((p) => (
                  <Link key={p.id} href={`/work/${p.slug}`} className="rounded-[var(--radius-card)] border border-line bg-white p-4 text-sm hover:border-line-strong">
                    <span className="font-semibold text-ink">{p.title}</span>
                    <span className="mt-1 block text-slate">Read the case study</span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="No live projects yet" body="Projects with a live website link appear here automatically." />
          )}
        </div>
      </section>
    </>
  );
}