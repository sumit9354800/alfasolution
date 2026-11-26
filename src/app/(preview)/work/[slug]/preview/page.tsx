import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { canEmbed, getProjectBySlug } from "@/server/repos/content";
import { LiveBrowser } from "@/components/site/LiveBrowser";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project ? `${project.title} — live preview | Alfa Solution` : "Preview",
    robots: { index: false, follow: true },
    alternates: project ? { canonical: `/work/${project.slug}` } : undefined,
  };
}

/** Distraction-free embedded preview of a single project's live website. */
export default async function EmbeddedPreviewPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project?.live_url) notFound();

  return (
    <main className="flex min-h-dvh flex-col bg-ink p-3 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4 text-sm text-white/70">
        <Link href={`/work/${project.slug}`} className="inline-flex items-center gap-2 hover:text-white">
          <ArrowLeft size={16} aria-hidden="true" /> Back to the case study
        </Link>
        <span className="hidden truncate sm:block">{project.title}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div>div]:flex-1">
        <LiveBrowser
          sites={[{ slug: project.slug, title: project.title, url: project.live_url, cover: project.cover_image, embeddable: canEmbed(project) }]}
          variant="full"
        />
      </div>
    </main>
  );
}
