import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { can } from "@/lib/rbac";
import { idParam } from "@/server/admin-action";
import { PROJECT_STATUSES, clientHistory, getClient, listClientProjects } from "@/server/repos/crm";
import { listInvoices, INVOICE_STATUSES } from "@/server/finance/invoices";
import { listPayments, PAYMENT_STATUSES } from "@/server/finance/payments";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { Badge, Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { deleteClient, updateClient } from "../actions";
import { ClientFields } from "../ClientFields";

export default async function ClientDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const user = await requirePageAccess("clients.manage");
  const id = idParam((await params).id);
  const client = id ? await getClient(id) : null;
  if (!client || !id) notFound();
  const { created } = await searchParams;
  const finance = can(user.role, "finance.manage");
  const [projects, invoices, payments, history] = await Promise.all([
    listClientProjects({ client: id }),
    finance ? listInvoices({ client: id }) : Promise.resolve([]),
    finance ? listPayments({ client: id }) : Promise.resolve([]),
    clientHistory(id),
  ]);
  const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = invoices.filter((i) => i.status === "issued" || i.status === "partially_paid").reduce((s, i) => s + Number(i.total) - Number(i.amount_paid), 0);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/clients", label: "Clients" }}
        title={client.company || client.name}
        description={`${client.name} · ${client.email} · client since ${formatDate(client.created_at)}`}
        actions={
          <>
            <Link href={`/admin/projects/new?client=${id}`} className="btn btn-outline btn-sm">New project</Link>
            {finance ? <Link href={`/admin/invoices/new?client=${id}`} className="btn btn-outline btn-sm">New invoice</Link> : null}
            {finance ? <Link href={`/admin/payments/new?client=${id}`} className="btn btn-dark btn-sm">Request payment</Link> : null}
          </>
        }
      />
      {created ? <p role="status" className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-success">Client added. Start a project or send a payment request.</p> : null}

      {finance ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card><p className="text-sm text-slate">Paid to date</p><p className="mt-1 font-display text-2xl font-semibold">{formatMoney(paid)}</p></Card>
          <Card><p className="text-sm text-slate">Outstanding</p><p className="mt-1 font-display text-2xl font-semibold">{formatMoney(outstanding)}</p></Card>
          <Card><p className="text-sm text-slate">Projects</p><p className="mt-1 font-display text-2xl font-semibold">{projects.length}</p></Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card title="Projects" padded={false}>
            {projects.length ? (
              <ul className="divide-y divide-line">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                      <span className="text-sm font-semibold">{p.title}</span>
                      <StatusBadge status={p.status} label={PROJECT_STATUSES[p.status]} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 py-6 text-sm text-slate">No projects yet.</p>}
          </Card>
          {finance ? (
            <Card title="Invoices & payments" padded={false}>
              <ul className="divide-y divide-line text-sm">
                {invoices.map((i) => (
                  <li key={`i${i.id}`}>
                    <Link href={`/admin/invoices/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                      <span><Badge>Invoice</Badge> <span className="ml-2 font-semibold">{i.invoice_number}</span></span>
                      <span className="flex items-center gap-3"><span className="tabular-nums">{formatMoney(i.total)}</span><StatusBadge status={i.status} label={INVOICE_STATUSES[i.status]} /></span>
                    </Link>
                  </li>
                ))}
                {payments.map((p) => (
                  <li key={`p${p.id}`}>
                    <Link href={`/admin/payments/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                      <span><Badge>Payment</Badge> <span className="ml-2">{p.description}</span></span>
                      <span className="flex items-center gap-3"><span className="tabular-nums">{formatMoney(p.amount)}</span><StatusBadge status={p.status} label={PAYMENT_STATUSES[p.status]} /></span>
                    </Link>
                  </li>
                ))}
                {!invoices.length && !payments.length ? <li className="px-5 py-6 text-slate">No invoices or payments yet.</li> : null}
              </ul>
            </Card>
          ) : null}
          <Card title="Client details">
            <ActionForm action={updateClient.bind(null, id)} className="space-y-6">
              <ClientFields client={client} />
              <SubmitButton>Save client</SubmitButton>
            </ActionForm>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="History">
            {history.length ? (
              <ol className="space-y-4">
                {history.map((h, i) => (
                  <li key={i} className="border-l-2 border-line pl-4 text-sm">
                    <Link href={h.link} className="font-semibold hover:text-accent">{h.title}</Link>
                    <p className="text-xs text-slate"><Badge>{h.kind}</Badge> {h.detail} · {formatDateTime(h.at)}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-slate">Nothing recorded yet.</p>}
          </Card>
          <ActionForm action={deleteClient.bind(null, id)}>
            <ConfirmSubmit label="Delete client" />
            <p className="mt-2 text-xs text-slate">Clients with projects can’t be deleted.</p>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
