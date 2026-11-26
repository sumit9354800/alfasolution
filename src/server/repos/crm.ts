import "server-only";
import type { PoolConnection } from "mysql2/promise";
import { execute, parseJson, query, queryOne } from "../db";

const like = (q: string) => `%${q.replace(/[%_\\]/g, "\\$&")}%`;

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

export const ENQUIRY_STATUSES = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
} as const;
export type EnquiryStatus = keyof typeof ENQUIRY_STATUSES;

export type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  budget: string | null;
  message: string;
  source: string;
  status: EnquiryStatus;
  client_id: number | null;
  ip_address: string | null;
  created_at: Date;
  updated_at: Date;
};

export type EnquiryNote = { id: number; note: string; created_at: Date; author: string | null };

export async function createEnquiry(data: Omit<Enquiry, "id" | "status" | "client_id" | "created_at" | "updated_at" | "ip_address"> & { ip: string; userAgent: string }) {
  const result = await execute(
    `INSERT INTO enquiries (name, email, phone, company, service, budget, message, source, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.email, data.phone, data.company, data.service, data.budget, data.message, data.source, data.ip, data.userAgent]
  );
  return result.insertId;
}

export async function listEnquiries(filters: { status?: string; q?: string; source?: string } = {}) {
  const where: string[] = [];
  const params: string[] = [];
  if (filters.status && filters.status in ENQUIRY_STATUSES) {
    where.push("status = ?");
    params.push(filters.status);
  } else {
    where.push("status <> 'spam'");
  }
  if (filters.source) {
    where.push("source = ?");
    params.push(filters.source);
  }
  if (filters.q) {
    where.push("(name LIKE ? OR email LIKE ? OR company LIKE ? OR message LIKE ?)");
    params.push(like(filters.q), like(filters.q), like(filters.q), like(filters.q));
  }
  return query<Enquiry>(`SELECT * FROM enquiries WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT 300`, params);
}

export async function getEnquiry(id: number) {
  const enquiry = await queryOne<Enquiry>("SELECT * FROM enquiries WHERE id = ?", [id]);
  if (!enquiry) return null;
  const notes = await query<EnquiryNote>(
    `SELECT n.id, n.note, n.created_at, u.name AS author FROM enquiry_notes n
     LEFT JOIN admin_users u ON u.id = n.user_id WHERE n.enquiry_id = ? ORDER BY n.created_at DESC`,
    [id]
  );
  return { enquiry, notes };
}

export async function enquiryStatusCounts() {
  const rows = await query<{ status: EnquiryStatus; n: number }>("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status");
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.n)])) as Partial<Record<EnquiryStatus, number>>;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export type Client = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  gstin: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  project_count?: number;
  total_paid?: number;
};

export async function listClients(q?: string) {
  const params: string[] = [];
  let where = "";
  if (q) {
    where = "WHERE c.name LIKE ? OR c.company LIKE ? OR c.email LIKE ? OR c.phone LIKE ?";
    params.push(like(q), like(q), like(q), like(q));
  }
  return query<Client>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM client_projects p WHERE p.client_id = c.id) AS project_count,
       (SELECT COALESCE(SUM(amount), 0) FROM payments y WHERE y.client_id = c.id AND y.status = 'paid') AS total_paid
     FROM clients c ${where} ORDER BY c.created_at DESC LIMIT 500`,
    params
  );
}

export async function listClientOptions() {
  return query<{ id: number; name: string; company: string | null; email: string }>("SELECT id, name, company, email FROM clients ORDER BY name");
}

export async function getClient(id: number) {
  return queryOne<Client>("SELECT * FROM clients WHERE id = ?", [id]);
}

export function formatClientAddress(c: Pick<Client, "address_line1" | "address_line2" | "city" | "state" | "postal_code" | "country">) {
  const cityLine = [c.city, c.state, c.postal_code].filter(Boolean).join(", ");
  return [c.address_line1, c.address_line2, cityLine, c.country].filter(Boolean).join("\n");
}

/** Finds a client by email or creates one (used when a new customer pays online). */
export async function findOrCreateClient(
  data: { name: string; email: string; phone?: string | null; company?: string | null; gstin?: string | null; address?: string | null },
  connection?: PoolConnection
) {
  const existing = await queryOne<{ id: number }>("SELECT id FROM clients WHERE email = ?", [data.email], connection);
  if (existing) return existing.id;
  const result = await execute(
    "INSERT INTO clients (name, email, phone, company, gstin, address_line1, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [data.name, data.email, data.phone ?? null, data.company ?? null, data.gstin ?? null, data.address ?? null, "Created automatically from an online payment."],
    connection
  );
  return result.insertId;
}

// ---------------------------------------------------------------------------
// Client projects
// ---------------------------------------------------------------------------

export const PROJECT_STATUSES = {
  planning: "Planning",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
  on_hold: "On hold",
  cancelled: "Cancelled",
} as const;
export type ProjectStatus = keyof typeof PROJECT_STATUSES;

export type ClientProject = {
  id: number;
  client_id: number;
  client_name: string;
  client_company: string | null;
  title: string;
  description: string | null;
  deliverables: { title: string; done: boolean }[];
  status: ProjectStatus;
  start_date: Date | null;
  due_date: Date | null;
  budget: number | null;
  currency: string;
  amount_paid: number;
  created_at: Date;
  updated_at: Date;
};

const PROJECT_SELECT = `SELECT p.*, c.name AS client_name, c.company AS client_company,
  (SELECT COALESCE(SUM(amount), 0) FROM payments y WHERE y.client_project_id = p.id AND y.status = 'paid') AS amount_paid
  FROM client_projects p JOIN clients c ON c.id = p.client_id`;

function mapClientProject(row: Record<string, unknown>): ClientProject {
  return { ...(row as unknown as ClientProject), deliverables: parseJson(row.deliverables, []), amount_paid: Number(row.amount_paid ?? 0) };
}

export async function listClientProjects(filters: { status?: string; client?: number; q?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.status && filters.status in PROJECT_STATUSES) {
    where.push("p.status = ?");
    params.push(filters.status);
  }
  if (filters.client) {
    where.push("p.client_id = ?");
    params.push(filters.client);
  }
  if (filters.q) {
    where.push("(p.title LIKE ? OR c.name LIKE ? OR c.company LIKE ?)");
    params.push(like(filters.q), like(filters.q), like(filters.q));
  }
  const rows = await query(`${PROJECT_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.updated_at DESC LIMIT 300`, params);
  return rows.map(mapClientProject);
}

export async function getClientProject(id: number) {
  const row = await queryOne(`${PROJECT_SELECT} WHERE p.id = ?`, [id]);
  return row ? mapClientProject(row) : null;
}

export async function listProjectOptions() {
  return query<{ id: number; title: string; client_id: number; client_name: string }>(
    "SELECT p.id, p.title, p.client_id, c.name AS client_name FROM client_projects p JOIN clients c ON c.id = p.client_id ORDER BY p.updated_at DESC"
  );
}

/** Everything that happened with a client, newest first. */
export async function clientHistory(clientId: number) {
  return query<{ kind: string; title: string; detail: string | null; at: Date; link: string }>(
    `SELECT 'project' AS kind, title, status AS detail, created_at AS at, CONCAT('/admin/projects/', id) AS link FROM client_projects WHERE client_id = ?
     UNION ALL
     SELECT 'payment', description, CONCAT(status, ' · ', amount), COALESCE(paid_at, created_at), CONCAT('/admin/payments/', id) FROM payments WHERE client_id = ?
     UNION ALL
     SELECT 'invoice', invoice_number, CONCAT(status, ' · ', total), created_at, CONCAT('/admin/invoices/', id) FROM invoices WHERE client_id = ?
     UNION ALL
     SELECT 'enquiry', service, status, created_at, CONCAT('/admin/enquiries/', id) FROM enquiries WHERE client_id = ?
     ORDER BY at DESC LIMIT 100`,
    [clientId, clientId, clientId, clientId]
  );
}
