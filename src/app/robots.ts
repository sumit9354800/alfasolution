import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.alfasolution.net").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/checkout/", "/pay/", "/payment/", "/invoice/"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
