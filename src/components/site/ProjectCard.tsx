import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/server/repos/content";
import { hostOf, canOptimizeImage } from "@/lib/format";

export function ProjectCard({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={`${project.title} website`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
            priority={priority}
            unoptimized={!canOptimizeImage(project.cover_image)}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-line-strong">{project.title}</div>
        )}
        {project.live_url ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-ink shadow-sm">
            <span className="live-dot" aria-hidden="true" />
            Live site
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl">
            <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0">
              {project.title}
            </Link>
          </h3>
          <p className="mt-1.5 text-[0.95rem] text-slate">
            {project.category}
            {project.year ? `, ${project.year}` : ""}
          </p>
        </div>
        {project.live_url ? <span className="shrink-0 pt-1 text-sm text-slate">{hostOf(project.live_url)}</span> : null}
      </div>
    </article>
  );
}
