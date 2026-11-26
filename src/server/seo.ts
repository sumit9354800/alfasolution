import "server-only";
import type { Metadata } from "next";
import { env } from "./env";
import { getSetting } from "./settings";

type PageMeta = {
  path: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
};

/**
 * Builds page metadata: title, description, canonical URL, Open Graph and
 * Twitter cards. Per-page overrides from Admin → SEO take priority, then the
 * values passed by the page, then the site defaults.
 */
export async function buildMetadata(page: PageMeta): Promise<Metadata> {
  const seo = await getSetting("site.seo");
  const override = seo.pages?.find((entry) => entry.page === page.path);
  const title = override?.title || page.title || seo.defaultTitle;
  const description = override?.description || page.description || seo.defaultDescription;
  const image = page.image || seo.ogImage || "/images/og-image.jpg";
  const url = `${env.siteUrl}${page.path === "/" ? "" : page.path}`;
  const isHome = page.path === "/";

  return {
    title: isHome ? { absolute: title } : `${title} | Alfa Solution`,
    description,
    keywords: seo.keywords,
    alternates: { canonical: url },
    robots: page.noindex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: page.type ?? "website",
      url,
      siteName: "Alfa Solution",
      locale: "en_IN",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(page.publishedTime ? { publishedTime: page.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${env.siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
