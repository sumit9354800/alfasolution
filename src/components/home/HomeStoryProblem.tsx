
import Link from "next/link";

const problems = [
  {
    number: "01",
    title: "Disconnected Digital Experiences",
    description:
      "Websites, platforms and tools that don't work together create friction for both businesses and customers.",
    tag: "Fragmented systems",
  },
  {
    number: "02",
    title: "Design Without Strategy",
    description:
      "An attractive digital presence means little when it doesn't support clear business goals or user needs.",
    tag: "Missing direction",
  },
  {
    number: "03",
    title: "Technology That Doesn't Scale",
    description:
      "Outdated solutions make it harder to adapt, grow and keep up with changing customer expectations.",
    tag: "Limited growth",
  },
];

export default function HomeStoryProblem() {
  return (
    <section className="bg-[#F4F1EA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">

        {/* Left Content */}
        <div className="flex flex-col items-start lg:sticky lg:top-32 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-7 bg-[#B58A62]" />
            <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
              The Challenge
            </span>
          </div>

          <h2 className="max-w-[540px] font-heading text-[clamp(2.1rem,4vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27]">
            Most digital projects don&apos;t fail on{" "}
            <span className="text-[#B58A62]">technology.</span>
          </h2>

          <p className="mt-6 max-w-[420px] text-[13px] leading-[1.9] text-[#777A80]">
            They fail when strategy, design and technology move in different
            directions. The result is a digital experience that looks
            disconnected from the business it is meant to support.
          </p>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-4 border-b border-[#B58A62] pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62]"
          >
            Discover Our Approach
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>

        {/* Right Cards */}
        <div className="flex flex-col gap-3">
          {problems.map((problem) => (
            <article
              key={problem.number}
              className="group relative overflow-hidden border border-[#191D27]/10 bg-white p-6 transition-all duration-300 hover:border-[#B58A62]/60 hover:shadow-[0_12px_35px_rgba(25,29,39,0.06)] sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-heading text-[27px] font-semibold tracking-[-1.5px] text-[#B58A62]">
                  {problem.number}
                </span>

                <span className="border border-[#191D27]/10 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[1.3px] text-[#777A80]">
                  {problem.tag}
                </span>
              </div>

              <h3 className="mt-7 max-w-[390px] font-heading text-[19px] font-semibold tracking-[-0.6px] text-[#191D27] sm:text-[21px]">
                {problem.title}
              </h3>

              <p className="mt-3 max-w-[430px] text-[12px] leading-[1.9] text-[#777A80] sm:text-[13px]">
                {problem.description}
              </p>

              <div className="mt-7 h-px w-full bg-[#191D27]/10">
                <div className="h-px w-0 bg-[#B58A62] transition-all duration-500 group-hover:w-full" />
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}