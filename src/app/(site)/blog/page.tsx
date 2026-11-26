import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { buildMetadata } from "@/server/seo";
import { listCategories, listPublicPosts, listTags, type BlogPost } from "@/server/repos/blog";
import { EmptyState, PageIntro, Pagination } from "@/components/site/blocks";
import { formatDate, canOptimizeImage } from "@/lib/format";

type Props = { searchParams: Promise<{ q?: string; category?: string; tag?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category, tag, page } = await searchParams;
  const meta = await buildMetadata({ path: "/blog", title: "Insights" });
  // Filtered and paginated listings shouldn't compete with the main page in search.
  return q || category || tag || (page && page !== "1") ? { ...meta, robots: { index: false, follow: true } } : meta;
}

function PostCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  return (
    <article className={`group relative flex flex-col ${large ? "lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12" : ""}`}>
      <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-ink ${large ? "aspect-[16/10]" : "aspect-[16/10]"}`}>
        {post.cover_image ? (
          <Image src={post.cover_image} alt="" fill sizes={large ? "(max-width: 1024px) 100vw, 640px" : "(max-width: 768px) 100vw, 400px"} className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" unoptimized={!canOptimizeImage(post.cover_image)} />
        ) : (
          <div className="flex h-full items-end p-6">
            <span className="font-display text-2xl leading-tight text-white/90">{post.category_name ?? "Insights"}</span>
          </div>
        )}
      </div>
      <div className={large ? "mt-6 lg:mt-0" : "mt-5"}>
        <p className="text-sm text-slate">
          {post.category_name ? `${post.category_name} · ` : ""}
          {formatDate(post.published_at)} · {post.reading_minutes} min read
        </p>
        <h2 className={`mt-2 leading-snug ${large ? "display-md" : "text-xl"}`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mt-3 leading-relaxed text-slate">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [result, categories, tags] = await Promise.all([
    listPublicPosts({ q, category: params.category, tag: params.tag, page, perPage: 9 }),
    listCategories(),
    listTags(),
  ]);
  const filtering = Boolean(q || params.category || params.tag);
  const [lead, ...rest] = result.posts;
  const showLead = !filtering && page === 1 && lead;

  const href = (next: Record<string, string | undefined>) => {
    const merged = { q: q || undefined, category: params.category, tag: params.tag, ...next };
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/blog?${qs}` : "/blog";
  };
  const pill = (active: boolean) => `rounded-full border px-3.5 py-1.5 text-sm ${active ? "border-ink bg-ink text-white" : "border-line bg-white text-slate hover:text-ink"}`;

  return (
    <>
      <PageIntro crumbs={[{ label: "Insights" }]} title="Insights" lede="Practical notes on planning, designing and growing websites and digital products.">
        <form action="/blog" method="get" role="search" className="flex max-w-lg gap-2">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" aria-hidden="true" />
            <input id="blog-search" name="q" defaultValue={q} placeholder="Search articles" className="input pl-9" />
          </div>
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          <button className="btn btn-dark">Search</button>
        </form>
      </PageIntro>

      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <Link href={href({ category: undefined, tag: undefined, page: undefined })} className={pill(!params.category && !params.tag)}>All</Link>
            {categories.filter((c) => Number(c.post_count) > 0).map((c) => (
              <Link key={c.id} href={href({ category: c.slug, tag: undefined, page: undefined })} className={pill(params.category === c.slug)}>
                {c.name}
              </Link>
            ))}
          </nav>
          {filtering ? (
            <p className="mt-6 text-slate" role="status">
              {result.total} {result.total === 1 ? "article" : "articles"}
              {q ? <> matching “{q}”</> : null}
              {params.tag ? <> tagged {tags.find((t) => t.slug === params.tag)?.name ?? params.tag}</> : null}.{" "}
              <Link href="/blog" className="link">Clear filters</Link>
            </p>
          ) : null}

          {result.posts.length ? (
            <>
              {showLead ? (
                <div className="mt-10 border-b border-line pb-14">
                  <PostCard post={lead} large />
                </div>
              ) : null}
              <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {(showLead ? rest : result.posts).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination page={result.page} pages={result.pages} hrefFor={(p) => href({ page: p > 1 ? String(p) : undefined })} />
            </>
          ) : (
            <div className="mt-10">
              <EmptyState title={filtering ? "No articles found" : "No articles yet"} body={filtering ? "Try a different search term or category." : "New articles will appear here."} action={filtering ? <Link href="/blog" className="btn btn-outline">Show all articles</Link> : undefined} />
            </div>
          )}

          {tags.filter((t) => Number(t.post_count) > 0).length ? (
            <div className="mt-16 border-t border-line pt-8">
              <h2 className="text-sm font-semibold text-slate">Browse by topic</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.filter((t) => Number(t.post_count) > 0).map((t) => (
                  <li key={t.id}>
                    <Link href={href({ tag: t.slug, category: undefined, page: undefined })} className="chip hover:text-ink">#{t.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
