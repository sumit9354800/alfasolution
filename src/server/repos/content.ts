import "server-only";
import { cache } from "react";
import { parseJson, query, queryOne } from "../db";

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type Service = {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  image: string | null;
  features: string[];
  deliverables: string[];
  process_steps: { title: string; description: string }[];
  technologies: string[];
  starting_price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_published: number;
  updated_at: Date;
};

function mapService(row: Record<string, unknown>): Service {
  return {
    ...(row as unknown as Service),
    features: parseJson(row.features, []),
    deliverables: parseJson(row.deliverables, []),
    process_steps: parseJson(row.process_steps, []),
    technologies: parseJson(row.technologies, []),
  };
}

export const listServices = cache(async (opts: { includeDrafts?: boolean } = {}) => {
  const rows = await query(
    `SELECT * FROM services ${opts.includeDrafts ? "" : "WHERE is_published = 1"} ORDER BY sort_order, id`
  );
  return rows.map(mapService);
});

export async function getServiceBySlug(slug: string) {
  const row = await queryOne("SELECT * FROM services WHERE slug = ? AND is_published = 1", [slug]);
  return row ? mapService(row) : null;
}

export async function getServiceById(id: number) {
  const row = await queryOne("SELECT * FROM services WHERE id = ?", [id]);
  return row ? mapService(row) : null;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  client_name: string | null;
  category: string;
  project_type: "client" | "independent";
  service_id: number | null;
  service_title?: string | null;
  service_slug?: string | null;
  year: number | null;
  role: string | null;
  summary: string;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  technologies: string[];
  features: string[];
  cover_image: string | null;
  live_url: string | null;
  repo_url: string | null;
  embed_mode: "auto" | "iframe" | "screenshot";
  embed_status: "unknown" | "allowed" | "blocked";
  embed_checked_at: Date | null;
  is_featured: number;
  is_published: number;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: Date;
};

function mapProject(row: Record<string, unknown>): PortfolioProject {
  return {
    ...(row as unknown as PortfolioProject),
    technologies: parseJson(row.technologies, []),
    features: parseJson(row.features, []),
  };
}

const PROJECT_SELECT = `SELECT p.*, s.title AS service_title, s.slug AS service_slug
  FROM portfolio_projects p LEFT JOIN services s ON s.id = p.service_id`;

export const listPortfolio = cache(async (opts: { includeDrafts?: boolean; featuredOnly?: boolean } = {}) => {
  const where: string[] = [];
  if (!opts.includeDrafts) where.push("p.is_published = 1");
  if (opts.featuredOnly) where.push("p.is_featured = 1");
  const rows = await query(`${PROJECT_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY p.sort_order, p.id`);
  return rows.map(mapProject);
});

export async function getProjectBySlug(slug: string) {
  const row = await queryOne(`${PROJECT_SELECT} WHERE p.slug = ? AND p.is_published = 1`, [slug]);
  return row ? mapProject(row) : null;
}

export async function getProjectById(id: number) {
  const row = await queryOne(`${PROJECT_SELECT} WHERE p.id = ?`, [id]);
  return row ? mapProject(row) : null;
}

/** Whether a project should be shown as a live iframe (vs. screenshot fallback). */
export function canEmbed(project: Pick<PortfolioProject, "live_url" | "embed_mode" | "embed_status">) {
  if (!project.live_url) return false;
  if (project.embed_mode === "iframe") return true;
  if (project.embed_mode === "screenshot") return false;
  return project.embed_status !== "blocked";
}

// ---------------------------------------------------------------------------
// Team, testimonials, FAQs, packages
// ---------------------------------------------------------------------------

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  linkedin_url: string | null;
  sort_order: number;
  is_published: number;
};

export const listTeam = cache(async (opts: { includeDrafts?: boolean } = {}) =>
  query<TeamMember>(`SELECT * FROM team_members ${opts.includeDrafts ? "" : "WHERE is_published = 1"} ORDER BY sort_order, id`)
);

export type Testimonial = {
  id: number;
  author_name: string;
  author_role: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  avatar: string | null;
  sort_order: number;
  is_published: number;
};

export const listTestimonials = cache(async (opts: { includeDrafts?: boolean } = {}) =>
  query<Testimonial>(`SELECT * FROM testimonials ${opts.includeDrafts ? "" : "WHERE is_published = 1"} ORDER BY sort_order, id`)
);

export type Faq = { id: number; question: string; answer: string; category: string; sort_order: number; is_published: number };

export const listFaqs = cache(async (opts: { includeDrafts?: boolean; category?: string } = {}) => {
  const where: string[] = [];
  const params: string[] = [];
  if (!opts.includeDrafts) where.push("is_published = 1");
  if (opts.category) {
    where.push("category = ?");
    params.push(opts.category);
  }
  return query<Faq>(`SELECT * FROM faqs ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY sort_order, id`, params);
});

export type PricingPackage = {
  id: number;
  slug: string;
  category: "website" | "application" | "other";
  name: string;
  tagline: string | null;
  price: number | null;
  price_note: string | null;
  features: string[];
  is_featured: number;
  is_purchasable: number;
  advance_percent: number;
  sort_order: number;
  is_published: number;
};

function mapPackage(row: Record<string, unknown>): PricingPackage {
  return { ...(row as unknown as PricingPackage), features: parseJson(row.features, []) };
}

export const listPackages = cache(async (opts: { includeDrafts?: boolean } = {}) => {
  const rows = await query(`SELECT * FROM pricing_packages ${opts.includeDrafts ? "" : "WHERE is_published = 1"} ORDER BY sort_order, id`);
  return rows.map(mapPackage);
});

export async function getPackageBySlug(slug: string) {
  const row = await queryOne("SELECT * FROM pricing_packages WHERE slug = ? AND is_published = 1", [slug]);
  return row ? mapPackage(row) : null;
}

export async function getPackageById(id: number) {
  const row = await queryOne("SELECT * FROM pricing_packages WHERE id = ?", [id]);
  return row ? mapPackage(row) : null;
}

/** A package can be bought online only when it is published, purchasable and priced. */
export function isBuyable(pkg: PricingPackage) {
  return Boolean(pkg.is_published && pkg.is_purchasable && pkg.price && pkg.price > 0);
}
