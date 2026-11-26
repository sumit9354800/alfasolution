import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listClientOptions, listProjectOptions } from "@/server/repos/crm";
import { listInvoices } from "@/server/finance/invoices";
import { PAYMENT_METHODS, PAYMENT_PURPOSES } from "@/server/finance/payments";
import { env } from "@/server/env";
import { ActionForm, CheckboxField, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { Card, FilterTabs, PageHeader } from "@/components/admin/ui";
import { formatMoney, toDateTimeInput } from "@/lib/format";
import { createRequestAction, recordManualAction } from "../actions";

type Props = { searchParams: Promise<{ mode?: string; client?: string; project?: string; invoice?: string; purpose?: string; amount?: string }> };

export default async function NewPaymentPage({ searchParams }: Props) {
  await requirePageAccess("finance.manage");
  const sp = await searchParams;
  const mode = sp.mode === "manual" ? "manual" : "request";
  const [clients, projects, invoices] = await Promise.all([listClientOptions(), listProjectOptions(), listInvoices()]);
  const openInvoices = invoices.filter((i) => i.status === "issued" || i.status === "partially_paid");
  const keep = new URLSearchParams(Object.entries(sp).filter(([k, v]) => k !== "mode" && v) as [string, string][]).toString();

  if (!clients.length) {
    return (
      <>
        <PageHeader back={{ href: "/admin/payments", label: "Payments" }} title="New payment" />
        <Card><p className="text-sm">Add a client before requesting a payment. <Link href="/admin/clients/new" className="text-accent">Add client</Link></p></Card>
      </>
    );
  }

  const shared = (
    <div className="grid gap-5 sm:grid-cols-2">
      <SelectField name="client_id" label="Client" required placeholder="Choose a client" defaultValue={sp.client ?? ""} options={clients.map((c) => ({ value: c.id, label: c.company ? `${c.company} (${c.name})` : c.name }))} />
      <SelectField name="purpose" label="Payment type" defaultValue={sp.purpose ?? "advance"} options={Object.entries(PAYMENT_PURPOSES).filter(([k]) => k !== "package").map(([value, label]) => ({ value, label }))} />
      <SelectField name="project_id" label="Project" placeholder="Not linked to a project" defaultValue={sp.project ?? ""} options={projects.map((p) => ({ value: p.id, label: `${p.title} — ${p.client_name}` }))} />
      <SelectField name="invoice_id" label="Apply to invoice" placeholder="Create a new invoice automatically" defaultValue={sp.invoice ?? ""} options={openInvoices.map((i) => ({ value: i.id, label: `${i.invoice_number} — ${i.billing_name} (balance ${formatMoney(Number(i.total) - Number(i.amount_paid))})` }))} hint="Leave empty and an invoice is generated when the payment completes." />
      <TextField name="description" label="Description" required className="sm:col-span-2" placeholder="e.g. 50% advance — website redesign" />
      <TextField name="amount" label="Amount (₹, incl. tax)" type="number" step="0.01" min={1} required defaultValue={sp.amount ?? ""} />
    </div>
  );

  return (
    <>
      <PageHeader back={{ href: "/admin/payments", label: "Payments" }} title="New payment" />
      <FilterTabs
        active={mode}
        items={[
          { key: "request", label: "Send a payment link", href: `/admin/payments/new?${keep}` },
          { key: "manual", label: "Record an offline payment", href: `/admin/payments/new?mode=manual&${keep}` },
        ]}
      />
      <Card>
        {mode === "request" ? (
          <ActionForm action={createRequestAction} className="space-y-6">
            {!env.razorpay.configured ? <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-warning">Razorpay keys aren’t configured yet, so clients won’t be able to pay this link until they are. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the environment.</p> : null}
            <p className="text-sm text-slate">The client gets a secure link to pay online by UPI, card or net banking. The payment is verified on the server and an invoice is issued automatically.</p>
            {shared}
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="expires_days" label="Link valid for (days)" type="number" min={1} defaultValue={14} />
            </div>
            <CheckboxField name="send_email" label="Email the link to the client now" defaultChecked />
            <SubmitButton>Create payment link</SubmitButton>
          </ActionForm>
        ) : (
          <ActionForm action={recordManualAction} className="space-y-6">
            <p className="text-sm text-slate">For bank transfers, cash or cheques you’ve already received. The payment is recorded as paid and an invoice is issued (or the selected invoice is updated).</p>
            {shared}
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField name="method" label="Received by" defaultValue="bank_transfer" options={Object.entries(PAYMENT_METHODS).filter(([k]) => k !== "razorpay").map(([value, label]) => ({ value, label }))} />
              <TextField name="paid_at" label="Received on" type="datetime-local" defaultValue={toDateTimeInput(new Date())} />
            </div>
            <CheckboxField name="send_email" label="Email the receipt and invoice to the client" />
            <SubmitButton>Record payment</SubmitButton>
          </ActionForm>
        )}
      </Card>
    </>
  );
}
