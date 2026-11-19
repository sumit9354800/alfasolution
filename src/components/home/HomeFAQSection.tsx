"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    number: "01",
    question: "What services does Alfa Solution offer?",
    answer:
      "We offer a range of digital services, including website design and development, UI/UX design, e-commerce solutions, mobile app development, digital strategy, and custom digital solutions.",
  },
  {
    number: "02",
    question: "How does your project development process work?",
    answer:
      "We begin by understanding your goals and requirements. Then we move through strategy, planning, design, development, testing, and final delivery. We keep you involved throughout the process.",
  },
  {
    number: "03",
    question: "How long does it take to complete a project?",
    answer:
      "Project timelines depend on the scope, features, and complexity. A standard website may take a few weeks, while larger custom platforms can require more time. We provide a timeline after understanding your requirements.",
  },
  {
    number: "04",
    question: "Can you redesign or improve my existing website?",
    answer:
      "Yes. We can redesign an existing website, improve its user experience, modernize its interface, optimize performance, and add new functionality based on your business needs.",
  },
  {
    number: "05",
    question: "Will my website work on mobile devices?",
    answer:
      "Absolutely. We build responsive digital experiences that adapt to mobile phones, tablets, laptops, and desktop screens.",
  },
  {
    number: "06",
    question: "Do you provide support after project delivery?",
    answer:
      "Yes. We can help with ongoing maintenance, updates, technical support, and improvements after launch. The support arrangement depends on your project requirements.",
  },
  {
    number: "07",
    question: "How much does a website or digital project cost?",
    answer:
      "Pricing depends on the project scope, design requirements, functionality, and timeline. Contact us with your requirements and we will prepare a suitable proposal.",
  },
  {
    number: "08",
    question: "How can I get started with Alfa Solution?",
    answer:
      "Simply reach out through our contact page. Tell us about your business, goals, and project requirements, and our team will help you take the next step.",
  },
];

export default function HomeFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#F4F1EA] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <span className="mb-5 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8D6749]">
              <span className="h-px w-8 bg-[#B58A62]" />
              FAQs
            </span>

            <h2 className="max-w-[440px] font-[family-name:var(--font-manrope)] text-3xl font-semibold leading-[1.2] tracking-[-0.045em] text-[#191D27] sm:text-4xl lg:text-[48px]">
              Everything you need to know.
            </h2>

            <p className="mt-5 max-w-[380px] text-sm leading-7 text-[#191D27]/65 sm:text-base">
              Have questions about working with us? Find answers to some of the
              most common questions about our services and process.
            </p>

            <div className="mt-9">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-4 border-b border-[#B58A62] pb-2 text-sm font-semibold text-[#191D27] transition-colors hover:text-[#8D6749]"
              >
                Still have questions?
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="border-t border-[#191D27]/15">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq.number} className="border-b border-[#191D27]/15">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 py-6 text-left sm:py-7"
                  >
                    <span className="hidden w-8 shrink-0 text-xs font-medium tracking-wider text-[#B58A62] sm:block">
                      {faq.number}
                    </span>

                    <span className="flex-1 pr-2 font-[family-name:var(--font-manrope)] text-base font-semibold leading-snug text-[#191D27] sm:text-lg">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#191D27]/20 text-lg transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 border-[#B58A62] bg-[#B58A62] text-white"
                          : "text-[#191D27]"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[620px] pb-7 pl-0 text-sm leading-7 text-[#191D27]/65 sm:pb-8 sm:pl-12 sm:text-[15px]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-16 flex flex-col justify-between gap-5 border-t border-[#191D27]/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs tracking-wide text-[#191D27]/50">
            Can&apos;t find what you&apos;re looking for?
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 text-sm font-semibold text-[#8D6749] transition-colors hover:text-[#191D27]"
          >
            Talk to our team
            <span>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
