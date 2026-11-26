import Image from "next/image";
import { canOptimizeImage } from "@/lib/format";
import Link from "next/link";
import type { Metadata } from "next";
import { getSetting } from "@/server/settings";
import { buildMetadata } from "@/server/seo";
import { listTeam } from "@/server/repos/content";
import { CtaBand, PageIntro } from "@/components/site/blocks";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getSetting("site.about");
  return buildMetadata({ path: "/about", title: "About us", description: about.intro });
}

export default async function AboutPage() {
  const [about, home, team] = await Promise.all([getSetting("site.about"), getSetting("site.home"), listTeam()]);
  const paragraphs = about.story.split(/\n\s*\n/).filter(Boolean);
  const images = about.images.filter(Boolean);

  return (
    <>
      <PageIntro crumbs={[{ label: "About" }]} title={about.headline} lede={about.intro} />

      {images.length ? (
        <section className="bg-white">
          <div className="container-site grid gap-4 pb-4 pt-12 sm:grid-cols-[1.4fr_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-frame)] sm:row-span-2 sm:aspect-auto">
              <Image src={images[0]} alt="The Alfa Solution team at work" fill priority sizes="(max-width: 640px) 100vw, 58vw" className="object-cover" unoptimized={!canOptimizeImage(images[0])} />
            </div>
            {images.slice(1, 3).map((src) => (
              <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-frame)]">
                <Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" unoptimized={!canOptimizeImage(src)} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="container-site grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <h2 className="display-md max-w-md">{about.storyTitle}</h2>
          <div className="space-y-5 text-[1.1rem] leading-relaxed text-slate">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {home.stats.length ? (
        <section className="border-y border-line bg-paper">
          <dl className="container-site grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
            {home.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="text-sm text-slate">{stat.label}</dt>
                <dd className="order-first font-display text-5xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {about.values.length ? (
        <section className="bg-white">
          <div className="container-site py-20 sm:py-24">
            <h2 className="display-md">What guides our work</h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {about.values.map((value) => (
                <div key={value.title} className="border-t border-line pt-6">
                  <h3 className="text-2xl">{value.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-slate">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {team.length ? (
        <section className="bg-paper">
          <div className="container-site flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center">
            <div>
              <h2 className="display-md">The people behind the work</h2>
              <p className="mt-3 text-slate">{team.length} designers, engineers and strategists.</p>
            </div>
            <Link href="/team" className="btn btn-outline">
              Meet the team
            </Link>
          </div>
        </section>
      ) : null}

      <CtaBand title={home.ctaTitle} body={home.ctaBody} label={home.ctaLabel || "Start a project"} href={home.ctaHref || "/contact"} />
    </>
  );
}
