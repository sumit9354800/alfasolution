
import Link from "next/link";

const highlights = [
  {
    number: "01",
    title: "Understand",
    description: "We begin by understanding your business, goals and audience.",
  },
  {
    number: "02",
    title: "Create",
    description: "We turn insights into thoughtful designs and digital solutions.",
  },
  {
    number: "03",
    title: "Deliver",
    description: "We build, refine and deliver experiences made to create value.",
  },
];

export default function AboutStory() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Section Heading */}
        <div className="mb-14 grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                Our Story
              </span>
            </div>

            <h2 className="max-w-[460px] font-heading text-3xl font-semibold leading-[1.15] tracking-[-0.05em] text-[#191D27] sm:text-4xl lg:text-[48px]">
              Built around ideas.
              <span className="block text-[#B58A62]">
                Driven by purpose.
              </span>
            </h2>
          </div>

          <div className="max-w-[570px] lg:justify-self-end">
            <p className="text-sm leading-8 text-[#777A80] sm:text-base">
              Every business has a story worth telling and an opportunity
              worth exploring. At Alfa Solution, we bring strategy, design
              and technology together to help turn those opportunities into
              meaningful digital experiences.
            </p>
          </div>
        </div>

        {/* Story Content */}
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

          {/* Dark Visual Panel */}
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden bg-[#191D27] p-8 sm:min-h-[420px] sm:p-12">

            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#B58A62]/20" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-[#B58A62]/20" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#B58A62]">
                The Alfa Approach
              </span>
              <span className="text-xs text-white/35">02 / 05</span>
            </div>

            <div className="relative z-10">
              <span className="font-heading text-7xl font-semibold tracking-[-6px] text-[#B58A62] sm:text-8xl">
                A.
              </span>

              <h3 className="mt-5 max-w-[390px] font-heading text-3xl font-semibold leading-[1.2] tracking-[-1.5px] text-[#F4F1EA] sm:text-4xl">
                Good ideas deserve thoughtful execution.
              </h3>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5">
              <span className="text-[9px] uppercase tracking-[1.8px] text-white/45">
                Strategy · Design · Technology
              </span>
              <span className="text-xl text-[#B58A62]">↗</span>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-between border border-[#191D27]/10 bg-[#F4F1EA] p-7 sm:p-10 lg:p-12">

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8D6749]">
                How We Think
              </span>

              <h3 className="mt-5 max-w-[400px] font-heading text-2xl font-semibold leading-tight tracking-[-1px] text-[#191D27] sm:text-3xl">
                The right solution starts with the right understanding.
              </h3>

              <p className="mt-5 max-w-[450px] text-xs leading-7 text-[#777A80] sm:text-sm">
                We believe digital work should do more than look good.
                It should solve real problems, make things easier for people
                and support the way a business grows.
              </p>
            </div>

            <div className="mt-10 border-t border-[#191D27]/15">
              {highlights.map((item) => (
                <div
                  key={item.number}
                  className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#191D27]/15 py-5"
                >
                  <span className="pt-1 text-[10px] font-semibold text-[#B58A62]">
                    {item.number}
                  </span>

                  <div>
                    <h4 className="font-heading text-base font-semibold text-[#191D27]">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-[11px] leading-6 text-[#777A80] sm:text-xs">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="group mt-8 inline-flex w-fit items-center gap-4 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62]"
            >
              Start a Conversation
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>

          </div>
        </div>

      </div>
    </section>
  );
}
