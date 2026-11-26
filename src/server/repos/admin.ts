import "server-only";
import { query, queryOne } from "../db";
import type { Role } from "@/lib/rbac";

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: number;
  last_login_at: Date | null;
  created_at: Date;
};

export function listAdminUsers() {
  return query<AdminUserRow>("SELECT id, name, email, role, is_active, last_login_at, created_at FROM admin_users ORDER BY created_at");
}

export function getAdminUser(id: number) {
  return queryOne<AdminUserRow>("SELECT id, name, email, role, is_active, last_login_at, created_at FROM admin_users WHERE id = ?", [id]);
}

export type ActivityRow = { id: number; action: string; entity_type: string; entity_id: string | null; summary: string; created_at: Date; user_name: string | null; ip_address: string | null };

export function listActivity(limit = 50) {
  return query<ActivityRow>(
    `SELECT a.*, u.name AS user_name FROM activity_log a LEFT JOIN admin_users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT ?`,
    [limit]
  );
}

export type Media = { id: number; path: string; original_name: string; mime_type: string; size_bytes: number; alt_text: string | null; created_at: Date };

export function listMedia(limit = 120) {
  return query<Media>("SELECT * FROM media ORDER BY created_at DESC LIMIT ?", [limit]);
}

// --- Dashboard ----------------------------------------------------------------

export async function dashboardStats() {
  const [row] = await query<Record<string, number>>(
    `SELECT
       (SELECT COUNT(*) FROM enquiries WHERE status <> 'spam') AS enquiries,
       (SELECT COUNT(*) FROM enquiries WHERE status = 'new') AS new_enquiries,
       (SELECT COUNT(*) FROM enquiries WHERE created_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY AND status <> 'spam') AS enquiries_30d,
       (SELECT COUNT(*) FROM clients) AS clients,
       (SELECT COUNT(*) FROM client_projects) AS projects,
       (SELECT COUNT(*) FROM client_projects WHERE status IN ('planning','in_progress','review')) AS active_projects,
       (SELECT COUNT(*) FROM portfolio_projects WHERE is_published = 1) AS portfolio,
       (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid') AS revenue,
       (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'paid' AND paid_at >= UTC_TIMESTAMP() - INTERVAL 30 DAY) AS revenue_30d,
       (SELECT COALESCE(SUM(total - amount_paid), 0) FROM invoices WHERE status IN ('issued','partially_paid')) AS outstanding,
       (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pending_payments,
       (SELECT COUNT(*) FROM payments WHERE status = 'failed') AS failed_payments,
       (SELECT COUNT(*) FROM job_applications WHERE status = 'new') AS new_applications,
       (SELECT COUNT(*) FROM job_openings WHERE status = 'open') AS open_jobs,
       (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') AS posts`
  );
  return Object.fromEntries(Object.entries(row ?? {}).map(([key, value]) => [key, Number(value)])) as Record<string, number>;
}

/** Revenue and enquiries per month for the last 6 months (IST). */
export async function monthlySeries() {
  const revenue = await query<{ month: string; total: number }>(
    `SELECT DATE_FORMAT(CONVERT_TZ(paid_at, '+00:00', '+05:30'), '%Y-%m') AS month, SUM(amount) AS total
       FROM payments WHERE status = 'paid' AND paid_at >= UTC_TIMESTAMP() - INTERVAL 6 MONTH GROUP BY month`
  );
  const enquiries = await query<{ month: string; total: number }>(
    `SELECT DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+05:30'), '%Y-%m') AS month, COUNT(*) AS total
       FROM enquiries WHERE status <> 'spam' AND created_at >= UTC_TIMESTAMP() - INTERVAL 6 MONTH GROUP BY month`
  );
  const months: string[] = [];
  const now = new Date(Date.now() + 330 * 60_000);
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const r = Object.fromEntries(revenue.map((row) => [row.month, Number(row.total)]));
  const e = Object.fromEntries(enquiries.map((row) => [row.month, Number(row.total)]));
  return months.map((month) => ({ month, revenue: r[month] ?? 0, enquiries: e[month] ?? 0 }));
}

export function paymentSummary() {
  return query<{ status: string; n: number; total: number }>("SELECT status, COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM payments GROUP BY status");
}
