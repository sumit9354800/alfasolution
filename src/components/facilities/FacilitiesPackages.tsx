"use client";

import { useState } from "react";
import Link from "next/link";

const packages = {
  website: [
    {
      name: "Basic",
      number: "01",
      description:
        "A professional starter website for businesses that need a clean and reliable online presence.",
      features: [
        "Up to 5 pages",
        "Responsive website",
        "Modern professional UI",
        "Mobile-friendly design",
        "Basic CMS",
        "Contact form",
        "WhatsApp integration",
        "Call button",
        "Basic SEO setup",
        "Google Maps integration",
        "Free hosting",
        "Free SSL",
        "Deployment",
        "7 days support",
      ],
    },
    {
      name: "Pro",
      number: "02",
      description:
        "A complete business website with custom design, CMS, stronger SEO and advanced functionality.",
      features: [
        "Up to 10 pages",
        "Custom UI/UX",
        "Fully responsive",
        "Advanced CMS",
        "Easy content updates",
        "Contact & enquiry forms",
        "WhatsApp integration",
        "Floating WhatsApp button",
        "Click-to-call",
        "Advanced SEO",
        "Google Analytics",
        "Google Search Console",
        "Performance optimisation",
        "Custom animations",
        "Free hosting",
        "Free SSL",
        "Deployment",
        "30 days support",
      ],
    },
    {
      name: "Advanced",
      number: "03",
      description:
        "A premium digital experience with advanced functionality and complete e-commerce capability.",
      features: [
        "Up to 20 pages",
        "Premium custom UI/UX",
        "Advanced CMS",
        "E-commerce functionality",
        "Up to 50 products",
        "Product & category management",
        "Shopping cart",
        "Checkout system",
        "Payment gateway",
        "WhatsApp integration",
        "Floating WhatsApp button",
        "Click-to-call",
        "Advanced SEO",
        "Google Analytics",
        "Google Search Console",
        "Advanced animations",
        "Performance optimisation",
        "Security configuration",
        "Free hosting",
        "Free SSL",
        "Deployment",
        "60 days support",
      ],
    },
  ],

  application: [
    {
      name: "Basic",
      number: "01",
      description:
        "A focused mobile application for businesses that need a simple and useful digital product.",
      features: [
        "Android app development",
        "Custom UI/UX",
        "Responsive mobile interface",
        "User authentication",
        "Basic backend",
        "Database integration",
        "Basic admin panel",
        "API integration",
        "Push notifications",
        "WhatsApp integration",
        "Basic analytics",
        "App testing",
        "Free hosting",
        "SSL configuration",
        "App deployment support",
        "30 days support",
      ],
    },
    {
      name: "Pro",
      number: "02",
      description:
        "A complete mobile application with advanced features, backend systems and a polished user experience.",
      features: [
        "Android app development",
        "iOS app development",
        "Custom UI/UX",
        "User authentication",
        "Role-based access",
        "Custom backend",
        "Database architecture",
        "Admin panel",
        "REST API development",
        "Third-party API integrations",
        "Push notifications",
        "WhatsApp integration",
        "Payment gateway integration",
        "Analytics dashboard",
        "Search & filtering",
        "Performance optimisation",
        "App testing",
        "Security configuration",
        "Free hosting",
        "Production deployment",
        "45 days support",
      ],
    },
    {
      name: "Advanced",
      number: "03",
      description:
        "A complete scalable mobile product for businesses that need advanced functionality, integrations and long-term growth.",
      features: [
        "Android & iOS development",
        "Premium custom UI/UX",
        "Scalable application architecture",
        "Advanced authentication",
        "Role & permission management",
        "Custom backend",
        "Advanced database architecture",
        "Enterprise-style admin panel",
        "REST API development",
        "Third-party integrations",
        "Payment systems",
        "Push notifications",
        "Email & WhatsApp automation",
        "Advanced analytics",
        "Reports & dashboards",
        "Advanced search & filtering",
        "File & media management",
        "Real-time functionality",
        "Performance optimisation",
        "Security hardening",
        "App testing & QA",
        "Production deployment",
        "60 days support",
        "Post-launch technical assistance",
      ],
    },
  ],
};

export default function FacilitiesPackages() {
  const [activeTab, setActiveTab] = useState<"website" | "application">(
    "website",
  );

  const activePackages = packages[activeTab];

  return (
    <section
      id="packages"
      className="scroll-mt-20 bg-[#F4F1EA] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8D6749]">
            Our Facilities
          </span>

          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#191D27] sm:text-4xl lg:text-[46px]">
            Choose the right solution
            <span className="text-[#B58A62]"> for your business.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#686A70] sm:text-base">
            Explore our website and application development packages. Find the
            features that match your project requirements.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label="Development package categories"
            className="inline-flex rounded-full border border-[#191D27]/10 bg-white p-1.5 shadow-sm"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "website"}
              onClick={() => setActiveTab("website")}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 sm:px-9 ${
                activeTab === "website"
                  ? "bg-[#191D27] text-white shadow-md"
                  : "text-[#686A70] hover:text-[#191D27]"
              }`}
            >
              Website
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "application"}
              onClick={() => setActiveTab("application")}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 sm:px-9 ${
                activeTab === "application"
                  ? "bg-[#191D27] text-white shadow-md"
                  : "text-[#686A70] hover:text-[#191D27]"
              }`}
            >
              Application
            </button>
          </div>
        </div>

        {/* Active Category Label */}
        <div className="mt-12 flex items-center justify-between border-b border-[#191D27]/15 pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8D6749]">
              {activeTab === "website"
                ? "Website Development"
                : "Application Development"}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#191D27] sm:text-2xl">
              Explore our packages
            </h3>
          </div>

          <span className="hidden text-sm text-[#77777A] sm:block">
            03 Packages
          </span>
        </div>

        {/* Package Cards */}
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {activePackages.map((item, index) => (
            <article
              key={`${activeTab}-${item.name}`}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${
                index === 1
                  ? "border-[#B58A62] bg-[#191D27] text-white shadow-lg"
                  : "border-[#191D27]/10 bg-white text-[#191D27]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold tracking-[0.18em] ${
                    index === 1 ? "text-[#D2AD8D]" : "text-[#8D6749]"
                  }`}
                >
                  PACKAGE {item.number}
                </span>

                <span
                  className={`text-xs ${
                    index === 1 ? "text-white/40" : "text-[#191D27]/30"
                  }`}
                >
                  {activeTab === "website" ? "WEB" : "APP"}
                </span>
              </div>

              <h4 className="mt-7 text-3xl font-semibold tracking-tight">
                {item.name}
              </h4>

              <p
                className={`mt-3 min-h-[72px] text-sm leading-6 ${
                  index === 1 ? "text-white/60" : "text-[#77777A]"
                }`}
              >
                {item.description}
              </p>

              <div
                className={`my-7 h-px ${
                  index === 1 ? "bg-white/15" : "bg-[#191D27]/10"
                }`}
              />

              <p
                className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                  index === 1 ? "text-[#D2AD8D]" : "text-[#8D6749]"
                }`}
              >
                Package includes
              </p>

              <ul className="mt-5 flex-1 space-y-4">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        index === 1
                          ? "bg-[#B58A62]/20 text-[#D2AD8D]"
                          : "bg-[#B58A62]/10 text-[#8D6749]"
                      }`}
                    >
                      ✓
                    </span>

                    <span
                      className={`text-sm leading-6 ${
                        index === 1 ? "text-white/75" : "text-[#555861]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-9 flex w-full items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                  index === 1
                    ? "bg-[#B58A62] text-white hover:bg-white hover:text-[#191D27]"
                    : "bg-[#191D27] text-white hover:bg-[#B58A62]"
                }`}
              >
                Discuss This Package
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-8 text-center text-xs leading-6 text-[#77777A]">
          Every project can be discussed according to your specific
          requirements. Contact us to define the right scope.
        </p>
      </div>
    </section>
  );
}
