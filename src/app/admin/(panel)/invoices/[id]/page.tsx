import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { query } from "@/server/db";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { getInvoice } from "@/server/finance/invoices";
import { PAYMENT_STATUSES, type Payment } from "@/server/finance/payments";
import { InvoiceView } from "@/components/shared/InvoiceView";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatMoney } from "@/lib/format";
import { emailInvoiceAction, setInvoiceStatus } from "../actions";
import { CopyField } from "../../payments/CopyField";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("finance.manage");
  const id = idParam((await params).id);
  const data = id ? await getInvoice(id) : null;
  if (!data || !id) notFound();
  const { invoice, items } = data;
  const [billing, payments] = await Promise.all([getSetting("billing"), query<Payment>("SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at DESC", [id])]);
  const balance = Math.max(0, Number(invoice.total) - Number(invoice.amount_paid));
  const payable = invoice.client_id && balance > 0 && (invoice.status === "issued" || invoice.status === "partially_paid");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/invoices", label: "Invoices" }}
        title={invoice.invoice_number}
        actions={
          <>
            <a href={`/api/admin/invoices/${id}/pdf`} className="btn btn-outline btn-sm">Download PDF</a>
            {payable ? <Link href={`/admin/payments/new?client=${invoice.client_id}&invoice=${id}&purpose=final&amount=${balance}`} className="btn btn-outline btn-sm">Request balance</Link> : null}
            {payable ? <Link href={`/admin/payments/new?mode=manual&client=${invoice.client_id}&invoice=${id}&purpose=final&amount=${balance}`} className="btn btn-dark btn-sm">Record payment</Link> : null}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <InvoiceView invoice={invoice} items={items} billing={billing} />
        <div className="space-y-6">
          {invoice.status !== "draft" ? (
            <Card title="Share">
              <CopyField label="Client link (view & download)" value={`${env.siteUrl}/invoice/${invoice.public_token}`} />
              <ActionForm action={emailInvoiceAction.bind(null, id)} className="mt-4">
                <SubmitButton variant="outline" pendingLabel="Sending…">Email invoice to {invoice.billing_email}</SubmitButton>
              </ActionForm>
            </Card>
          ) : (
            <Card title="Draft">
              <p className="mb-3 text-sm text-slate">Drafts aren’t visible to the client. Issue it when it’s ready.</p>
              <ActionForm action={setInvoiceStatus.bind(null, id, "issued")}>
                <SubmitButton>Issue invoice</SubmitButton>
              </ActionForm>
            </Card>
          )}
          <Card title="Payments" padded={false}>
            {payments.length ? (
              <ul className="divide-y divide-line text-sm">
                {payments.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/payments/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                      <span>{p.description}</span>
                      <span className="flex items-center gap-2"><span className="tabular-nums">{formatMoney(p.amount)}</span><StatusBadge status={p.status} label={PAYMENT_STATUSES[p.status]} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 py-6 text-sm text-slate">No payments recorded against this invoice.</p>}
          </Card>
          {invoice.status === "draft" || invoice.status === "issued" ? (
            <ActionForm action={setInvoiceStatus.bind(null, id, "cancelled")}>
              <ConfirmSubmit label="Cancel invoice" confirmLabel="Click again to cancel invoice" />
              <p className="mt-2 text-xs text-slate">Cancelled invoices keep their number for your records.</p>
            </ActionForm>
          ) : null}
        </div>
      </div>
    </>
  );
}
