import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { JsonLd } from "@/components/site/JsonLd";
import { getSetting } from "@/server/settings";
import { env } from "@/server/env";

// Every public page reads live content from MySQL, so admin edits show up immediately.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const general = await getSetting("site.general");
  // Same rule as the footer: GitHub is not shown.
  const socials = general.socials
    .map((s) => s.href)
    .filter((href) => href && !href.toLowerCase().includes("github"));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      {general.whatsapp ? <WhatsAppButton number={general.whatsapp} /> : null}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: general.companyName,
          url: env.siteUrl,
          logo: `${env.siteUrl}/images/logo-black.png`,
          email: general.email || undefined,
          telephone: general.phone || undefined,
          address: { "@type": "PostalAddress", addressCountry: "IN", streetAddress: general.address || undefined },
          areaServed: { "@type": "Country", name: "India" },
          sameAs: socials.length ? socials : undefined,
        }}
      />
    </>
  );
}
