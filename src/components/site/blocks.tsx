import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { JsonLd } from "./JsonLd";
import { env } from "@/server/env";

export function PageIntro({
  title,
  lede,
  children,
  crumbs,
  dark = false,
}: {
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  dark?: boolean;
}) {
  return (
    <section className={dark ? "bg-ink text-white" : "border-b border-line bg-white"}>
      <div className="container-site pb-14 pt-12 sm:pb-20 sm:pt-16">
        {crumbs ? <Breadcrumbs items={crumbs} dark={dark} /> : null}
        <h1 className="display-lg mt-6 max-w-4xl">{title}</h1>
        {lede ? <p className={`lede mt-5 ${dark ? "!text-white/65" : ""}`}>{lede}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items, dark = false }: { items: { label: string; href?: string }[]; dark?: boolean }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-sm ${dark ? "text-white/50" : "text-slate"}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && index < all.length - 1 ? (
                <Link href={item.href} className={dark ? "hover:text-white" : "hover:text-ink"}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={index === all.length - 1 ? "page" : undefined} className={dark ? "text-white/80" : "text-ink"}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${env.siteUrl}${item.href === "/" ? "" : item.href}` } : {}),
          })),
        }}
      />
    </>
  );
}

export function SectionHeader({ title, lede, action, className = "" }: { title: ReactNode; lede?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        <h2 className="display-md">{title}</h2>
        {lede ? <p className="mt-4 text-[1.05rem] leading-relaxed text-slate">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CtaBand({ title, body, label, href }: { title: string; body?: string; label: string; href: string }) {
  return (
    <section className="bg-paper">
      <div className="container-site py-16 sm:py-20">
        <div className="grid gap-8 rounded-[var(--radius-frame)] bg-ink px-7 py-12 text-white sm:px-12 md:grid-cols-[1.4fr_1fr] md:items-end md:py-16">
          <div>
            <h2 className="display-md max-w-xl">{title}</h2>
            {body ? <p className="mt-4 max-w-lg text-white/65">{body}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href={href} className="btn bg-white text-ink hover:bg-accent-tint">
              {label}
            </Link>
            <Link href="/work" className="btn btn-ghost-light">
              See our work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items, withSchema = true }: { items: { id: number; question: string; answer: string }[]; withSchema?: boolean }) {
  if (!items.length) return null;
  return (
    <>
      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.id} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.08rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown size={18} className="shrink-0 text-slate transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="max-w-3xl pb-6 leading-relaxed text-slate">{item.answer}</p>
          </details>
        ))}
      </div>
      {withSchema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
          }}
        />
      ) : null}
    </>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-white px-6 py-14 text-center">
      <h3 className="text-xl">{title}</h3>
      {body ? <p className="mx-auto mt-3 max-w-md text-slate">{body}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (page: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t border-line pt-6 text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="btn btn-outline btn-sm" rel="prev">
          Newer posts
        </Link>
      ) : (
        <span />
      )}
      <span className="text-slate">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={hrefFor(page + 1)} className="btn btn-outline btn-sm" rel="next">
          Older posts
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
