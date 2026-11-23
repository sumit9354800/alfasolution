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

const pillars = ["Strategy", "Design", "Technology"];

const styles = `
@keyframes sp-fade-up {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes sp-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.35); }
}

/* Reveal on scroll (CSS only). Browsers without scroll-driven
   animations simply show the content normally. */
@supports (animation-timeline: view()) {
  .sp-reveal {
    animation: sp-fade-up linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
}

.sp-dot { animation: sp-pulse 2.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .sp-reveal, .sp-dot { animation: none !important; }
}
`;

export default function HomeStoryProblem() {
  return (
    <section
      aria-labelledby="story-problem-heading"
      className="relative isolate overflow-clip bg-[#F4F1EA] py-20 sm:py-24 lg:py-28"
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Subtle grid background with fade-out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_65%)]"
        style={{
          backgroundImage:
            "linear-gradient(#191D27 1px, transparent 1px), linear-gradient(90deg, #191D27 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Bronze ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-[#B58A62]/15 blur-[130px]"
      />

      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">
        {/* Left Content */}
        <div className="flex flex-col items-start lg:sticky lg:top-32 lg:self-start">
          <div className="sp-reveal mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-[#B58A62] to-transparent" />
            <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8D6749] sm:text-[11px]">
              The Challenge
            </span>
          </div>

          <h2
            id="story-problem-heading"
            className="sp-reveal max-w-[540px] font-heading text-[clamp(2.1rem,4vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27]"
          >
            Most digital projects don&apos;t fail on{" "}
            <span className="bg-gradient-to-r from-[#B58A62] via-[#D2AD8D] to-[#B58A62] bg-clip-text text-transparent">
              technology.
            </span>
          </h2>

          <p className="sp-reveal mt-6 max-w-[470px] text-[14px] leading-[1.85] text-[#5F6269] sm:text-[15px]">
            They fail when strategy, design and technology move in different
            directions. The result is a digital experience that looks
            disconnected from the business it is meant to support.
          </p>

          {/* Three pillars that need to stay aligned */}
          <ul
            className="sp-reveal mt-7 flex flex-wrap items-center gap-2"
            aria-label="What needs to stay aligned"
          >
            {pillars.map((pillar, i) => (
              <li key={pillar} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 border border-[#191D27]/15 bg-white/70 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#191D27] backdrop-blur-sm">
                  <span
                    aria-hidden="true"
                    className="sp-dot h-1.5 w-1.5 rounded-full bg-[#B58A62]"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                  {pillar}
                </span>
                {i < pillars.length - 1 && (
                  <span aria-hidden="true" className="text-[#B58A62]">
                    +
                  </span>
                )}
              </li>
            ))}
          </ul>

          <Link
            href="/about"
            className="sp-reveal group mt-9 inline-flex min-h-[44px] items-center gap-4 border-b border-[#B58A62] pb-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A62] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F4F1EA]"
          >
            Discover Our Approach
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
            >
              ↗
            </span>
          </Link>
        </div>

        {/* Right Cards */}
        <ol className="relative flex flex-col gap-4">
          {/* Vertical connector line (desktop) */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-0 top-6 hidden w-px bg-gradient-to-b from-transparent via-[#B58A62]/40 to-transparent lg:block"
          />

          {problems.map((problem) => (
            <li key={problem.number} className="sp-reveal lg:pl-8">
              <article className="group relative h-full overflow-hidden border border-[#191D27]/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B58A62]/60 hover:shadow-[0_18px_45px_rgba(25,29,39,0.09)] sm:p-8">
                {/* Bronze accent bar */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-[#B58A62] transition-transform duration-500 group-hover:scale-y-100"
                />

                {/* Hover tint */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#B58A62]/0 blur-3xl transition-colors duration-500 group-hover:bg-[#B58A62]/15"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="font-heading text-[30px] font-semibold tracking-[-1.5px] text-[#B58A62] transition-transform duration-300 group-hover:translate-x-1">
                    {problem.number}
                  </span>

                  <span className="border border-[#191D27]/15 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[1.3px] text-[#5F6269] transition-colors duration-300 group-hover:border-[#B58A62]/50 group-hover:text-[#8D6749]">
                    {problem.tag}
                  </span>
                </div>

                <h3 className="relative mt-7 max-w-[420px] font-heading text-[20px] font-semibold tracking-[-0.6px] text-[#191D27] sm:text-[23px]">
                  {problem.title}
                </h3>

                <p className="relative mt-3 max-w-[460px] text-[13px] leading-[1.85] text-[#5F6269] sm:text-[14px]">
                  {problem.description}
                </p>

                <div
                  aria-hidden="true"
                  className="relative mt-7 h-px w-full bg-[#191D27]/10"
                >
                  <div className="h-px w-0 bg-[#B58A62] transition-all duration-700 group-hover:w-full" />
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}