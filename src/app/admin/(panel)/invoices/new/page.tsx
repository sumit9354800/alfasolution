import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { getSetting } from "@/server/settings";
import { listClientOptions, listProjectOptions } from "@/server/repos/crm";
import { ActionForm, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { LineItemsEditor } from "@/components/admin/LineItemsEditor";
import { Card, PageHeader } from "@/components/admin/ui";
import { toDateInput } from "@/lib/format";
import { daysFromNow } from "@/lib/time";
import { createInvoiceAction } from "../actions";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string; project?: string }> }) {
  await requirePageAccess("finance.manage");
  const [clients, projects, billing, sp] = await Promise.all([listClientOptions(), listProjectOptions(), getSetting("billing"), searchParams]);
  const due = daysFromNow(billing.paymentTermsDays || 7);
  return (
    <>
      <PageHeader back={{ href: "/admin/invoices", label: "Invoices" }} title="Create invoice" description="Billing details are taken from the client record. The number is assigned when you save." />
      {clients.length ? (
        <Card>
          <ActionForm action={createInvoiceAction} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField name="client_id" label="Client" required placeholder="Choose a client" defaultValue={sp.client ?? ""} options={clients.map((c) => ({ value: c.id, label: c.company ? `${c.company} (${c.name})` : c.name }))} />
              <SelectField name="project_id" label="Project" placeholder="No project" defaultValue={sp.project ?? ""} options={projects.map((p) => ({ value: p.id, label: `${p.title} — ${p.client_name}` }))} />
              <TextField name="issue_date" label="Issue date" type="date" required defaultValue={toDateInput(new Date())} />
              <TextField name="due_date" label="Due date" type="date" defaultValue={billing.paymentTermsDays ? toDateInput(due) : ""} hint="Leave empty to leave it off the invoice." />
            </div>
            <LineItemsEditor defaultTaxRate={Number(billing.taxRate) || 0} />
            <TextArea name="notes" label="Notes on the invoice" rows={3} defaultValue={billing.invoiceNotes} />
            <SelectField name="status" label="Save as" defaultValue="issued" options={[{ value: "issued", label: "Issued — ready to send" }, { value: "draft", label: "Draft — not visible to the client" }]} />
            <SubmitButton>Create invoice</SubmitButton>
          </ActionForm>
        </Card>
      ) : (
        <Card><p className="text-sm">Add a client first. <Link href="/admin/clients/new" className="text-accent">Add client</Link></p></Card>
      )}
    </>
  );
}
