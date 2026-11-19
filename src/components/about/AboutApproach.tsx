
const approachSteps = [
  {
    number: "01",
    title: "Discover",
    subtitle: "Understand before we create.",
    description:
      "We explore your business, audience, challenges and goals to understand what your project truly needs.",
    tags: ["Research", "Discovery", "Planning"],
  },
  {
    number: "02",
    title: "Define",
    subtitle: "Give every idea a direction.",
    description:
      "We shape the project strategy, define priorities and create a clear roadmap for the right solution.",
    tags: ["Strategy", "Structure", "Direction"],
  },
  {
    number: "03",
    title: "Develop",
    subtitle: "Turn thinking into reality.",
    description:
      "We combine thoughtful design and modern technology to build intuitive, responsive digital experiences.",
    tags: ["Design", "Development", "Integration"],
  },
  {
    number: "04",
    title: "Deliver",
    subtitle: "Launch with confidence.",
    description:
      "We refine, test and prepare the final experience to ensure it is ready for real-world use.",
    tags: ["Testing", "Launch", "Support"],
  },
];

export default function AboutApproach() {
  return (
    <section className="relative overflow-hidden bg-[#191D27] py-20 text-[#F4F1EA] sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#B58A62]/10 blur-[130px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Heading */}
        <div className="mb-16 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">

          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#B58A62]">
                Our Approach
              </span>
            </div>

            <h2 className="max-w-[650px] font-heading text-3xl font-semibold leading-[1.12] tracking-[-0.055em] sm:text-5xl lg:text-[58px]">
              A thoughtful process.
              <span className="block text-[#B58A62]">
                Meaningful outcomes.
              </span>
            </h2>
          </div>

          <p className="max-w-[440px] text-xs leading-7 text-white/50 sm:text-sm lg:justify-self-end">
            Every successful digital project needs a clear direction.
            Our approach connects strategy, creativity and technology
            at every stage of the journey.
          </p>

        </div>

        {/* Process Steps */}
        <div className="grid border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">

          {approachSteps.map((step) => (
            <article
              key={step.number}
              className="group relative flex min-h-[330px] flex-col border-b border-r border-white/15 p-6 transition-colors duration-300 hover:bg-white/[0.035] sm:min-h-[360px] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-semibold text-[#B58A62]">
                  / {step.number}
                </span>

                <span className="text-xl text-white/25 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#B58A62]">
                  ↗
                </span>
              </div>

              <div className="mt-12">
                <h3 className="font-heading text-2xl font-semibold tracking-[-0.8px] text-[#F4F1EA] sm:text-3xl">
                  {step.title}
                </h3>

                <p className="mt-3 text-xs font-medium text-[#B58A62]">
                  {step.subtitle}
                </p>

                <p className="mt-5 text-[11px] leading-[1.9] text-white/50 sm:text-xs">
                  {step.description}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-8">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/15 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.8px] text-white/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}

        </div>

        {/* Bottom Note */}
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-[10px] uppercase tracking-[1.5px] text-white/40">
            From the first conversation to the final delivery.
          </p>

          <span className="font-heading text-sm font-semibold text-[#B58A62]">
            Think · Create · Build · Grow
          </span>
        </div>

      </div>
    </section>
  );
}
