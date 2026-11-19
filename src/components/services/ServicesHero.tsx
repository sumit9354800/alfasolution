
import Link from "next/link";

const expertise = ["Strategy", "Design", "Development", "Digital Growth"];

export default function ServicesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#191D27] px-6 py-20 text-white sm:px-8 lg:min-h-[720px] lg:px-12 lg:py-28">

      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/services-hero-bg.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 -z-10 bg-[#191D27]/85" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#191D27] via-[#191D27]/90 to-[#191D27]/50" />

      {/* Background Decoration */}
      <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#B58A62]/10 blur-[130px]" />

      <div className="mx-auto grid max-w-[1400px] items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-20">

        {/* Left Content */}
        <div className="max-w-2xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-[#B58A62]" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D9B999]">
              What We Do
            </span>
          </div>

          <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[64px]">
            Digital services.
            <span className="block text-[#D0A47E]">
              Meaningful results.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
            From thoughtful design to powerful technology, we create digital
            solutions that help businesses move forward with clarity and
            confidence.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="#our-services"
              className="inline-flex items-center gap-4 bg-[#B58A62] px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#191D27]"
            >
              Explore Our Services
              <span aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#D0A47E]"
            >
              Discuss Your Project
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="mt-16 border-t border-white/15 pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Our Expertise
            </p>

            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-white/70">
              {expertise.map((item, index) => (
                <span key={item}>
                  {item}
                  {index !== expertise.length - 1 && (
                    <span className="ml-3 text-[#B58A62]">/</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Digital Visual */}
        <div className="relative mx-auto w-full max-w-[520px] py-8">

          {/* Outer Frame */}
          <div className="absolute inset-0 rotate-[-6deg] border border-[#B58A62]/30" />
          <div className="absolute inset-5 rotate-[4deg] border border-white/10" />

          {/* Main Visual Card */}
          <div className="relative z-10 overflow-hidden border border-white/15 bg-[#202632]/85 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">

            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D0A47E]">
                Alfa / Digital Studio
              </span>
              <span className="h-2 w-2 rounded-full bg-[#B58A62] shadow-[0_0_12px_#B58A62]" />
            </div>

            <div className="py-9">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Creative meets technology
              </p>

              <h2 className="mt-4 max-w-sm font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                Building the next
                <span className="block text-[#D0A47E]">
                  digital experience.
                </span>
              </h2>
            </div>

            {/* Abstract Design Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex aspect-[1.25/1] flex-col justify-between bg-[#B58A62] p-4">
                <span className="text-xs font-medium text-white/75">01 / Design</span>
                <div className="flex items-end gap-1">
                  <div className="h-8 w-8 rounded-full border border-white/70" />
                  <div className="h-12 w-12 rounded-full border border-white/50" />
                  <div className="h-16 w-16 rounded-full bg-white/20" />
                </div>
              </div>

              <div className="flex aspect-[1.25/1] flex-col justify-between border border-white/15 bg-white/[0.04] p-4">
                <span className="text-xs font-medium text-white/50">02 / Technology</span>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square border ${
                        index === 4
                          ? "border-[#B58A62] bg-[#B58A62]/40"
                          : "border-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Detail */}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-xs text-white/45">
                Think. Create. Develop.
              </span>
              <span className="font-heading text-2xl font-semibold text-[#D0A47E]">
                01—04
              </span>
            </div>
          </div>

          {/* Floating Label */}
          <div className="absolute -right-3 top-0 z-20 border border-white/15 bg-[#191D27] px-5 py-4 shadow-xl sm:-right-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Our Focus
            </p>
            <p className="mt-1 text-sm font-semibold text-[#D0A47E]">
              Digital Excellence
            </p>
          </div>

          {/* Floating Accent */}
          <div className="absolute -bottom-3 -left-3 z-20 flex h-20 w-20 items-center justify-center border border-[#B58A62]/50 bg-[#191D27] sm:-left-8">
            <span className="font-heading text-3xl text-[#B58A62]">A.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
