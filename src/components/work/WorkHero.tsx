
import Link from "next/link";

export default function WorkHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#191D27] px-6 py-24 text-white sm:px-8 lg:min-h-[620px] lg:px-12 lg:py-32">

      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/work-hero-bg.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 -z-10 bg-[#191D27]/85" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#191D27] via-[#191D27]/85 to-[#191D27]/50" />

      {/* Background Glow */}
      <div className="absolute -right-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#B58A62]/15 blur-[130px]" />

      <div className="mx-auto max-w-[1400px]">

        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-3 text-xs text-white/45">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#D0A47E]">Our Work</span>
        </div>

        <div className="grid items-end gap-14 lg:grid-cols-[1.2fr_0.8fr]">

          {/* Main Content */}
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D0A47E]">
                Selected Work
              </span>
            </div>

            <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[68px]">
              Ideas transformed
              <span className="block text-[#D0A47E]">
                into digital experiences.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Explore our website and app development work, where thoughtful
              design meets technology to create digital solutions built
              around real business needs.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="#featured-projects"
                className="inline-flex items-center gap-4 bg-[#B58A62] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#191D27]"
              >
                Explore Projects
                <span aria-hidden="true">↗</span>
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#D0A47E]"
              >
                Start a Project
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          {/* Right Editorial Panel */}
          <div className="relative lg:justify-self-end lg:max-w-sm">
            <div className="border-l border-[#B58A62] pl-7">
              <span className="font-heading text-5xl font-semibold text-[#D0A47E]">
                W.
              </span>

              <p className="mt-5 text-lg leading-8 text-white/80">
                Every project starts with an idea. The right development
                turns that idea into something people can use.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B58A62]" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/45">
                  Design. Develop. Deliver.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Label */}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
            Website Development
          </span>

          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
            App Development
          </span>
        </div>

      </div>
    </section>
  );
}
