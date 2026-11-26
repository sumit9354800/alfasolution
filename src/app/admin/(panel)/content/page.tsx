import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { SETTINGS_GROUPS } from "@/lib/content-schema";
import { PageHeader } from "@/components/admin/ui";

const COLLECTION_LINKS = [
  { href: "/admin/content/team", title: "Team members", description: "People on the Team page." },
  { href: "/admin/content/testimonials", title: "Testimonials", description: "Client quotes on the homepage." },
  { href: "/admin/content/faqs", title: "FAQs", description: "Questions on the FAQ, home and pricing pages." },
  { href: "/admin/content/pricing", title: "Pricing packages", description: "Packages and online checkout." },
  { href: "/admin/services", title: "Services", description: "Service list and detail pages." },
  { href: "/admin/portfolio", title: "Portfolio", description: "Projects and live previews." },
];

export default async function ContentIndexPage() {
  await requirePageAccess("content.manage");
  const groups = SETTINGS_GROUPS.filter((g) => g.permission === "content.manage");
  const card = "block rounded-xl border border-line bg-white p-5 transition-colors hover:border-line-strong";
  return (
    <>
      <PageHeader title="Pages & content" description="Everything visitors read on the website." />
      <h2 className="mb-3 text-sm font-semibold text-slate">Page sections</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <Link key={g.key} href={`/admin/content/${g.key}`} className={card}>
            <h3 className="font-sans text-base font-semibold tracking-normal">{g.title}</h3>
            <p className="mt-1 text-sm text-slate">{g.description}</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-10 text-sm font-semibold text-slate">Collections</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {COLLECTION_LINKS.map((c) => (
          <Link key={c.href} href={c.href} className={card}>
            <h3 className="font-sans text-base font-semibold tracking-normal">{c.title}</h3>
            <p className="mt-1 text-sm text-slate">{c.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
