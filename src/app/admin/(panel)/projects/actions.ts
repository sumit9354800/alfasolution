"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { adminAction, lines, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, queryOne, toJson } from "@/server/db";
import { logActivity } from "@/server/audit";
import { PROJECT_STATUSES } from "@/server/repos/crm";

const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")]);
const schema = z.object({
  client_id: z.coerce.number().int().positive("Choose a client."),
  title: z.string().trim().min(2, "Enter a project title.").max(200),
  description: z.string().trim().max(5000),
  status: z.enum(Object.keys(PROJECT_STATUSES) as [string, ...string[]]),
  start_date: date,
  due_date: date,
  budget: z.union([z.literal(""), z.coerce.number().min(0, "Budget can’t be negative.").max(99999999)]),
});

function parse(form: FormData) {
  const r = schema.safeParse({
    client_id: form.get("client_id"),
    title: form.get("title"),
    description: form.get("description") ?? "",
    status: form.get("status"),
    start_date: form.get("start_date") ?? "",
    due_date: form.get("due_date") ?? "",
    budget: form.get("budget") ?? "",
  });
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  // Deliverables: one per line; lines starting with "[x]" are complete.
  const deliverables = lines(form, "deliverables", 80).map((line) => ({ title: line.replace(/^\[(x| )\]\s*/i, ""), done: /^\[x\]/i.test(line) }));
  const d = r.data;
  return { ...d, deliverables, budget: d.budget === "" ? null : d.budget, start_date: d.start_date || null, due_date: d.due_date || null };
}

async function assertClient(id: number) {
  if (!(await queryOne("SELECT id FROM clients WHERE id = ?", [id]))) throw new ValidationError({ client_id: "Choose a client." });
}

export async function createProject(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("clients.manage", async (user) => {
    const d = parse(form);
    await assertClient(d.client_id);
    const r = await execute(
      "INSERT INTO client_projects (client_id, title, description, deliverables, status, start_date, due_date, budget) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [d.client_id, d.title, d.description || null, toJson(d.deliverables), d.status, d.start_date, d.due_date, d.budget]
    );
    id = r.insertId;
    await logActivity(user.id, "create", "project", id, `Created project ${d.title}`);
  });
  if (result.status === "success") redirect(`/admin/projects/${id}`);
  return result;
}

export async function updateProject(id: number, _: ActionState, form: FormData) {
  return adminAction("clients.manage", async (user) => {
    const d = parse(form);
    await assertClient(d.client_id);
    await execute(
      "UPDATE client_projects SET client_id = ?, title = ?, description = ?, deliverables = ?, status = ?, start_date = ?, due_date = ?, budget = ? WHERE id = ?",
      [d.client_id, d.title, d.description || null, toJson(d.deliverables), d.status, d.start_date, d.due_date, d.budget, id]
    );
    await logActivity(user.id, "update", "project", id, `Updated project ${d.title} (${PROJECT_STATUSES[d.status as keyof typeof PROJECT_STATUSES]})`);
    revalidatePath(`/admin/projects/${id}`);
    return { status: "success", message: "Project saved.", at: Date.now() };
  });
}

export async function deleteProject(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("clients.manage", async (user) => {
    await execute("DELETE FROM client_projects WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "project", id, `Deleted project #${id}`);
  });
  if (result.status === "success") redirect("/admin/projects");
  return result;
}
