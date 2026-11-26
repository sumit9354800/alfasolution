import { requirePageAccess } from "@/server/auth/guard";
import { can, ROLE_LABELS } from "@/lib/rbac";
import { query } from "@/server/db";
import { ADMIN_NAV } from "@/components/admin/nav";
import { Sidebar } from "@/components/admin/Sidebar";
import { logoutAction } from "../login/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageAccess("dashboard.view");
  const groups = ADMIN_NAV.map((group) => ({ ...group, items: group.items.filter((item) => can(user.role, item.permission)) })).filter((g) => g.items.length);

  const [counts] = await query<{ enquiries: number; applications: number }>(
    "SELECT (SELECT COUNT(*) FROM enquiries WHERE status = 'new') AS enquiries, (SELECT COUNT(*) FROM job_applications WHERE status = 'new') AS applications"
  );
  const badges: Record<string, number> = {};
  if (can(user.role, "enquiries.manage")) badges["/admin/enquiries"] = Number(counts?.enquiries ?? 0);
  if (can(user.role, "careers.manage")) badges["/admin/careers/applications"] = Number(counts?.applications ?? 0);

  return (
    <>
      <Sidebar groups={groups} user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }} logout={logoutAction} badges={badges} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </>
  );
}
