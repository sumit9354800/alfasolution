import { requirePageAccess } from "@/server/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { createJob } from "../actions";
import { JobForm } from "../JobForm";

export default async function NewJobPage() {
  await requirePageAccess("careers.manage");
  return (
    <>
      <PageHeader back={{ href: "/admin/careers", label: "Job openings" }} title="Post a job" />
      <JobForm action={createJob} submitLabel="Save role" />
    </>
  );
}
