import { requirePageAccess } from "@/server/auth/guard";
import { listActivity } from "@/server/repos/admin";
import { Badge, PageHeader, Table, Td } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

export default async function ActivityPage() {
  await requirePageAccess("activity.view");
  const rows = await listActivity(300);
  return (
    <>
      <PageHeader title="Activity log" description="The last 300 admin actions, including sign-ins and downloads." />
      <Table head={["When", "Who", "What", "Area", "IP"]} empty="No activity yet.">
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="whitespace-nowrap text-slate">{formatDateTime(r.created_at)}</Td>
            <Td>{r.user_name ?? "System"}</Td>
            <Td>{r.summary}</Td>
            <Td><Badge>{r.entity_type}</Badge></Td>
            <Td className="text-slate">{r.ip_address ?? "—"}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
