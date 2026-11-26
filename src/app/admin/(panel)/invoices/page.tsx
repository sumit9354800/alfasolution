import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { INVOICE_STATUSES, listInvoices } from "@/server/finance/invoices";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDate, formatMoney } from "@/lib/format";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePageAccess("finance.manage");
  const { status = "", q = "" } = await searchParams;
  const invoices = await listInvoices({ status, q });
  const href = (s: string) => `/admin/invoices?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;
  return (
    <>
      <PageHeader title="Invoices" description="Generated automatically for online payments, or created manually." actions={<Link href="/admin/invoices/new" className="btn btn-dark btn-sm">Create invoice</Link>} />
      <FilterTabs active={status} items={[{ key: "", label: "All", href: href("") }, ...Object.entries(INVOICE_STATUSES).map(([key, label]) => ({ key, label, href: href(key) }))]} />
      <Toolbar action="/admin/invoices" q={q} placeholder="Invoice number, name or email">{status ? <input type="hidden" name="status" value={status} /> : null}</Toolbar>
      <Table head={["Invoice", "Billed to", "Issued", "Total", "Balance", "Status", ""]} empty="No invoices found.">
        {invoices.map((i) => (
          <tr key={i.id} className="hover:bg-paper">
            <Td><Link href={`/admin/invoices/${i.id}`} className="font-semibold hover:text-accent">{i.invoice_number}</Link></Td>
            <Td className="text-slate">{i.billing_company || i.billing_name}</Td>
            <Td className="whitespace-nowrap text-slate">{formatDate(i.issue_date)}</Td>
            <Td className="tabular-nums">{formatMoney(i.total)}</Td>
            <Td className="tabular-nums">{formatMoney(Math.max(0, Number(i.total) - Number(i.amount_paid)))}</Td>
            <Td><StatusBadge status={i.status} label={INVOICE_STATUSES[i.status]} /></Td>
            <Td><a href={`/api/admin/invoices/${i.id}/pdf`} className="text-sm text-accent">PDF</a></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
