import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { PAYMENT_METHODS, PAYMENT_STATUSES, listPayments } from "@/server/finance/payments";
import { paymentSummary } from "@/server/repos/admin";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDateTime, formatMoney } from "@/lib/format";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePageAccess("finance.manage");
  const { status = "", q = "" } = await searchParams;
  const [payments, summary] = await Promise.all([listPayments({ status, q }), paymentSummary()]);
  const count = Object.fromEntries(summary.map((s) => [s.status, Number(s.n)]));
  const href = (s: string) => `/admin/payments?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;
  return (
    <>
      <PageHeader title="Payments" description="Online and offline payments, and payment requests sent to clients." actions={<Link href="/admin/payments/new" className="btn btn-dark btn-sm">New payment</Link>} />
      <FilterTabs active={status} items={[{ key: "", label: "All", href: href("") }, ...(["paid", "pending", "failed", "cancelled", "refunded"] as const).map((key) => ({ key, label: PAYMENT_STATUSES[key], href: href(key), count: count[key] ?? 0 }))]} />
      <Toolbar action="/admin/payments" q={q} placeholder="Reference, payer, description or Razorpay ID">{status ? <input type="hidden" name="status" value={status} /> : null}</Toolbar>
      <Table head={["Payment", "Client / payer", "Method", "Amount", "Date", "Status"]} empty="No payments found.">
        {payments.map((p) => (
          <tr key={p.id} className="hover:bg-paper">
            <Td>
              <Link href={`/admin/payments/${p.id}`} className="font-semibold hover:text-accent">{p.description}</Link>
              <p className="text-xs text-slate">Ref {p.reference}{p.invoice_number ? ` · ${p.invoice_number}` : ""}</p>
            </Td>
            <Td className="text-slate">{p.client_name ?? p.payer_name ?? "—"}<br /><span className="text-xs">{p.payer_email ?? ""}</span></Td>
            <Td className="text-slate">{PAYMENT_METHODS[p.method]}</Td>
            <Td className="font-semibold tabular-nums">{formatMoney(p.amount)}</Td>
            <Td className="whitespace-nowrap text-slate">{formatDateTime(p.paid_at ?? p.created_at)}</Td>
            <Td><StatusBadge status={p.status} label={PAYMENT_STATUSES[p.status]} /></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
