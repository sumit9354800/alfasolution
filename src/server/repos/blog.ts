import "server-only";
import { cache } from "react";
import { query, queryOne } from "../db";

export type BlogCategory = { id: number; name: string; slug: string; description: string | null; post_count?: number };
export type BlogTag = { id: number; name: string; slug: string; post_count?: number };

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  author_id: number | null;
  author_name: string | null;
  status: "draft" | "published";
  published_at: Date | null;
  reading_minutes: number;
  is_featured: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: Date;
  updated_at: Date;
  tags?: BlogTag[];
};

/** A post is public when published and its publish time has arrived (scheduled posts wait). */
const PUBLIC = "p.status = 'published' AND p.published_at IS NOT NULL AND p.published_at <= UTC_TIMESTAMP()";

const SELECT = `SELECT p.*, c.name AS category_name, c.slug AS category_slug, u.name AS author_name
  FROM blog_posts p
  LEFT JOIN blog_categories c ON c.id = p.category_id
  LEFT JOIN admin_users u ON u.id = p.author_id`;

export type PostFilters = { q?: string; category?: string; tag?: string; page?: number; perPage?: number };

export async function listPublicPosts(filters: PostFilters = {}) {
  const where = [PUBLIC];
  const params: (string | number)[] = [];
  if (filters.q) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)");
    const like = `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`;
    params.push(like, like, like);
  }
  if (filters.category) {
    where.push("c.slug = ?");
    params.push(filters.category);
  }
  if (filters.tag) {
    where.push("EXISTS (SELECT 1 FROM blog_post_tags pt JOIN blog_tags t ON t.id = pt.tag_id WHERE pt.post_id = p.id AND t.slug = ?)");
    params.push(filters.tag);
  }
  const perPage = Math.min(Math.max(filters.perPage ?? 9, 1), 48);
  const page = Math.max(filters.page ?? 1, 1);
  const whereSql = `WHERE ${where.join(" AND ")}`;

  const [countRow] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM blog_posts p LEFT JOIN blog_categories c ON c.id = p.category_id ${whereSql}`,
    params
  );
  const posts = await query<BlogPost>(
    `${SELECT} ${whereSql} ORDER BY p.is_featured DESC, p.published_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, (page - 1) * perPage]
  );
  const total = Number(countRow?.total ?? 0);
  return { posts, total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export const listLatestPosts = cache(async (limit = 3) =>
  query<BlogPost>(`${SELECT} WHERE ${PUBLIC} ORDER BY p.published_at DESC LIMIT ?`, [limit])
);

export async function getPublicPost(slug: string) {
  const post = await queryOne<BlogPost>(`${SELECT} WHERE p.slug = ? AND ${PUBLIC}`, [slug]);
  if (!post) return null;
  post.tags = await tagsForPost(post.id);
  return post;
}

export async function tagsForPost(postId: number) {
  return query<BlogTag>(
    "SELECT t.id, t.name, t.slug FROM blog_tags t JOIN blog_post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ? ORDER BY t.name",
    [postId]
  );
}

/** Related posts: same category or shared tags, newest first. */
export async function relatedPosts(post: BlogPost, limit = 3) {
  return query<BlogPost>(
    `${SELECT}
     WHERE ${PUBLIC} AND p.id <> ?
       AND (p.category_id <=> ? OR EXISTS (
         SELECT 1 FROM blog_post_tags a JOIN blog_post_tags b ON a.tag_id = b.tag_id
         WHERE a.post_id = p.id AND b.post_id = ?))
     ORDER BY p.published_at DESC LIMIT ?`,
    [post.id, post.category_id, post.id, limit]
  );
}

export const listCategories = cache(async () =>
  query<BlogCategory>(
    `SELECT c.*, (SELECT COUNT(*) FROM blog_posts p WHERE p.category_id = c.id AND ${PUBLIC}) AS post_count
       FROM blog_categories c ORDER BY c.name`
  )
);

export const listTags = cache(async () =>
  query<BlogTag>(
    `SELECT t.*, (SELECT COUNT(*) FROM blog_post_tags pt JOIN blog_posts p ON p.id = pt.post_id WHERE pt.tag_id = t.id AND ${PUBLIC}) AS post_count
       FROM blog_tags t ORDER BY t.name`
  )
);

export async function listAllPublicSlugs() {
  return query<{ slug: string; updated_at: Date }>(`SELECT p.slug, p.updated_at FROM blog_posts p WHERE ${PUBLIC}`);
}

// --- Admin ------------------------------------------------------------------

export async function listPostsForAdmin(filters: { q?: string; status?: string; category?: number } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (filters.q) {
    where.push("p.title LIKE ?");
    params.push(`%${filters.q.replace(/[%_\\]/g, "\\$&")}%`);
  }
  if (filters.status === "draft" || filters.status === "published") {
    where.push("p.status = ?");
    params.push(filters.status);
  }
  if (filters.status === "scheduled") where.push("p.status = 'published' AND p.published_at > UTC_TIMESTAMP()");
  if (filters.category) {
    where.push("p.category_id = ?");
    params.push(filters.category);
  }
  return query<BlogPost>(
    `${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT 200`,
    params
  );
}

export async function getPostById(id: number) {
  const post = await queryOne<BlogPost>(`${SELECT} WHERE p.id = ?`, [id]);
  if (!post) return null;
  post.tags = await tagsForPost(post.id);
  return post;
}
