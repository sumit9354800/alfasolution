"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/format";
import { adminAction, lines, str, UserFacingError, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, queryOne, toJson } from "@/server/db";
import { logActivity } from "@/server/audit";
import { refreshPublicSite } from "@/server/revalidate";
import { sanitizeRichText } from "@/server/security/sanitize";
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, WORK_MODES } from "@/server/repos/careers";

const schema = z.object({
  title: z.string().trim().min(2, "Enter a job title.").max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(160),
  department: z.string().trim().min(2, "Enter a team or department.").max(120),
  location: z.string().trim().min(2, "Enter a location.").max(160),
  employment_type: z.enum(Object.keys(EMPLOYMENT_TYPES) as [string, ...string[]]),
  work_mode: z.enum(Object.keys(WORK_MODES) as [string, ...string[]]),
  experience: z.string().trim().max(80),
  salary_range: z.string().trim().max(120),
  summary: z.string().trim().min(10, "Write a one-line summary.").max(500),
  status: z.enum(["draft", "open", "closed"]),
  closes_at: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

function parse(form: FormData) {
  const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(form, k)]));
  if (!raw.slug) raw.slug = slugify(String(raw.title));
  const r = schema.safeParse(raw);
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  return { ...r.data, description: sanitizeRichText(str(form, "description")), responsibilities: lines(form, "responsibilities"), requirements: lines(form, "requirements") };
}
const n = (v: string) => v || null;
const values = (d: ReturnType<typeof parse>) => [d.slug, d.title, d.department, d.location, d.employment_type, d.work_mode, n(d.experience), n(d.salary_range), d.summary, n(d.description), toJson(d.responsibilities), toJson(d.requirements), d.status, n(d.closes_at)];
const COLUMNS = ["slug", "title", "department", "location", "employment_type", "work_mode", "experience", "salary_range", "summary", "description", "responsibilities", "requirements", "status", "closes_at"];

export async function createJob(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("careers.manage", async (user) => {
    const d = parse(form);
    const r = await execute(`INSERT INTO job_openings (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`, values(d));
    id = r.insertId;
    await logActivity(user.id, "create", "job", id, `Created job ${d.title} (${d.status})`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect(`/admin/careers/${id}`);
  return result;
}

export async function updateJob(id: number, _: ActionState, form: FormData) {
  return adminAction("careers.manage", async (user) => {
    const d = parse(form);
    await execute(`UPDATE job_openings SET ${COLUMNS.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, [...values(d), id]);
    await logActivity(user.id, "update", "job", id, `Updated job ${d.title} (${d.status})`);
    refreshPublicSite();
    revalidatePath(`/admin/careers/${id}`);
    return { status: "success", message: d.status === "open" ? "Saved. The role is live on the careers page." : "Saved.", at: Date.now() };
  });
}

export async function setJobStatus(id: number, status: "open" | "closed", _: ActionState, _form: FormData) {
  return adminAction("careers.manage", async (user) => {
    if (status !== "open" && status !== "closed") throw new UserFacingError("Invalid status.");
    await execute("UPDATE job_openings SET status = ? WHERE id = ?", [status, id]);
    await logActivity(user.id, "update", "job", id, `Job #${id} ${status === "open" ? "published" : "closed"}`);
    refreshPublicSite();
    revalidatePath(`/admin/careers/${id}`);
    revalidatePath("/admin/careers");
    return { status: "success", message: status === "open" ? "Role published." : "Role closed. It no longer accepts applications.", at: Date.now() };
  });
}

export async function deleteJob(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("careers.manage", async (user) => {
    const apps = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM job_applications WHERE job_id = ?", [id]);
    if (Number(apps?.n) > 0) throw new UserFacingError("This role has applications. Close it instead so the applications stay linked.");
    await execute("DELETE FROM job_openings WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "job", id, `Deleted job #${id}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect("/admin/careers");
  return result;
}

export async function updateApplication(id: number, _: ActionState, form: FormData) {
  return adminAction("careers.manage", async (user) => {
    const status = str(form, "status");
    if (!(status in APPLICATION_STATUSES)) throw new UserFacingError("Choose a valid status.");
    const notes = str(form, "internal_notes").slice(0, 8000) || null;
    await execute("UPDATE job_applications SET status = ?, internal_notes = ? WHERE id = ?", [status, notes, id]);
    await logActivity(user.id, "update", "application", id, `Application #${id} → ${APPLICATION_STATUSES[status as keyof typeof APPLICATION_STATUSES]}`);
    revalidatePath(`/admin/careers/applications/${id}`);
    return { status: "success", message: "Application updated.", at: Date.now() };
  });
}
