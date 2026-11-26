import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { sanitizeRichText } from "@/server/security/sanitize";
import { PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatDate } from "@/lib/format";

const DESCRIPTION =
  "Terms for using the Alfa Solution website and our website, app and software development services, including payments, project scope and ownership.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/terms", title: "Terms & Conditions", description: DESCRIPTION });
}

export default async function TermsPage() {
  const legal = await getSetting("site.legal");
  return (
    <>
      <PageIntro
        crumbs={[{ label: "Terms & conditions" }]}
        title="Terms & conditions"
        lede={legal.updatedAt ? `Last updated ${formatDate(legal.updatedAt, "long")}` : undefined}
      />
      <section className="bg-white">
        <div className="container-site py-14 sm:py-16">
          <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: sanitizeRichText(legal.termsHtml) }} />
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms & Conditions",
          url: `${env.siteUrl}/terms`,
          description: DESCRIPTION,
          inLanguage: "en-IN",
          ...(legal.updatedAt ? { dateModified: legal.updatedAt } : {}),
          publisher: { "@type": "Organization", name: "Alfa Solution", url: env.siteUrl },
        }}
      />
    </>
  );
}