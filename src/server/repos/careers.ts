import "server-only";
import { parseJson, query, queryOne } from "../db";

export const EMPLOYMENT_TYPES = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship" } as const;
export const WORK_MODES = { onsite: "On-site", remote: "Remote", hybrid: "Hybrid" } as const;
export const APPLICATION_STATUSES = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Not selected",
} as const;

export type Job = {
  id: number;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: keyof typeof EMPLOYMENT_TYPES;
  work_mode: keyof typeof WORK_MODES;
  experience: string | null;
  salary_range: string | null;
  summary: string;
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  status: "draft" | "open" | "closed";
  closes_at: Date | null;
  created_at: Date;
  updated_at: Date;
  application_count?: number;
};

function mapJob(row: Record<string, unknown>): Job {
  return {
    ...(row as unknown as Job),
    responsibilities: parseJson(row.responsibilities, []),
    requirements: parseJson(row.requirements, []),
  };
}

/** Open = status open and not past its closing date. */
const OPEN = "j.status = 'open' AND (j.closes_at IS NULL OR j.closes_at >= UTC_DATE())";

export async function listOpenJobs(filters: { department?: string; type?: string } = {}) {
  const where = [OPEN];
  const params: string[] = [];
  if (filters.department) {
    where.push("j.department = ?");
    params.push(filters.department);
  }
  if (filters.type && filters.type in EMPLOYMENT_TYPES) {
    where.push("j.employment_type = ?");
    params.push(filters.type);
  }
  const rows = await query(`SELECT j.* FROM job_openings j WHERE ${where.join(" AND ")} ORDER BY j.created_at DESC`, params);
  return rows.map(mapJob);
}

export async function listOpenDepartments() {
  const rows = await query<{ department: string }>(`SELECT DISTINCT j.department FROM job_openings j WHERE ${OPEN} ORDER BY j.department`);
  return rows.map((row) => row.department);
}

export async function getOpenJob(slug: string) {
  const row = await queryOne(`SELECT j.* FROM job_openings j WHERE j.slug = ? AND j.status <> 'draft'`, [slug]);
  return row ? mapJob(row) : null;
}

export function isJobOpen(job: Job) {
  if (job.status !== "open") return false;
  if (!job.closes_at) return true;
  const close = new Date(job.closes_at);
  close.setUTCHours(23, 59, 59, 999);
  return close.getTime() >= Date.now();
}

export async function listJobsForAdmin() {
  const rows = await query(
    `SELECT j.*, (SELECT COUNT(*) FROM job_applications a WHERE a.job_id = j.id) AS application_count
       FROM job_openings j ORDER BY FIELD(j.status, 'open', 'draft', 'closed'), j.created_at DESC`
  );
  return rows.map(mapJob);
}

export async function getJobById(id: number) {
  const row = await queryOne("SELECT * FROM job_openings WHERE id = ?", [id]);
  return row ? mapJob(row) : null;
}

export type Application = {
  id: number;
  job_id: number | null;
  job_title: string | null;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  experience_years: number | null;
  notice_period: string | null;
  cover_letter: string | null;
  resume_path: string;
  resume_original_name: string;
  resume_mime: string;
  resume_size: number;
  status: keyof typeof APPLICATION_STATUSES;
  internal_notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function listApplications(filters: { job?: number; status?: string; q?: string } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.job) {
    where.push("a.job_id = ?");
    params.push(filters.job);
  }
  if (filters.status && filters.status in APPLICATION_STATUSES) {
    where.push("a.status = ?");
    params.push(filters.status);
  }
  if (filters.q) {
    where.push("(a.full_name LIKE ? OR a.email LIKE ?)");
    const like = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    params.push(like, like);
  }
  return query<Application>(
    `SELECT a.*, j.title AS job_title FROM job_applications a LEFT JOIN job_openings j ON j.id = a.job_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY a.created_at DESC LIMIT 300`,
    params
  );
}

export async function getApplication(id: number) {
  return queryOne<Application>(
    "SELECT a.*, j.title AS job_title FROM job_applications a LEFT JOIN job_openings j ON j.id = a.job_id WHERE a.id = ?",
    [id]
  );
}
