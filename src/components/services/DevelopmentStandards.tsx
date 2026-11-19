
import Link from "next/link";

const standards = [
  {
    number: "01",
    title: "Responsive Development",
    description:
      "Websites and applications designed to work smoothly across desktop, tablet and mobile screen sizes.",
  },
  {
    number: "02",
    title: "Performance Optimization",
    description:
      "Efficient development practices that help improve loading speed, responsiveness and overall user experience.",
  },
  {
    number: "03",
    title: "Security & Reliability",
    description:
      "Thoughtful implementation of secure integrations, data handling and reliable application functionality.",
  },
  {
    number: "04",
    title: "Scalable Architecture",
    description:
      "Development structures that make it easier to maintain, extend and improve your digital product over time.",
  },
];

const technologies = [
  "Next.js",
  "React",
  "JavaScript",
  "TypeScript",
  "Tailwind CSS",
  "React Native",
  "Flutter",
  "REST APIs",
];

export default function DevelopmentStandards() {
  return (
    <section className="bg-[#F4F1EA] px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1400px]">

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8D6749]">
                Our Development Standards
              </span>
            </div>

            <h2 className="max-w-2xl font-heading text-3xl font-semibold leading-tight text-[#191D27] sm:text-4xl lg:text-5xl">
              Built with purpose.
              <span className="block text-[#B58A62]">
                Developed with care.
              </span>
            </h2>
          </div>

          <p className="max-w-xl text-base leading-8 text-[#626873] lg:justify-self-end">
            A great digital product needs more than good looks. We focus on
            the technical foundations that make websites and applications
            useful, reliable and ready to grow.
          </p>
        </div>

        {/* Standards Grid */}
        <div className="mt-16 grid gap-px border border-[#191D27]/10 bg-[#191D27]/10 sm:grid-cols-2">
          {standards.map((item) => (
            <article
              key={item.number}
              className="group bg-[#F4F1EA] p-7 transition-colors duration-300 hover:bg-white sm:p-9 lg:p-11"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-semibold text-[#B58A62]">
                  {item.number}
                </span>
                <span className="text-xl text-[#B58A62] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </div>

              <h3 className="mt-8 font-heading text-xl font-semibold text-[#191D27] sm:text-2xl">
                {item.title}
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#626873]">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="mt-20 border-t border-[#191D27]/15 pt-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8D6749]">
                Technology Stack
              </p>

              <h3 className="mt-4 font-heading text-2xl font-semibold text-[#191D27] sm:text-3xl">
                The right tools for the right solution.
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#626873]">
                We select development technologies according to project
                requirements, functionality and long-term maintenance needs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {technologies.map((technology) => (
                <div
                  key={technology}
                  className="flex min-h-[76px] items-center justify-center border border-[#191D27]/10 bg-white px-3 text-center text-sm font-semibold text-[#191D27] transition hover:border-[#B58A62] hover:text-[#8D6749]"
                >
                  {technology}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 flex flex-col gap-7 bg-[#191D27] p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D0A47E]">
              Have a Project in Mind?
            </p>

            <h3 className="mt-4 font-heading text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
              Let&apos;s build something meaningful together.
            </h3>

            <p className="mt-4 text-sm leading-7 text-white/55">
              Tell us about your website or app idea and let&apos;s explore the
              right development solution for your business.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-4 bg-[#B58A62] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#191D27]"
          >
            Start Your Project
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
