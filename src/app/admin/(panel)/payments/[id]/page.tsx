import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { parseJson } from "@/server/db";
import { env } from "@/server/env";
import { PAYMENT_METHODS, PAYMENT_PURPOSES, PAYMENT_STATUSES, getPayment, isLinkUsable } from "@/server/finance/payments";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { Card, DescriptionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cancelAction, resendReceiptAction, sendLinkAction, syncAction } from "../actions";
import { CopyField } from "../CopyField";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("finance.manage");
  const id = idParam((await params).id);
  const p = id ? await getPayment(id) : null;
  if (!p || !id) notFound();
  const billing = parseJson<Record<string, unknown>>(p.billing_details, {});
  const breakdown = billing.breakdown as { subtotal: number; taxRate: number; taxAmount: number } | undefined;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/payments", label: "Payments" }}
        title={formatMoney(p.amount)}
        description={<span className="flex items-center gap-2">{p.description} <StatusBadge status={p.status} label={PAYMENT_STATUSES[p.status]} /></span>}
        actions={p.invoice_id ? <Link href={`/admin/invoices/${p.invoice_id}`} className="btn btn-dark btn-sm">View invoice {p.invoice_number}</Link> : null}
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Card title="Details">
            <DescriptionList
              items={[
                ["Reference", p.reference],
                ["Type", PAYMENT_PURPOSES[p.purpose]],
                ["Method", PAYMENT_METHODS[p.method]],
                ["Client", p.client_id ? <Link key="c" href={`/admin/clients/${p.client_id}`} className="text-accent">{p.client_name}</Link> : "Not linked yet"],
                ["Project", p.client_project_id ? <Link key="p" href={`/admin/projects/${p.client_project_id}`} className="text-accent">{p.project_title}</Link> : "—"],
                ["Payer", `${p.payer_name ?? "—"}${p.payer_email ? ` <${p.payer_email}>` : ""}`],
                ["Phone", p.payer_phone ?? "—"],
                ["Taxable value", breakdown ? formatMoney(breakdown.subtotal) : "—"],
                ["Tax", breakdown ? `${formatMoney(breakdown.taxAmount)} (${breakdown.taxRate}%)` : "—"],
                ["Created", formatDateTime(p.created_at)],
                ["Paid", formatDateTime(p.paid_at)],
              ]}
            />
          </Card>
          <Card title="Gateway">
            <DescriptionList
              items={[
                ["Razorpay order", p.gateway_order_id ?? "Not created yet"],
                ["Razorpay payment", p.gateway_payment_id ?? "—"],
                ["Failure reason", p.failure_reason ?? "—"],
              ]}
            />
            {p.gateway_order_id && p.status !== "paid" ? (
              <ActionForm action={syncAction.bind(null, id)} className="mt-4">
                <SubmitButton variant="outline" pendingLabel="Checking…">Check status with Razorpay</SubmitButton>
              </ActionForm>
            ) : null}
          </Card>
        </div>
        <div className="space-y-6">
          {p.link_token ? (
            <Card title="Payment link">
              <CopyField label="Share this link with the client" value={`${env.siteUrl}/pay/${p.link_token}`} />
              <p className="mt-2 text-xs text-slate">{isLinkUsable(p) ? `Valid until ${formatDateTime(p.link_expires_at)}` : "This link is no longer active."}</p>
              {isLinkUsable(p) ? (
                <ActionForm action={sendLinkAction.bind(null, id)} className="mt-4">
                  <SubmitButton variant="outline" pendingLabel="Sending…">Email link to client</SubmitButton>
                </ActionForm>
              ) : null}
            </Card>
          ) : null}
          {p.status === "paid" ? (
            <Card title="Receipt">
              <ActionForm action={resendReceiptAction.bind(null, id)}>
                <p className="mb-3 text-sm text-slate">Send the payment receipt with the invoice PDF to {p.payer_email ?? "the client"}.</p>
                <SubmitButton variant="outline" pendingLabel="Sending…">Re-send receipt</SubmitButton>
              </ActionForm>
            </Card>
          ) : null}
          {p.status === "pending" || p.status === "failed" ? (
            <ActionForm action={cancelAction.bind(null, id)}>
              <ConfirmSubmit label="Cancel this payment request" confirmLabel="Click again to cancel" />
            </ActionForm>
          ) : null}
        </div>
      </div>
    </>
  );
}
