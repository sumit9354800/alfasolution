"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/format";
import { adminAction, bool, lines, str, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, toJson } from "@/server/db";
import { logActivity } from "@/server/audit";
import { refreshPublicSite } from "@/server/revalidate";
import { sanitizeRichText } from "@/server/security/sanitize";

const schema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(160),
  short_description: z.string().trim().min(10, "Write a one-line summary (10+ characters).").max(400),
  image: z.string().trim().max(500).refine((v) => v === "" || /^(\/|https:\/\/)/.test(v), "Use an uploaded image or an https:// URL."),
  starting_price: z.union([z.literal(""), z.coerce.number().min(0)]),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(320),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

function parse(form: FormData) {
  const r = schema.safeParse({
    title: str(form, "title"),
    slug: str(form, "slug") || slugify(str(form, "title")),
    short_description: str(form, "short_description"),
    image: str(form, "image"),
    starting_price: str(form, "starting_price"),
    seo_title: str(form, "seo_title"),
    seo_description: str(form, "seo_description"),
    sort_order: str(form, "sort_order") || 0,
  });
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  const steps = lines(form, "process_steps", 12).map((line) => {
    const [title, ...rest] = line.split(":");
    return { title: title.trim(), description: rest.join(":").trim() };
  });
  return {
    ...r.data,
    description: sanitizeRichText(str(form, "description")),
    features: lines(form, "features"),
    deliverables: lines(form, "deliverables"),
    technologies: lines(form, "technologies"),
    process_steps: steps,
    is_published: bool(form, "is_published"),
  };
}

const values = (d: ReturnType<typeof parse>) => [
  d.slug, d.title, d.short_description, d.description || null, d.image || null, toJson(d.features), toJson(d.deliverables), toJson(d.process_steps), toJson(d.technologies),
  d.starting_price === "" ? null : d.starting_price, d.seo_title || null, d.seo_description || null, d.sort_order, d.is_published ? 1 : 0,
];

export async function createService(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("content.manage", async (user) => {
    const d = parse(form);
    const r = await execute(
      `INSERT INTO services (slug, title, short_description, description, image, features, deliverables, process_steps, technologies, starting_price, seo_title, seo_description, sort_order, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values(d)
    );
    id = r.insertId;
    await logActivity(user.id, "create", "service", id, `Created service ${d.title}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect(`/admin/services/${id}`);
  return result;
}

export async function updateService(id: number, _: ActionState, form: FormData) {
  return adminAction("content.manage", async (user) => {
    const d = parse(form);
    await execute(
      `UPDATE services SET slug = ?, title = ?, short_description = ?, description = ?, image = ?, features = ?, deliverables = ?, process_steps = ?, technologies = ?,
         starting_price = ?, seo_title = ?, seo_description = ?, sort_order = ?, is_published = ? WHERE id = ?`,
      [...values(d), id]
    );
    await logActivity(user.id, "update", "service", id, `Updated service ${d.title}`);
    refreshPublicSite();
    revalidatePath(`/admin/services/${id}`);
    return { status: "success", message: "Service saved.", at: Date.now() };
  });
}

export async function deleteService(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("content.manage", async (user) => {
    await execute("DELETE FROM services WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "service", id, `Deleted service #${id}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect("/admin/services");
  return result;
}
