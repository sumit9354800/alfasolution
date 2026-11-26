import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { APPLICATION_STATUSES, listApplications, listJobsForAdmin } from "@/server/repos/careers";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; job?: string }> }) {
  await requirePageAccess("careers.manage");
  const { status = "", q = "", job = "" } = await searchParams;
  const [applications, jobs] = await Promise.all([listApplications({ status, q, job: Number(job) || undefined }), listJobsForAdmin()]);
  const href = (s: string) => `/admin/careers/applications?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}), ...(job ? { job } : {}) })}`;
  return (
    <>
      <PageHeader title="Applicants" description="Applications submitted through the careers pages." back={{ href: "/admin/careers", label: "Job openings" }} />
      <FilterTabs active={status} items={[{ key: "", label: "All", href: href("") }, ...Object.entries(APPLICATION_STATUSES).map(([key, label]) => ({ key, label, href: href(key) }))]} />
      <Toolbar action="/admin/careers/applications" q={q} placeholder="Search name or email">
        <label className="sr-only" htmlFor="job-filter">Role</label>
        <select id="job-filter" name="job" defaultValue={job} className="input !min-h-9 w-auto py-1.5 text-sm">
          <option value="">All roles</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        {status ? <input type="hidden" name="status" value={status} /> : null}
      </Toolbar>
      <Table head={["Applicant", "Role", "Experience", "Applied", "CV", "Status"]} empty="No applications found.">
        {applications.map((a) => (
          <tr key={a.id} className="hover:bg-paper">
            <Td><Link href={`/admin/careers/applications/${a.id}`} className="font-semibold hover:text-accent">{a.full_name}</Link><p className="text-xs text-slate">{a.email}</p></Td>
            <Td className="text-slate">{a.job_title ?? "General application"}</Td>
            <Td className="text-slate">{a.experience_years != null ? `${Number(a.experience_years)} yrs` : "—"}</Td>
            <Td className="whitespace-nowrap text-slate">{formatDateTime(a.created_at)}</Td>
            <Td><a href={`/api/admin/applications/${a.id}/resume`} className="text-accent">Download</a></Td>
            <Td><StatusBadge status={a.status} label={APPLICATION_STATUSES[a.status]} /></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
