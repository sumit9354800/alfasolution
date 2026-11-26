import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { getSetting } from "@/server/settings";
import { sanitizeRichText } from "@/server/security/sanitize";
import { PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { formatDate } from "@/lib/format";

const DESCRIPTION =
  "How Alfa Solution collects, uses, stores and protects personal information shared through our website, enquiry forms, job applications and online payments.";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/privacy-policy", title: "Privacy Policy", description: DESCRIPTION });
}

export default async function PrivacyPolicyPage() {
  const legal = await getSetting("site.legal");
  return (
    <>
      <PageIntro
        crumbs={[{ label: "Privacy policy" }]}
        title="Privacy policy"
        lede={legal.updatedAt ? `Last updated ${formatDate(legal.updatedAt, "long")}` : undefined}
      />
      <section className="bg-white">
        <div className="container-site py-14 sm:py-16">
          <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: sanitizeRichText(legal.privacyHtml) }} />
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy Policy",
          url: `${env.siteUrl}/privacy-policy`,
          description: DESCRIPTION,
          inLanguage: "en-IN",
          ...(legal.updatedAt ? { dateModified: legal.updatedAt } : {}),
          publisher: { "@type": "Organization", name: "Alfa Solution", url: env.siteUrl },
        }}
      />
    </>
  );
}