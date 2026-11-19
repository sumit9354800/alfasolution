
import Link from "next/link";

export default function HomeIntroSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between border-b border-[#191D27]/10 pb-5 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#B58A62]" />
            <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
              Introducing Alfa Solution
            </span>
          </div>

          <span className="text-[9px] uppercase tracking-[1.5px] text-[#777A80]">
            Who We Are / 01
          </span>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">

          {/* Left Side */}
          <div>
            <h2 className="max-w-[850px] font-heading text-[clamp(2.2rem,4.8vw,4.5rem)] font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27]">
              We bring clarity to complex ideas and turn them into{" "}
              <span className="text-[#B58A62]">
                meaningful digital experiences.
              </span>
            </h2>
          </div>

          {/* Right Side */}
          <div className="flex flex-col justify-end lg:pb-2">
            <p className="text-[13px] leading-[2] text-[#777A80] sm:text-[14px]">
              At Alfa Solution, we believe great digital work starts with
              understanding. We bring strategy, creative thinking and
              technology together to build digital solutions that solve
              real problems and create lasting value.
            </p>

            <p className="mt-5 text-[13px] leading-[2] text-[#777A80] sm:text-[14px]">
              From the first idea to the final experience, our focus stays on
              creating work that is thoughtful, purposeful and built around
              the people who use it.
            </p>

            <Link
              href="/about"
              className="group mt-8 inline-flex w-fit items-center gap-4 border-b border-[#B58A62] pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62]"
            >
              More About Alfa Solution
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Statement */}
        <div className="mt-16 border-t border-[#191D27]/10 pt-7 sm:mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-[500px] font-heading text-[19px] font-medium leading-[1.5] tracking-[-0.5px] text-[#191D27] sm:text-[23px]">
              Better thinking. Better design. Better digital outcomes.
            </p>

            <span className="text-[9px] font-medium uppercase tracking-[2px] text-[#B58A62]">
              Built with purpose.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}