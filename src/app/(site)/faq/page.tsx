import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { listFaqs } from "@/server/repos/content";
import { EmptyState, FaqList, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";

const slugOf = (group: string) => group.toLowerCase().replace(/\W+/g, "-");

export async function generateMetadata(): Promise<Metadata> {
  // An entry for /faq in Admin → SEO → Page titles & descriptions takes priority over these.
  return buildMetadata({
    path: "/faq",
    title: "Website & App Development FAQs — India",
    description: "Answers on website and app development costs, timelines, payments, GST invoices and support for businesses across India.",
  });
}

export default async function FaqPage() {
  const faqs = await listFaqs();
  const groups = [...new Set(faqs.map((faq) => faq.category))];

  return (
    <>
      <PageIntro
        crumbs={[{ label: "FAQ" }]}
        title="Website & app development FAQs"
        lede="How projects, pricing, payments, GST invoices and support work at Alfa Solution — for businesses anywhere in India."
      />
      <section className="bg-white">
        <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.3fr_1fr]">
          <nav aria-label="FAQ topics" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2 text-[0.95rem]">
              {groups.map((group) => (
                <li key={group}>
                  <a href={`#${slugOf(group)}`} className="text-slate hover:text-ink">{group}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14">
            {faqs.length ? (
              groups.map((group) => (
                <div key={group} id={slugOf(group)} className="scroll-mt-28">
                  <h2 className="mb-4 text-2xl">{group}</h2>
                  <FaqList items={faqs.filter((faq) => faq.category === group)} withSchema={false} />
                </div>
              ))
            ) : (
              <EmptyState title="No questions published yet" />
            )}

            <div className="rounded-[var(--radius-card)] bg-paper p-6 sm:p-8">
              <h2 className="text-xl">Still have a question?</h2>
              <p className="mt-2 text-slate">
                <Link href="/contact" className="link">Send it to us</Link> and we’ll answer within a working day. Or explore:
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                <li><Link href="/services" className="chip hover:text-ink">Our services</Link></li>
                <li><Link href="/pricing" className="chip hover:text-ink">Packages & prices</Link></li>
                <li><Link href="/work" className="chip hover:text-ink">Portfolio</Link></li>
                <li><Link href="/blog" className="chip hover:text-ink">Guides & insights</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {faqs.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            name: "Website & app development FAQs",
            url: `${env.siteUrl}/faq`,
            inLanguage: "en-IN",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      ) : null}
    </>
  );
}