import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listClients } from "@/server/repos/crm";
import { PageHeader, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDate, formatMoney } from "@/lib/format";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePageAccess("clients.manage");
  const { q = "" } = await searchParams;
  const clients = await listClients(q);
  return (
    <>
      <PageHeader title="Clients" description={`${clients.length} ${clients.length === 1 ? "client" : "clients"}`} actions={<Link href="/admin/clients/new" className="btn btn-dark btn-sm">Add client</Link>} />
      <Toolbar action="/admin/clients" q={q} placeholder="Search name, company, email or phone" />
      <Table head={["Client", "Contact", "Projects", "Paid to date", "Since"]} empty={q ? "No clients match your search." : "No clients yet. Add one, or convert an enquiry."}>
        {clients.map((c) => (
          <tr key={c.id} className="hover:bg-paper">
            <Td>
              <Link href={`/admin/clients/${c.id}`} className="font-semibold hover:text-accent">{c.company || c.name}</Link>
              {c.company ? <p className="text-xs text-slate">{c.name}</p> : null}
            </Td>
            <Td className="text-slate">{c.email}<br />{c.phone ?? ""}</Td>
            <Td>{c.project_count}</Td>
            <Td className="tabular-nums">{formatMoney(c.total_paid)}</Td>
            <Td className="text-slate">{formatDate(c.created_at)}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
