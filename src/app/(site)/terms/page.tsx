import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { getSetting } from "@/server/settings";
import { sanitizeRichText } from "@/server/security/sanitize";
import { PageIntro } from "@/components/site/blocks";
import { formatDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/terms", title: "Terms & conditions" });
}

export default async function LegalPage() {
  const legal = await getSetting("site.legal");
  return (
    <>
      <PageIntro crumbs={[{ label: "Terms & conditions" }]} title="Terms & conditions" lede={legal.updatedAt ? `Last updated ${formatDate(legal.updatedAt, "long")}` : undefined} />
      <section className="bg-white">
        <div className="container-site py-14 sm:py-16">
          <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: sanitizeRichText(legal.termsHtml) }} />
        </div>
      </section>
    </>
  );
}
