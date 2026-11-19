
import Link from "next/link";

export default function FacilitiesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#191D27] px-6 py-24 text-white sm:px-8 lg:min-h-[580px] lg:px-12 lg:py-32">
      {/* Background */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/facilities-hero-bg.jpg')",
        }}
      />

      <div className="absolute inset-0 -z-10 bg-[#191D27]/85" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#191D27] via-[#191D27]/90 to-[#191D27]/55" />
      <div className="absolute -right-32 top-0 -z-10 h-[450px] w-[450px] rounded-full bg-[#B58A62]/15 blur-[120px]" />

      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex items-center gap-3 text-xs text-white/45">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-[#D0A47E]">Facilities</span>
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D0A47E]">
                Our Development Packages
              </span>
            </div>

            <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[68px]">
              The right solution.
              <span className="block text-[#D0A47E]">
                The right features.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Explore our website and application development packages.
              Compare the features, understand what&apos;s included and choose
              a solution that fits your project requirements.
            </p>

            <Link
              href="#packages"
              className="mt-10 inline-flex items-center gap-4 bg-[#B58A62] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#191D27]"
            >
              Explore Packages
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="border-l border-[#B58A62]/60 pl-7 lg:mb-3">
            <p className="font-heading text-5xl font-semibold text-[#D0A47E]">
              02
            </p>
            <p className="mt-4 max-w-xs text-lg leading-8 text-white/75">
              Focused development solutions for websites and mobile
              applications.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="border border-white/15 px-4 py-2 text-xs text-white/65">
                Website Development
              </span>
              <span className="border border-white/15 px-4 py-2 text-xs text-white/65">
                App Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
