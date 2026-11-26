import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listServices } from "@/server/repos/content";
import { Badge, PageHeader, Table, Td } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export default async function ServicesAdminPage() {
  await requirePageAccess("content.manage");
  const services = await listServices({ includeDrafts: true });
  return (
    <>
      <PageHeader title="Services" description="Each service has its own page at /services/<slug>." actions={<Link href="/admin/services/new" className="btn btn-dark btn-sm">Add service</Link>} />
      <Table head={["Service", "URL", "Order", "Updated", "Status"]} empty="No services yet.">
        {services.map((s) => (
          <tr key={s.id} className="hover:bg-paper">
            <Td><Link href={`/admin/services/${s.id}`} className="font-semibold hover:text-accent">{s.title}</Link><p className="max-w-md truncate text-xs text-slate">{s.short_description}</p></Td>
            <Td><a href={`/services/${s.slug}`} target="_blank" rel="noopener" className="text-slate hover:text-accent">/services/{s.slug}</a></Td>
            <Td>{s.sort_order}</Td>
            <Td className="text-slate">{formatDate(s.updated_at)}</Td>
            <Td>{s.is_published ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
