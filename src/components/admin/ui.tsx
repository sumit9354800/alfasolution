import Link from "next/link";
import type { ReactNode } from "react";
import { Search } from "lucide-react";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-2 inline-block text-sm text-slate hover:text-ink">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        {description ? <div className="mt-1 text-sm text-slate">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, actions, children, className = "", padded = true }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="font-sans text-[0.95rem] font-semibold tracking-normal">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: ReactNode; hint?: ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-slate">{label}</p>
      <p className="mt-2 font-display text-[1.9rem] font-semibold leading-none tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-xl border border-line bg-white p-5 transition-colors hover:border-line-strong">
      {body}
    </Link>
  ) : (
    <div className="rounded-xl border border-line bg-white p-5">{body}</div>
  );
}

const TONES = {
  neutral: "bg-paper text-slate ring-line",
  info: "bg-blue-50 text-blue-700 ring-blue-100",
  accent: "bg-accent-tint text-accent-deep ring-[#ecd9c6]",
  success: "bg-emerald-50 text-success ring-emerald-100",
  warning: "bg-amber-50 text-warning ring-amber-100",
  danger: "bg-red-50 text-danger ring-red-100",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>{children}</span>;
}

const STATUS_TONES: Record<string, Tone> = {
  new: "info",
  contacted: "accent",
  qualified: "accent",
  proposal: "warning",
  won: "success",
  lost: "neutral",
  spam: "danger",
  reviewing: "accent",
  shortlisted: "info",
  interview: "warning",
  offered: "warning",
  hired: "success",
  rejected: "neutral",
  draft: "neutral",
  open: "success",
  closed: "neutral",
  published: "success",
  scheduled: "info",
  planning: "info",
  in_progress: "accent",
  review: "warning",
  completed: "success",
  on_hold: "neutral",
  cancelled: "danger",
  pending: "warning",
  processing: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
  issued: "info",
  partially_paid: "warning",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{label ?? status.replace(/_/g, " ")}</Badge>;
}

export function Table({ head, children, empty, colSpan }: { head: ReactNode[]; children: ReactNode; empty?: ReactNode; colSpan?: number }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-[#fbfbfc] text-left text-xs text-slate">
            {head.map((cell, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 font-medium">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={colSpan ?? head.length} className="px-4 py-12 text-center text-slate">
                {empty ?? "Nothing here yet."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

/** GET-based search + filter bar; works without JavaScript. */
export function Toolbar({ action, q, placeholder = "Search", children }: { action: string; q?: string; placeholder?: string; children?: ReactNode }) {
  return (
    <form action={action} method="get" className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist" aria-hidden="true" />
        <label className="sr-only" htmlFor="toolbar-q">{placeholder}</label>
        <input id="toolbar-q" name="q" defaultValue={q} placeholder={placeholder} className="input !min-h-9 py-1.5 pl-9 text-sm" />
      </div>
      {children}
      <button className="btn btn-outline btn-sm">Apply</button>
    </form>
  );
}

export function FilterTabs({ items, active }: { items: { label: string; href: string; key: string; count?: number }[]; active: string }) {
  return (
    <nav className="mb-4 flex flex-wrap gap-1 border-b border-line" aria-label="Filter">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === active ? "page" : undefined}
          className={`-mb-px border-b-2 px-3 py-2 text-sm ${item.key === active ? "border-ink font-semibold text-ink" : "border-transparent text-slate hover:text-ink"}`}
        >
          {item.label}
          {item.count !== undefined ? <span className="ml-1.5 text-xs text-mist">{item.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

export function DescriptionList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-line text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 py-2.5">
          <dt className="text-slate">{label}</dt>
          <dd className="text-right font-medium">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
