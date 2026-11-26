import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { listFaqs } from "@/server/repos/content";
import { EmptyState, FaqList, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/faq", title: "Frequently asked questions" });
}

export default async function FaqPage() {
  const faqs = await listFaqs();
  const groups = [...new Set(faqs.map((faq) => faq.category))];

  return (
    <>
      <PageIntro crumbs={[{ label: "FAQ" }]} title="Frequently asked questions" lede="How projects, pricing, payments and support work at Alfa Solution." />
      <section className="bg-white">
        <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.3fr_1fr]">
          <nav aria-label="FAQ topics" className="hidden lg:block">
            <ul className="sticky top-28 space-y-2 text-[0.95rem]">
              {groups.map((group) => (
                <li key={group}>
                  <a href={`#${group.toLowerCase().replace(/\W+/g, "-")}`} className="text-slate hover:text-ink">{group}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14">
            {faqs.length ? (
              groups.map((group) => (
                <div key={group} id={group.toLowerCase().replace(/\W+/g, "-")} className="scroll-mt-28">
                  <h2 className="mb-4 text-2xl">{group}</h2>
                  <FaqList items={faqs.filter((faq) => faq.category === group)} withSchema={false} />
                </div>
              ))
            ) : (
              <EmptyState title="No questions published yet" />
            )}
            <p className="text-slate">
              Still have a question? <Link href="/contact" className="link">Send it to us</Link> and we’ll answer within a working day.
            </p>
          </div>
        </div>
      </section>
      {faqs.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      ) : null}
    </>
  );
}
