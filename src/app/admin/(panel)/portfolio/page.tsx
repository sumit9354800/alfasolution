import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listPortfolio } from "@/server/repos/content";
import { Badge, PageHeader, Table, Td } from "@/components/admin/ui";
import { hostOf } from "@/lib/format";

const EMBED: Record<string, { label: string; tone: "success" | "danger" | "neutral" }> = {
  allowed: { label: "Live preview", tone: "success" },
  blocked: { label: "Screenshot fallback", tone: "danger" },
  unknown: { label: "Not checked", tone: "neutral" },
};

export default async function PortfolioAdminPage() {
  await requirePageAccess("portfolio.manage");
  const projects = await listPortfolio({ includeDrafts: true });
  return (
    <>
      <PageHeader title="Portfolio" description="Projects shown on /work, with live website previews." actions={<Link href="/admin/portfolio/new" className="btn btn-dark btn-sm">Add project</Link>} />
      <Table head={["Project", "Live site", "Preview", "Order", "Status"]} empty="No portfolio projects yet.">
        {projects.map((p) => (
          <tr key={p.id} className="hover:bg-paper">
            <Td>
              <Link href={`/admin/portfolio/${p.id}`} className="font-semibold hover:text-accent">{p.title}</Link>
              <p className="text-xs text-slate">{p.category}{p.year ? `, ${p.year}` : ""}</p>
            </Td>
            <Td>{p.live_url ? <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-slate hover:text-accent">{hostOf(p.live_url)}</a> : "—"}</Td>
            <Td>{p.live_url ? <Badge tone={EMBED[p.embed_mode === "screenshot" ? "blocked" : p.embed_status].tone}>{p.embed_mode === "screenshot" ? "Screenshot only" : EMBED[p.embed_status].label}</Badge> : "—"}</Td>
            <Td>{p.sort_order}</Td>
            <Td className="space-x-1">{p.is_published ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}{p.is_featured ? <Badge tone="accent">Featured</Badge> : null}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
