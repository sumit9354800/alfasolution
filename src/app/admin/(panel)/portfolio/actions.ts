"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/format";
import { adminAction, bool, lines, str, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, queryOne, toJson } from "@/server/db";
import { logActivity } from "@/server/audit";
import { refreshEmbedStatus } from "@/server/embed-check";
import { refreshPublicSite } from "@/server/revalidate";

const url = z.string().trim().max(500).refine((v) => v === "" || /^https?:\/\/[^\s]+$/.test(v), "Enter a full URL starting with https://");
const schema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(160),
  client_name: z.string().trim().max(160),
  category: z.string().trim().min(2, "Enter a category, e.g. Business website.").max(160),
  project_type: z.enum(["client", "independent"]),
  service_id: z.union([z.literal(""), z.coerce.number().int().positive()]),
  year: z.union([z.literal(""), z.coerce.number().int().min(2000).max(2100)]),
  role: z.string().trim().max(160),
  summary: z.string().trim().min(20, "Write a summary of at least 20 characters.").max(600),
  challenge: z.string().trim().max(3000),
  solution: z.string().trim().max(3000),
  results: z.string().trim().max(3000),
  cover_image: z.string().trim().max(500).refine((v) => v === "" || /^(\/|https:\/\/)/.test(v), "Use an uploaded image or an https:// URL."),
  live_url: url,
  repo_url: url,
  embed_mode: z.enum(["auto", "iframe", "screenshot"]),
  sort_order: z.coerce.number().int().min(0).max(9999),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(320),
});

function parse(form: FormData) {
  const raw = Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(form, k)]));
  if (!raw.slug) raw.slug = slugify(String(raw.title));
  if (!raw.sort_order) raw.sort_order = "0";
  const r = schema.safeParse(raw);
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  return { ...r.data, technologies: lines(form, "technologies"), features: lines(form, "features"), is_featured: bool(form, "is_featured"), is_published: bool(form, "is_published") };
}

const n = (v: string | number) => (v === "" ? null : v);
const values = (d: ReturnType<typeof parse>) => [
  d.slug, d.title, n(d.client_name), d.category, d.project_type, n(d.service_id), n(d.year), n(d.role), d.summary, n(d.challenge), n(d.solution), n(d.results),
  toJson(d.technologies), toJson(d.features), n(d.cover_image), n(d.live_url), n(d.repo_url), d.embed_mode, d.is_featured ? 1 : 0, d.is_published ? 1 : 0, d.sort_order,
  n(d.seo_title), n(d.seo_description),
];
const COLUMNS = "slug, title, client_name, category, project_type, service_id, year, role, summary, challenge, solution, results, technologies, features, cover_image, live_url, repo_url, embed_mode, is_featured, is_published, sort_order, seo_title, seo_description";

export async function createProject(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("portfolio.manage", async (user) => {
    const d = parse(form);
    const r = await execute(`INSERT INTO portfolio_projects (${COLUMNS}) VALUES (${COLUMNS.split(",").map(() => "?").join(", ")})`, values(d));
    id = r.insertId;
    if (d.live_url) await refreshEmbedStatus(id, d.live_url);
    await logActivity(user.id, "create", "portfolio", id, `Added portfolio project ${d.title}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect(`/admin/portfolio/${id}`);
  return result;
}

export async function updateProject(id: number, _: ActionState, form: FormData) {
  return adminAction("portfolio.manage", async (user) => {
    const d = parse(form);
    await execute(`UPDATE portfolio_projects SET ${COLUMNS.split(", ").map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, [...values(d), id]);
    const embed = d.live_url ? await refreshEmbedStatus(id, d.live_url) : null;
    await logActivity(user.id, "update", "portfolio", id, `Updated portfolio project ${d.title}`);
    refreshPublicSite();
    revalidatePath(`/admin/portfolio/${id}`);
    const note = embed === "blocked" ? " This website blocks embedding, so visitors will see the screenshot with a link instead." : "";
    return { status: "success", message: `Project saved.${note}`, at: Date.now() };
  });
}

export async function recheckEmbed(id: number, _: ActionState, _form: FormData) {
  return adminAction("portfolio.manage", async () => {
    // The URL is read from the database, never taken from the browser.
    const row = await queryOne<{ live_url: string | null }>("SELECT live_url FROM portfolio_projects WHERE id = ?", [id]);
    const status = await refreshEmbedStatus(id, row?.live_url ?? null);
    revalidatePath(`/admin/portfolio/${id}`);
    const msg = { allowed: "This website can be shown as a live preview.", blocked: "This website blocks embedding — the screenshot fallback will be used.", unknown: "Couldn’t reach the website to check. The live preview will be attempted, with a fallback link." }[status];
    return { status: "success", message: msg, at: Date.now() };
  });
}

export async function deleteProject(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("portfolio.manage", async (user) => {
    await execute("DELETE FROM portfolio_projects WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "portfolio", id, `Deleted portfolio project #${id}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect("/admin/portfolio");
  return result;
}
