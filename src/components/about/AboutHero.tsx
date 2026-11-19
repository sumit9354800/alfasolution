
import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#F4F1EA]">
      <div className="pointer-events-none absolute -right-40 top-10 h-[500px] w-[500px] rounded-full border border-[#B58A62]/15" />
      <div className="pointer-events-none absolute -right-20 top-28 h-[340px] w-[340px] rounded-full border border-[#B58A62]/15" />

      <div className="mx-auto grid min-h-[580px] max-w-[1440px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-24">

        {/* Left Content */}
        <div className="relative z-10">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 bg-[#B58A62]" />
            <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
              About Alfa Solution
            </span>
          </div>

          <h1 className="max-w-[720px] font-heading text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.065em] text-[#191D27]">
            We build ideas into{" "}
            <span className="text-[#B58A62]">digital experiences.</span>
          </h1>

          <p className="mt-7 max-w-[510px] text-sm leading-8 text-[#777A80] sm:text-base">
            Alfa Solution is a digital solutions company focused on helping
            businesses build meaningful digital experiences through strategy,
            creative design and modern technology.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-5 bg-[#191D27] px-6 py-4 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#B58A62]"
            >
              Let&apos;s Work Together
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>

            <Link
              href="/services"
              className="border-b border-[#191D27]/30 pb-2 text-xs font-semibold text-[#191D27] transition-colors hover:border-[#B58A62] hover:text-[#B58A62]"
            >
              Explore Our Services
            </Link>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center lg:min-h-[420px]">

          <div className="relative aspect-square w-full max-w-[390px]">

            {/* Background Shape */}
            <div className="absolute inset-5 rotate-6 border border-[#B58A62]/30" />

            <div className="absolute inset-10 -rotate-3 bg-[#191D27]" />

            {/* Center Content */}
            <div className="absolute inset-10 flex flex-col justify-between p-7 text-[#F4F1EA] sm:p-10">

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[2px] text-[#B58A62]">
                  Our Philosophy
                </span>

                <span className="text-xs text-white/40">
                  01 — 04
                </span>
              </div>

              <div>
                <span className="font-heading text-6xl font-semibold tracking-[-5px] text-[#B58A62] sm:text-7xl">
                  A.
                </span>

                <h2 className="mt-3 max-w-[230px] font-heading text-2xl font-semibold leading-tight tracking-[-1px] sm:text-3xl">
                  Think better.
                  <br />
                  Create smarter.
                  <br />
                  Build stronger.
                </h2>
              </div>

              <div className="flex items-center justify-between border-t border-white/15 pt-5">
                <span className="text-[9px] uppercase tracking-[1.5px] text-white/45">
                  Alfa Solution
                </span>

                <span className="text-lg text-[#B58A62]">↗</span>
              </div>

            </div>

            {/* Floating Detail */}
            <div className="absolute -bottom-3 -left-2 bg-[#B58A62] px-5 py-4 text-[#191D27] shadow-xl sm:-left-5">
              <p className="text-[9px] font-semibold uppercase tracking-[1.5px]">
                Our Focus
              </p>
              <p className="mt-1 font-heading text-sm font-semibold">
                Ideas into Impact.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
