import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { EMPLOYMENT_TYPES, listJobsForAdmin } from "@/server/repos/careers";
import { PageHeader, StatusBadge, Table, Td } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export default async function CareersAdminPage() {
  await requirePageAccess("careers.manage");
  const jobs = await listJobsForAdmin();
  return (
    <>
      <PageHeader title="Job openings" description="Roles listed on /careers." actions={<><Link href="/admin/careers/applications" className="btn btn-outline btn-sm">All applicants</Link><Link href="/admin/careers/new" className="btn btn-dark btn-sm">Post a job</Link></>} />
      <Table head={["Role", "Type", "Applicants", "Closes", "Status"]} empty="No job openings yet.">
        {jobs.map((j) => (
          <tr key={j.id} className="hover:bg-paper">
            <Td><Link href={`/admin/careers/${j.id}`} className="font-semibold hover:text-accent">{j.title}</Link><p className="text-xs text-slate">{j.department} · {j.location}</p></Td>
            <Td className="text-slate">{EMPLOYMENT_TYPES[j.employment_type]}</Td>
            <Td><Link href={`/admin/careers/applications?job=${j.id}`} className="text-accent">{j.application_count}</Link></Td>
            <Td className="text-slate">{formatDate(j.closes_at)}</Td>
            <Td><StatusBadge status={j.status} /></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
