import type { MetadataRoute } from "next";
import { env } from "@/server/env";
import { listPortfolio, listServices } from "@/server/repos/content";
import { listAllPublicSlugs } from "@/server/repos/blog";
import { listOpenJobs } from "@/server/repos/careers";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const now = new Date();
  const staticPages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"],
    ["/services", 0.9, "monthly"],
    ["/work", 0.9, "weekly"],
    ["/work/live", 0.7, "weekly"],
    ["/pricing", 0.8, "monthly"],
    ["/about", 0.7, "monthly"],
    ["/team", 0.5, "monthly"],
    ["/blog", 0.8, "weekly"],
    ["/careers", 0.6, "weekly"],
    ["/contact", 0.8, "yearly"],
    ["/faq", 0.6, "monthly"],
    ["/privacy-policy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
  ];
  const entries: MetadataRoute.Sitemap = staticPages.map(([path, priority, changeFrequency]) => ({ url: `${base}${path}`, lastModified: now, priority, changeFrequency }));

  try {
    const [services, projects, posts, jobs] = await Promise.all([listServices(), listPortfolio(), listAllPublicSlugs(), listOpenJobs()]);
    entries.push(
      ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updated_at, priority: 0.8 })),
      ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, lastModified: p.updated_at, priority: 0.7 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
      ...jobs.map((j) => ({ url: `${base}/careers/${j.slug}`, lastModified: j.updated_at, priority: 0.5 }))
    );
  } catch (error) {
    console.error("[sitemap] database unavailable, serving static entries only", error);
  }
  return entries;
}
