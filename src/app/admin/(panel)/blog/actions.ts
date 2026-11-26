"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { PoolConnection } from "mysql2/promise";
import type { ActionState } from "@/lib/action-state";
import { fromISTInput, slugify } from "@/lib/format";
import { adminAction, bool, str, UserFacingError, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, query, transaction } from "@/server/db";
import { logActivity } from "@/server/audit";
import { refreshPublicSite } from "@/server/revalidate";
import { readingMinutes, sanitizeRichText, stripHtml } from "@/server/security/sanitize";

const schema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(220),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(200),
  excerpt: z.string().trim().max(500),
  cover_image: z.string().trim().max(500).refine((v) => v === "" || /^(\/|https:\/\/)/.test(v), "Use an uploaded image or an https:// URL."),
  category_id: z.union([z.literal(""), z.coerce.number().int().positive()]),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().trim().max(160),
  seo_description: z.string().trim().max(320),
});

function parse(form: FormData) {
  const r = schema.safeParse({
    title: str(form, "title"),
    slug: str(form, "slug") || slugify(str(form, "title")),
    excerpt: str(form, "excerpt"),
    cover_image: str(form, "cover_image"),
    category_id: str(form, "category_id"),
    status: str(form, "status") || "draft",
    seo_title: str(form, "seo_title"),
    seo_description: str(form, "seo_description"),
  });
  if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
  const content = sanitizeRichText(str(form, "content"));
  if (r.data.status === "published" && stripHtml(content).length < 50) throw new ValidationError({ content: "Write the article before publishing (at least a paragraph)." }, "Write the article before publishing.");
  const publishInput = str(form, "published_at");
  let publishedAt = publishInput ? fromISTInput(publishInput) : null;
  if (publishInput && !publishedAt) throw new ValidationError({ published_at: "Use a valid date and time." });
  if (r.data.status === "published" && !publishedAt) publishedAt = new Date();
  const tags = str(form, "tags").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 15);
  return { ...r.data, content, publishedAt, tags, is_featured: bool(form, "is_featured"), excerpt: r.data.excerpt || stripHtml(content).slice(0, 220) };
}

async function syncTags(connection: PoolConnection, postId: number, tags: string[]) {
  await execute("DELETE FROM blog_post_tags WHERE post_id = ?", [postId], connection);
  for (const name of tags) {
    const slug = slugify(name);
    if (!slug) continue;
    await execute("INSERT IGNORE INTO blog_tags (name, slug) VALUES (?, ?)", [name.slice(0, 80), slug], connection);
    await execute("INSERT IGNORE INTO blog_post_tags (post_id, tag_id) SELECT ?, id FROM blog_tags WHERE slug = ?", [postId, slug], connection);
  }
}

const values = (d: ReturnType<typeof parse>) => [
  d.slug, d.title, d.excerpt || null, d.content, d.cover_image || null, d.category_id || null, d.status, d.publishedAt, readingMinutes(d.content), d.is_featured ? 1 : 0, d.seo_title || null, d.seo_description || null,
];

export async function createPost(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("blog.manage", async (user) => {
    const d = parse(form);
    id = await transaction(async (connection) => {
      const r = await execute(
        `INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, category_id, status, published_at, reading_minutes, is_featured, seo_title, seo_description, author_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...values(d), user.id],
        connection
      );
      await syncTags(connection, r.insertId, d.tags);
      return r.insertId;
    });
    await logActivity(user.id, "create", "blog", id, `${d.status === "published" ? "Published" : "Drafted"} post “${d.title}”`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect(`/admin/blog/${id}?saved=1`);
  return result;
}

export async function updatePost(id: number, _: ActionState, form: FormData) {
  return adminAction("blog.manage", async (user) => {
    const d = parse(form);
    await transaction(async (connection) => {
      await execute(
        `UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, content = ?, cover_image = ?, category_id = ?, status = ?, published_at = ?, reading_minutes = ?, is_featured = ?, seo_title = ?, seo_description = ? WHERE id = ?`,
        [...values(d), id],
        connection
      );
      await syncTags(connection, id, d.tags);
    });
    await logActivity(user.id, "update", "blog", id, `Updated post “${d.title}”`);
    refreshPublicSite();
    revalidatePath(`/admin/blog/${id}`);
    const scheduled = d.status === "published" && d.publishedAt && d.publishedAt.getTime() > Date.now();
    return { status: "success", message: scheduled ? "Saved. The post will go live at the scheduled time." : d.status === "published" ? "Saved and published." : "Draft saved.", at: Date.now() };
  });
}

export async function deletePost(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("blog.manage", async (user) => {
    await execute("DELETE FROM blog_posts WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "blog", id, `Deleted post #${id}`);
    refreshPublicSite();
  });
  if (result.status === "success") redirect("/admin/blog");
  return result;
}

// --- Categories & tags --------------------------------------------------------

export async function saveCategory(id: number | null, _: ActionState, form: FormData) {
  return adminAction("blog.manage", async (user) => {
    const name = str(form, "name");
    if (name.length < 2 || name.length > 120) throw new ValidationError({ name: "Enter a name (2–120 characters)." });
    const slug = slugify(str(form, "slug") || name);
    const description = str(form, "description").slice(0, 400) || null;
    if (id) await execute("UPDATE blog_categories SET name = ?, slug = ?, description = ? WHERE id = ?", [name, slug, description, id]);
    else await execute("INSERT INTO blog_categories (name, slug, description) VALUES (?, ?, ?)", [name, slug, description]);
    await logActivity(user.id, id ? "update" : "create", "blog_category", id, `${id ? "Updated" : "Added"} category ${name}`);
    revalidatePath("/admin/blog/categories");
    refreshPublicSite();
    return { status: "success", message: id ? "Category saved." : "Category added.", at: Date.now() };
  });
}

export async function deleteCategory(id: number, _: ActionState, _form: FormData) {
  return adminAction("blog.manage", async (user) => {
    await execute("DELETE FROM blog_categories WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "blog_category", id, `Deleted category #${id}`);
    revalidatePath("/admin/blog/categories");
    return { status: "success", message: "Category deleted. Its posts are now uncategorised.", at: Date.now() };
  });
}

export async function deleteUnusedTags(_: ActionState, _form: FormData) {
  return adminAction("blog.manage", async () => {
    const r = await execute("DELETE t FROM blog_tags t LEFT JOIN blog_post_tags pt ON pt.tag_id = t.id WHERE pt.tag_id IS NULL");
    revalidatePath("/admin/blog/categories");
    return { status: "success", message: `Removed ${r.affectedRows} unused tag(s).`, at: Date.now() };
  });
}

export async function renameTag(id: number, _: ActionState, form: FormData) {
  return adminAction("blog.manage", async () => {
    const name = str(form, "name");
    if (!name) throw new UserFacingError("Enter a tag name.");
    const existing = await query<{ id: number }>("SELECT id FROM blog_tags WHERE slug = ? AND id <> ?", [slugify(name), id]);
    if (existing.length) throw new UserFacingError("A tag with that name already exists.");
    await execute("UPDATE blog_tags SET name = ?, slug = ? WHERE id = ?", [name.slice(0, 80), slugify(name), id]);
    revalidatePath("/admin/blog/categories");
    return { status: "success", message: "Tag renamed.", at: Date.now() };
  });
}
