
import Link from "next/link";

const reasons = [
  {
    number: "01",
    title: "Strategy Before Execution",
    description:
      "We understand your business goals first, then build a digital approach that supports your long-term vision.",
    icon: "◎",
  },
  {
    number: "02",
    title: "Design With Purpose",
    description:
      "Every visual decision has a reason. We focus on clarity, usability and experiences people enjoy using.",
    icon: "✳",
  },
  {
    number: "03",
    title: "Technology That Works",
    description:
      "We choose practical, reliable technologies to create digital solutions that perform and grow with your business.",
    icon: "⌘",
  },
  {
    number: "04",
    title: "A Collaborative Approach",
    description:
      "We keep communication clear, involve you in important decisions and work towards shared outcomes.",
    icon: "↗",
  },
];

export default function HomeWhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-12 grid gap-7 border-b border-[#191D27]/15 pb-9 lg:mb-16 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                Why Alfa Solution
              </span>
            </div>

            <h2 className="max-w-[700px] font-heading text-[clamp(2.3rem,4.5vw,3.8rem)] font-semibold leading-[1.1] tracking-[-0.055em] text-[#191D27]">
              More than a service.
              <br />
              <span className="text-[#B58A62]">A thoughtful partnership.</span>
            </h2>
          </div>

          <p className="max-w-[360px] text-[12px] leading-[2] text-[#777A80] lg:pb-1">
            The right digital partner brings clarity, creativity and
            commitment to every stage of your journey.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <article
              key={reason.number}
              className="group relative flex min-h-[265px] flex-col border border-[#191D27]/10 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#B58A62]/60 hover:shadow-[0_18px_45px_rgba(25,29,39,0.07)] sm:p-7"
            >
              <div className="flex items-start justify-between">
                <span className="font-heading text-[11px] font-semibold tracking-[1px] text-[#B58A62]">
                  / {reason.number}
                </span>

                <span className="flex h-11 w-11 items-center justify-center border border-[#B58A62]/30 font-heading text-[23px] text-[#B58A62] transition-all duration-500 group-hover:rotate-12 group-hover:bg-[#191D27] group-hover:text-[#F4F1EA]">
                  {reason.icon}
                </span>
              </div>

              <div className="mt-auto pt-12">
                <h3 className="font-heading text-[17px] font-semibold leading-[1.4] tracking-[-0.4px] text-[#191D27] sm:text-[18px]">
                  {reason.title}
                </h3>

                <p className="mt-3 text-[11px] leading-[1.9] text-[#777A80]">
                  {reason.description}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#B58A62] transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-[#191D27]/15 pt-7 sm:flex-row sm:items-center">
          <p className="max-w-[430px] font-heading text-[16px] font-medium leading-[1.6] text-[#191D27] sm:text-[19px]">
            Good work begins with the right conversation.
          </p>

          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-4 border-b border-[#B58A62] pb-2 text-[9px] font-semibold uppercase tracking-[1.6px] text-[#191D27] transition-colors hover:text-[#B58A62]"
          >
            Let&apos;s Work Together
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}