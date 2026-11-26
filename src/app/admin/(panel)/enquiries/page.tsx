import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { ENQUIRY_STATUSES, enquiryStatusCounts, listEnquiries } from "@/server/repos/crm";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function EnquiriesPage({ searchParams }: Props) {
  await requirePageAccess("enquiries.manage");
  const { status = "", q = "" } = await searchParams;
  const [enquiries, counts] = await Promise.all([listEnquiries({ status, q }), enquiryStatusCounts()]);
  const tab = (key: string) => `/admin/enquiries?${new URLSearchParams({ ...(key ? { status: key } : {}), ...(q ? { q } : {}) })}`;

  return (
    <>
      <PageHeader title="Enquiries" description="Every contact, service and pricing form submission." />
      <FilterTabs
        active={status}
        items={[
          { key: "", label: "All active", href: tab("") },
          ...Object.entries(ENQUIRY_STATUSES).map(([key, label]) => ({ key, label, href: tab(key), count: counts[key as keyof typeof counts] ?? 0 })),
        ]}
      />
      <Toolbar action="/admin/enquiries" q={q} placeholder="Search name, email, company or message">
        {status ? <input type="hidden" name="status" value={status} /> : null}
      </Toolbar>
      <Table head={["From", "Service", "Budget", "Source", "Received", "Status"]} empty={q || status ? "No enquiries match these filters." : "No enquiries yet."}>
        {enquiries.map((e) => (
          <tr key={e.id} className="hover:bg-paper">
            <Td>
              <Link href={`/admin/enquiries/${e.id}`} className="font-semibold hover:text-accent">{e.name}</Link>
              <p className="text-xs text-slate">{e.email}{e.company ? ` · ${e.company}` : ""}</p>
            </Td>
            <Td>{e.service}</Td>
            <Td className="text-slate">{e.budget ?? "—"}</Td>
            <Td className="text-slate">{e.source}</Td>
            <Td className="whitespace-nowrap text-slate">{formatDateTime(e.created_at)}</Td>
            <Td><StatusBadge status={e.status} label={ENQUIRY_STATUSES[e.status]} /></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
