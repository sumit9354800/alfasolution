import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { requirePageAccess } from "@/server/auth/guard";
import { can } from "@/lib/rbac";
import { idParam } from "@/server/admin-action";
import { query } from "@/server/db";
import { PROJECT_STATUSES, getClientProject, listClientOptions } from "@/server/repos/crm";
import { PAYMENT_STATUSES, type Payment } from "@/server/finance/payments";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { Card, DescriptionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { deleteProject, updateProject } from "../actions";
import { ProjectFields } from "../ProjectFields";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAccess("clients.manage");
  const id = idParam((await params).id);
  const project = id ? await getClientProject(id) : null;
  if (!project || !id) notFound();
  const finance = can(user.role, "finance.manage");
  const [clients, payments] = await Promise.all([
    listClientOptions(),
    finance ? query<Payment>("SELECT * FROM payments WHERE client_project_id = ? ORDER BY created_at DESC", [id]) : Promise.resolve([]),
  ]);
  const budget = Number(project.budget ?? 0);
  const remaining = Math.max(0, budget - project.amount_paid);
  const done = project.deliverables.filter((d) => d.done).length;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/projects", label: "Projects" }}
        title={project.title}
        description={<span className="flex items-center gap-2"><Link href={`/admin/clients/${project.client_id}`} className="text-accent">{project.client_company || project.client_name}</Link> <StatusBadge status={project.status} label={PROJECT_STATUSES[project.status]} /></span>}
        actions={finance ? (
          <>
            <Link href={`/admin/payments/new?client=${project.client_id}&project=${id}&purpose=advance`} className="btn btn-outline btn-sm">Request advance</Link>
            <Link href={`/admin/payments/new?client=${project.client_id}&project=${id}&purpose=final${remaining ? `&amount=${remaining}` : ""}`} className="btn btn-dark btn-sm">Request remaining</Link>
          </>
        ) : null}
      />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Project details">
          <ActionForm action={updateProject.bind(null, id)} className="space-y-6">
            <ProjectFields project={project} clients={clients} />
            <SubmitButton>Save project</SubmitButton>
          </ActionForm>
        </Card>
        <div className="space-y-6">
          <Card title="Summary">
            <DescriptionList items={[
              ["Budget", budget ? formatMoney(budget) : "—"],
              ["Received", formatMoney(project.amount_paid)],
              ["Remaining", budget ? formatMoney(remaining) : "—"],
              ["Start", formatDate(project.start_date)],
              ["Due", formatDate(project.due_date)],
              ["Deliverables", project.deliverables.length ? `${done} of ${project.deliverables.length} complete` : "—"],
            ]} />
            {budget ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper" role="img" aria-label={`${Math.round((project.amount_paid / budget) * 100)}% of budget received`}>
                <div className="h-full rounded-full bg-ink" style={{ width: `${Math.min(100, (project.amount_paid / budget) * 100)}%` }} />
              </div>
            ) : null}
          </Card>
          {project.deliverables.length ? (
            <Card title="Deliverables">
              <ul className="space-y-2 text-sm">
                {project.deliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className={`flex h-5 w-5 items-center justify-center rounded border ${d.done ? "border-ink bg-ink text-white" : "border-line-strong"}`}>{d.done ? <Check size={13} /> : null}</span>
                    <span className={d.done ? "text-slate line-through" : ""}>{d.title}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {finance ? (
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
              ) : <p className="px-5 py-6 text-sm text-slate">No payments for this project yet.</p>}
            </Card>
          ) : null}
          <ActionForm action={deleteProject.bind(null, id)}>
            <ConfirmSubmit label="Delete project" />
          </ActionForm>
        </div>
      </div>
    </>
  );
}
