import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { can } from "@/lib/rbac";
import { dashboardStats, listActivity, monthlySeries, paymentSummary } from "@/server/repos/admin";
import { ENQUIRY_STATUSES, listEnquiries } from "@/server/repos/crm";
import { listApplications } from "@/server/repos/careers";
import { PAYMENT_STATUSES } from "@/server/finance/payments";
import { Badge, Card, PageHeader, Stat, StatusBadge } from "@/components/admin/ui";
import { BarChart } from "@/components/admin/BarChart";
import { formatDateTime, formatMoney } from "@/lib/format";

const compactMoney = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `₹${n}`;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requirePageAccess("dashboard.view");
  const { denied } = await searchParams;
  const finance = can(user.role, "finance.manage");
  const sales = can(user.role, "enquiries.manage");
  const hr = can(user.role, "careers.manage");

  const [stats, series, activity, enquiries, applications, payments] = await Promise.all([
    dashboardStats(),
    monthlySeries(),
    can(user.role, "activity.view") ? listActivity(8) : Promise.resolve([]),
    sales ? listEnquiries() : Promise.resolve([]),
    hr ? listApplications({ status: "new" }) : Promise.resolve([]),
    finance ? paymentSummary() : Promise.resolve([]),
  ]);
  const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleString("en-IN", { month: "short", timeZone: "UTC" });

  const quickActions = [
    sales && { label: "Add client", href: "/admin/clients/new" },
    finance && { label: "Create invoice", href: "/admin/invoices/new" },
    finance && { label: "Request a payment", href: "/admin/payments/new" },
    can(user.role, "blog.manage") && { label: "Write a post", href: "/admin/blog/new" },
    can(user.role, "portfolio.manage") && { label: "Add portfolio project", href: "/admin/portfolio/new" },
    hr && { label: "Post a job", href: "/admin/careers/new" },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} description="Here’s what’s happening across the studio." />
      {denied ? (
        <p role="alert" className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-warning">
          Your role doesn’t have access to that section. Ask a super admin if you need it.
        </p>
      ) : null}

      {quickActions.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="btn btn-outline btn-sm">
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sales ? <Stat label="Enquiries" value={stats.enquiries} hint={`${stats.new_enquiries} new · ${stats.enquiries_30d} in the last 30 days`} href="/admin/enquiries" /> : null}
        {sales ? <Stat label="Clients" value={stats.clients} hint={`${stats.active_projects} active projects`} href="/admin/clients" /> : null}
        {sales ? <Stat label="Projects" value={stats.projects} hint={`${stats.portfolio} published in portfolio`} href="/admin/projects" /> : null}
        {finance ? <Stat label="Revenue received" value={formatMoney(stats.revenue)} hint={`${formatMoney(stats.revenue_30d)} in the last 30 days`} href="/admin/payments?status=paid" /> : null}
        {finance ? <Stat label="Outstanding invoices" value={formatMoney(stats.outstanding)} hint="Issued and partially paid" href="/admin/invoices?status=issued" /> : null}
        {hr ? <Stat label="New applicants" value={stats.new_applications} hint={`${stats.open_jobs} open roles`} href="/admin/careers/applications" /> : null}
        {!sales && !finance ? <Stat label="Published posts" value={stats.posts} href="/admin/blog" /> : null}
        {!sales && !finance ? <Stat label="Portfolio projects" value={stats.portfolio} href="/admin/portfolio" /> : null}
      </div>

      {sales || finance ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {finance ? (
            <Card>
              <BarChart title="Revenue received per month" data={series.map((s) => ({ label: monthLabel(s.month), value: s.revenue }))} format={compactMoney} />
            </Card>
          ) : null}
          {sales ? (
            <Card>
              <BarChart title="Enquiries per month" data={series.map((s) => ({ label: monthLabel(s.month), value: s.enquiries }))} />
            </Card>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {sales ? (
          <Card title="Recent enquiries" padded={false} actions={<Link href="/admin/enquiries" className="text-sm text-accent">View all</Link>}>
            {enquiries.length ? (
              <ul className="divide-y divide-line">
                {enquiries.slice(0, 6).map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{e.name}{e.company ? ` · ${e.company}` : ""}</p>
                        <p className="truncate text-xs text-slate">{e.service} · {formatDateTime(e.created_at)}</p>
                      </div>
                      <StatusBadge status={e.status} label={ENQUIRY_STATUSES[e.status]} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-slate">No enquiries yet. They’ll appear here as soon as someone uses the contact form.</p>
            )}
          </Card>
        ) : null}

        <div className="space-y-6">
          {finance ? (
            <Card title="Payments" actions={<Link href="/admin/payments" className="text-sm text-accent">View all</Link>}>
              {payments.length ? (
                <ul className="space-y-2.5 text-sm">
                  {payments.map((p) => (
                    <li key={p.status} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <StatusBadge status={p.status} label={PAYMENT_STATUSES[p.status as keyof typeof PAYMENT_STATUSES] ?? p.status} />
                        <span className="text-slate">{Number(p.n)} payments</span>
                      </span>
                      <span className="font-semibold tabular-nums">{formatMoney(p.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate">No payments yet.</p>
              )}
            </Card>
          ) : null}

          {hr ? (
            <Card title="Applicants to review" actions={<Link href="/admin/careers/applications" className="text-sm text-accent">View all</Link>} padded={false}>
              {applications.length ? (
                <ul className="divide-y divide-line">
                  {applications.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <Link href={`/admin/careers/applications/${a.id}`} className="block px-5 py-3 hover:bg-paper">
                        <p className="text-sm font-semibold">{a.full_name}</p>
                        <p className="text-xs text-slate">{a.job_title ?? "General application"} · {formatDateTime(a.created_at)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-6 text-sm text-slate">No new applications.</p>
              )}
            </Card>
          ) : null}

          {activity.length ? (
            <Card title="Recent activity" actions={<Link href="/admin/activity" className="text-sm text-accent">Full log</Link>}>
              <ul className="space-y-3 text-sm">
                {activity.map((a) => (
                  <li key={a.id}>
                    <p>{a.summary}</p>
                    <p className="text-xs text-slate">
                      {a.user_name ?? "System"} · {formatDateTime(a.created_at)} <Badge>{a.entity_type}</Badge>
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
