import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { PROJECT_STATUSES, listClientProjects } from "@/server/repos/crm";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDate, formatMoney } from "@/lib/format";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePageAccess("clients.manage");
  const { status = "", q = "" } = await searchParams;
  const projects = await listClientProjects({ status, q });
  const href = (s: string) => `/admin/projects?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;
  return (
    <>
      <PageHeader title="Projects" description="Client work in progress and delivered." actions={<Link href="/admin/projects/new" className="btn btn-dark btn-sm">New project</Link>} />
      <FilterTabs active={status} items={[{ key: "", label: "All", href: href("") }, ...Object.entries(PROJECT_STATUSES).map(([key, label]) => ({ key, label, href: href(key) }))]} />
      <Toolbar action="/admin/projects" q={q} placeholder="Search project or client">{status ? <input type="hidden" name="status" value={status} /> : null}</Toolbar>
      <Table head={["Project", "Client", "Due", "Budget", "Paid", "Progress", "Status"]} empty="No projects found.">
        {projects.map((p) => {
          const done = p.deliverables.filter((d) => d.done).length;
          return (
            <tr key={p.id} className="hover:bg-paper">
              <Td><Link href={`/admin/projects/${p.id}`} className="font-semibold hover:text-accent">{p.title}</Link></Td>
              <Td className="text-slate">{p.client_company || p.client_name}</Td>
              <Td className="whitespace-nowrap text-slate">{formatDate(p.due_date)}</Td>
              <Td className="tabular-nums">{p.budget ? formatMoney(p.budget) : "—"}</Td>
              <Td className="tabular-nums">{formatMoney(p.amount_paid)}</Td>
              <Td className="text-slate">{p.deliverables.length ? `${done}/${p.deliverables.length}` : "—"}</Td>
              <Td><StatusBadge status={p.status} label={PROJECT_STATUSES[p.status]} /></Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
