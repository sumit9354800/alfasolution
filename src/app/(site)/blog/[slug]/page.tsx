import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { getPublicPost, relatedPosts } from "@/server/repos/blog";
import { Breadcrumbs, CtaBand } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatDate, canOptimizeImage } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return { title: "Article not found" };
  return buildMetadata({
    path: `/blog/${post.slug}`,
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image,
    type: "article",
    publishedTime: post.published_at ? new Date(post.published_at).toISOString() : undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const related = await relatedPosts(post, 3);
  const url = `${env.siteUrl}/blog/${post.slug}`;

  return (
    <>
      <article>
        <header className="border-b border-line bg-white">
          <div className="container-site max-w-4xl pb-12 pt-12 sm:pt-16">
            <Breadcrumbs items={[{ label: "Insights", href: "/blog" }, { label: post.title }]} />
            {post.category_slug ? (
              <Link href={`/blog?category=${post.category_slug}`} className="mt-8 inline-block text-sm font-semibold text-accent">
                {post.category_name}
              </Link>
            ) : null}
            <h1 className="display-lg mt-3">{post.title}</h1>
            {post.excerpt ? <p className="lede mt-5">{post.excerpt}</p> : null}
            <p className="mt-6 text-sm text-slate">
              {post.author_name ? `${post.author_name} · ` : ""}
              <time dateTime={post.published_at ? new Date(post.published_at).toISOString() : undefined}>{formatDate(post.published_at, "long")}</time> · {post.reading_minutes} min read
            </p>
          </div>
        </header>

        {post.cover_image ? (
          <div className="bg-white">
            <div className="container-site max-w-5xl pt-10">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-frame)]">
                <Image src={post.cover_image} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1000px" className="object-cover" unoptimized={!canOptimizeImage(post.cover_image)} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white">
          <div className="container-site max-w-4xl py-12 sm:py-16">
            <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: post.content }} />

            <footer className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              {post.tags?.length ? (
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag.id}>
                      <Link href={`/blog?tag=${tag.slug}`} className="chip hover:text-ink">#{tag.name}</Link>
                    </li>
                  ))}
                </ul>
              ) : <span />}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate">Share</span>
                <a className="link" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>LinkedIn</a>
                <a className="link" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`}>WhatsApp</a>
                <a className="link" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}>X</a>
              </div>
            </footer>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="bg-paper">
          <div className="container-site py-16">
            <h2 className="display-md">Related articles</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {related.map((item) => (
                <article key={item.id} className="group relative border-t border-ink pt-5">
                  <p className="text-sm text-slate">{formatDate(item.published_at)}</p>
                  <h3 className="mt-2 text-xl leading-snug">
                    <Link href={`/blog/${item.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">{item.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand title="Planning a project?" body="We’re happy to look at what you have and suggest the next step." label="Talk to us" href="/contact" />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.cover_image ? (post.cover_image.startsWith("http") ? post.cover_image : `${env.siteUrl}${post.cover_image}`) : undefined,
          datePublished: post.published_at ? new Date(post.published_at).toISOString() : undefined,
          dateModified: new Date(post.updated_at).toISOString(),
          author: { "@type": post.author_name ? "Person" : "Organization", name: post.author_name ?? "Alfa Solution" },
          publisher: { "@type": "Organization", name: "Alfa Solution", logo: { "@type": "ImageObject", url: `${env.siteUrl}/images/logo-black.png` } },
          mainEntityOfPage: url,
        }}
      />
    </>
  );
}
