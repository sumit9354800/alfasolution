import Link from "next/link";
import type { Metadata } from "next";
import { getSetting } from "@/server/settings";
import { buildMetadata } from "@/server/seo";
import { listFaqs, listPortfolio, listServices, listTestimonials } from "@/server/repos/content";
import { listLatestPosts } from "@/server/repos/blog";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Testimonials } from "@/components/site/Testimonials";
import { CtaBand, FaqList, SectionHeader } from "@/components/site/blocks";
import { formatDate } from "@/lib/format";
import { HeroExperience } from "@/components/hero3d/HeroExperience";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/" });
}

export default async function HomePage() {
  const [home, services, featured, testimonials, posts, faqs] = await Promise.all([
    getSetting("site.home"),
    listServices(),
    listPortfolio({ featuredOnly: true }),
    listTestimonials(),
    listLatestPosts(3),
    listFaqs(),
  ]);

  return (
    <>
      <HeroExperience
        headline={home.heroHeadline}
        subheadline={home.heroSubheadline}
        primary={{ label: home.heroPrimaryLabel || "Start a project", href: home.heroPrimaryHref || "/contact" }}
        secondary={{ label: home.heroSecondaryLabel || "See our work", href: home.heroSecondaryHref || "/work" }}
        stats={home.stats}
      />

      {/* Introduction */}
      {home.introTitle ? (
        <section className="bg-paper">
          <div className="container-site grid gap-8 py-20 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <h2 className="display-lg max-w-xl">{home.introTitle}</h2>
            <p className="self-end text-[1.15rem] leading-relaxed text-slate">{home.introBody}</p>
          </div>
        </section>
      ) : null}

      {/* Services */}
      <section className="bg-white">
        <div className="container-site py-20 sm:py-24">
          <SectionHeader
            title="What we build"
            lede="Strategy, design and engineering under one roof — so nothing gets lost between the people who plan your product and the people who build it."
            action={
              <Link href="/services" className="btn btn-outline">
                All services
              </Link>
            }
          />
          <ul className="mt-12 grid border-t border-line md:grid-cols-2">
            {services.map((service, index) => (
              <li key={service.id} className={`border-b border-line ${index % 2 === 0 ? "md:border-r md:pr-10" : "md:pl-10"}`}>
                <Link href={`/services/${service.slug}`} className="group block py-8">
                  <h3 className="text-2xl transition-colors group-hover:text-accent">{service.title}</h3>
                  <p className="mt-2.5 max-w-md leading-relaxed text-slate">{service.short_description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Selected work */}
      {featured.length ? (
        <section className="bg-paper">
          <div className="container-site py-20 sm:py-24">
            <SectionHeader
              title="Selected work"
              lede="Every project below is live. Open any of them to try the real website in our preview frame."
              action={
                <Link href="/work" className="btn btn-outline">
                  View all projects
                </Link>
              }
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
              {featured.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Process — a genuine sequence, so it is numbered */}
      {home.process.length ? (
        <section className="bg-ink text-white">
          <div className="container-site py-20 sm:py-24">
            <h2 className="display-md max-w-xl">How a project runs</h2>
            <p className="mt-4 max-w-xl text-white/60">A fixed scope and price before we start, and something real to review at every stage.</p>
            <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {home.process.map((step, index) => (
                <li key={step.title} className="border-t border-white/15 pt-6">
                  <span className="font-display text-sm text-accent-light">Step {index + 1}</span>
                  <h3 className="mt-3 text-xl">{step.title}</h3>
                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-white/60">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Testimonials — only real, published reviews */}
      <Testimonials items={testimonials} />

      {/* Insights */}
      {posts.length ? (
        <section className={testimonials.length ? "bg-paper" : "bg-white"}>
          <div className="container-site py-20 sm:py-24">
            <SectionHeader
              title="Insights"
              action={
                <Link href="/blog" className="btn btn-outline">
                  All articles
                </Link>
              }
            />
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group relative border-t border-ink pt-6">
                  <p className="text-sm text-slate">
                    {post.category_name ? `${post.category_name} · ` : ""}
                    {formatDate(post.published_at)}
                  </p>
                  <h3 className="mt-3 text-xl leading-snug">
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt ? <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">{post.excerpt}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {faqs.length ? (
        <section className="bg-white">
          <div className="container-site grid gap-10 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="display-md">Questions, answered</h2>
              <p className="mt-4 text-slate">
                Can’t find what you need?{" "}
                <Link href="/contact" className="link">
                  Ask us directly
                </Link>
                .
              </p>
            </div>
            <div>
              <FaqList items={faqs.slice(0, 6)} />
              <Link href="/faq" className="link mt-6 inline-block text-sm">
                See all questions
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand title={home.ctaTitle} body={home.ctaBody} label={home.ctaLabel || "Start a project"} href={home.ctaHref || "/contact"} />
    </>
  );
}
