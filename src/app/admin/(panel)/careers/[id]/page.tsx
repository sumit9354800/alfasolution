import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { getJobById } from "@/server/repos/careers";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { deleteJob, setJobStatus, updateJob } from "../actions";
import { JobForm } from "../JobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("careers.manage");
  const id = idParam((await params).id);
  const job = id ? await getJobById(id) : null;
  if (!job || !id) notFound();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/careers", label: "Job openings" }}
        title={job.title}
        description={<StatusBadge status={job.status} />}
        actions={
          <>
            <Link href={`/admin/careers/applications?job=${id}`} className="btn btn-outline btn-sm">Applicants</Link>
            {job.status !== "draft" ? <a href={`/careers/${job.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View on site</a> : null}
            <ActionForm action={setJobStatus.bind(null, id, job.status === "open" ? "closed" : "open")}>
              <SubmitButton variant={job.status === "open" ? "outline" : "primary"}>{job.status === "open" ? "Close role" : "Publish role"}</SubmitButton>
            </ActionForm>
          </>
        }
      />
      <JobForm action={updateJob.bind(null, id)} job={job} submitLabel="Save role" />
      <ActionForm action={deleteJob.bind(null, id)} className="mt-8">
        <ConfirmSubmit label="Delete role" />
      </ActionForm>
    </>
  );
}
