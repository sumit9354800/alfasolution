
import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Strategy & Discovery",
    description:
      "Understanding your business, audience and objectives before deciding the right digital direction.",
    tags: ["Research", "Planning", "Consulting"],
  },
  {
    number: "02",
    title: "Creative & Experience Design",
    description:
      "Creating meaningful visual identities and intuitive experiences that connect with your audience.",
    tags: ["Creative Direction", "UI/UX", "Prototyping"],
  },
  {
    number: "03",
    title: "Technology & Development",
    description:
      "Turning ideas into reliable, responsive and scalable digital products using modern technologies.",
    tags: ["Web Development", "Integration", "Performance"],
  },
  {
    number: "04",
    title: "Optimization & Growth",
    description:
      "Improving digital experiences through thoughtful refinement, performance and ongoing support.",
    tags: ["Optimization", "Maintenance", "Support"],
  },
];

export default function HomeCapabilitiesSection() {
  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">

        {/* Left Content */}
        <div className="flex flex-col items-start lg:sticky lg:top-32 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-7 bg-[#B58A62]" />
            <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
              Our Capabilities
            </span>
          </div>

          <h2 className="max-w-[490px] font-heading text-[clamp(2.2rem,4.3vw,3.7rem)] font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27]">
            From big ideas to{" "}
            <span className="text-[#B58A62]">real-world impact.</span>
          </h2>

          <p className="mt-6 max-w-[390px] text-[12px] leading-[2] text-[#777A80] sm:text-[13px]">
            Great digital solutions need more than individual skills. They
            need connected thinking, careful execution and a clear
            understanding of what success looks like.
          </p>

          <Link
            href="/services"
            className="group mt-8 inline-flex items-center gap-4 border-b border-[#B58A62] pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62]"
          >
            Explore Our Services
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>

          <div className="mt-14 hidden w-full border-t border-[#191D27]/10 pt-6 lg:block">
            <span className="font-heading text-[42px] font-semibold tracking-[-2px] text-[#B58A62]">
              360°
            </span>
            <p className="mt-1 text-[9px] uppercase tracking-[1.8px] text-[#777A80]">
              Connected Digital Thinking
            </p>
          </div>
        </div>

        {/* Right Capabilities - Sticky */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="border-t border-[#191D27]/15">
            {capabilities.map((item) => (
              <article
                key={item.number}
                className="group grid gap-5 border-b border-[#191D27]/15 py-7 sm:grid-cols-[55px_1fr] sm:gap-7 sm:py-9"
              >
                <span className="font-heading text-[13px] font-semibold text-[#B58A62]">
                  / {item.number}
                </span>

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading text-[19px] font-semibold tracking-[-0.6px] text-[#191D27] transition-colors duration-300 group-hover:text-[#B58A62] sm:text-[22px]">
                      {item.title}
                    </h3>

                    <span className="shrink-0 text-lg text-[#B58A62] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </div>

                  <p className="mt-3 max-w-[480px] text-[11px] leading-[1.9] text-[#777A80] sm:text-[12px]">
                    {item.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#191D27]/10 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.8px] text-[#777A80]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
