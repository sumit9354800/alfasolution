import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { can } from "@/lib/rbac";
import { idParam } from "@/server/admin-action";
import { ENQUIRY_STATUSES, getEnquiry } from "@/server/repos/crm";
import { ActionForm, ConfirmSubmit, SelectField, SubmitButton, TextArea } from "@/components/admin/form";
import { Card, DescriptionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { addEnquiryNote, convertToClient, deleteEnquiry, updateEnquiryStatus } from "../actions";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageAccess("enquiries.manage");
  const id = idParam((await params).id);
  const data = id ? await getEnquiry(id) : null;
  if (!data || !id) notFound();
  const { enquiry: e, notes } = data;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/enquiries", label: "Enquiries" }}
        title={e.name}
        description={<span className="flex items-center gap-2">{e.service} · received {formatDateTime(e.created_at)} <StatusBadge status={e.status} label={ENQUIRY_STATUSES[e.status]} /></span>}
        actions={
          <>
            <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: your ${e.service} enquiry`)}`} className="btn btn-dark btn-sm">Reply by email</a>
            {e.phone ? <a href={`tel:${e.phone}`} className="btn btn-outline btn-sm">Call</a> : null}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Message">
            <p className="whitespace-pre-line leading-relaxed">{e.message}</p>
          </Card>
          <Card title="Internal notes">
            <ActionForm action={addEnquiryNote.bind(null, id)} resetOnSuccess className="space-y-3">
              <TextArea name="note" label="Add a note" rows={3} placeholder="Call summary, next steps, quote sent…" />
              <SubmitButton>Add note</SubmitButton>
            </ActionForm>
            <ul className="mt-6 space-y-4">
              {notes.map((n) => (
                <li key={n.id} className="border-l-2 border-line pl-4">
                  <p className="whitespace-pre-line text-sm">{n.note}</p>
                  <p className="mt-1 text-xs text-slate">{n.author ?? "Deleted user"} · {formatDateTime(n.created_at)}</p>
                </li>
              ))}
              {!notes.length ? <li className="text-sm text-slate">No notes yet. Notes are only visible to your team.</li> : null}
            </ul>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Contact">
            <DescriptionList
              items={[
                ["Email", <a key="e" href={`mailto:${e.email}`} className="text-accent">{e.email}</a>],
                ["Phone", e.phone ?? "—"],
                ["Company", e.company ?? "—"],
                ["Budget", e.budget ?? "—"],
                ["Source", e.source],
                ["IP address", e.ip_address ?? "—"],
              ]}
            />
          </Card>
          <Card title="Status">
            <ActionForm action={updateEnquiryStatus.bind(null, id)} className="space-y-3">
              <SelectField name="status" label="Pipeline stage" defaultValue={e.status} options={Object.entries(ENQUIRY_STATUSES).map(([value, label]) => ({ value, label }))} />
              <SubmitButton>Update status</SubmitButton>
            </ActionForm>
          </Card>
          {can(user.role, "clients.manage") ? (
            <Card title="Client record">
              {e.client_id ? (
                <p className="text-sm">Linked to <Link href={`/admin/clients/${e.client_id}`} className="font-semibold text-accent">client #{e.client_id}</Link>.</p>
              ) : (
                <ActionForm action={convertToClient.bind(null, id)} className="space-y-3">
                  <p className="text-sm text-slate">Create a client from this enquiry to start a project, invoice or payment request.</p>
                  <SubmitButton variant="primary">Convert to client</SubmitButton>
                </ActionForm>
              )}
            </Card>
          ) : null}
          <ActionForm action={deleteEnquiry.bind(null, id)}>
            <ConfirmSubmit label="Delete enquiry" />
          </ActionForm>
        </div>
      </div>
    </>
  );
}
