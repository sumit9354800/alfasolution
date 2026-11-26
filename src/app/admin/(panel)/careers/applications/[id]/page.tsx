import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { APPLICATION_STATUSES, getApplication } from "@/server/repos/careers";
import { ActionForm, SelectField, SubmitButton, TextArea } from "@/components/admin/form";
import { Card, DescriptionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { updateApplication } from "../../actions";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("careers.manage");
  const id = idParam((await params).id);
  const a = id ? await getApplication(id) : null;
  if (!a || !id) notFound();
  const safeUrl = (url: string | null) => (url && /^https?:\/\//.test(url) ? <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="text-accent">{url.replace(/^https?:\/\//, "").slice(0, 40)}</a> : "—");
  return (
    <>
      <PageHeader
        back={{ href: "/admin/careers/applications", label: "Applicants" }}
        title={a.full_name}
        description={<span className="flex items-center gap-2">{a.job_id ? <Link href={`/admin/careers/${a.job_id}`} className="text-accent">{a.job_title}</Link> : "General application"} · applied {formatDateTime(a.created_at)} <StatusBadge status={a.status} label={APPLICATION_STATUSES[a.status]} /></span>}
        actions={<><a href={`/api/admin/applications/${id}/resume`} className="btn btn-dark btn-sm">Download CV</a><a href={`mailto:${a.email}`} className="btn btn-outline btn-sm">Email</a></>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card title="Applicant">
            <DescriptionList items={[
              ["Email", a.email],
              ["Phone", a.phone],
              ["Experience", a.experience_years != null ? `${Number(a.experience_years)} years` : "—"],
              ["Notice period", a.notice_period ?? "—"],
              ["LinkedIn", safeUrl(a.linkedin_url)],
              ["Portfolio", safeUrl(a.portfolio_url)],
              ["CV file", `${a.resume_original_name} (${Math.round(a.resume_size / 1024)} KB)`],
            ]} />
          </Card>
          <Card title="Why this role">
            <p className="whitespace-pre-line text-sm leading-relaxed">{a.cover_letter || "No note provided."}</p>
          </Card>
        </div>
        <Card title="Review">
          <ActionForm action={updateApplication.bind(null, id)} className="space-y-4">
            <SelectField name="status" label="Status" defaultValue={a.status} options={Object.entries(APPLICATION_STATUSES).map(([value, label]) => ({ value, label }))} />
            <TextArea name="internal_notes" label="Internal notes" rows={8} defaultValue={a.internal_notes} hint="Only visible to your team." />
            <SubmitButton>Save</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
