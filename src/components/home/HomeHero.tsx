import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-[#191D27] lg:min-h-[calc(100svh-76px)]">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg/home-hero.jpeg')",
        }}
      />

      {/* Dark Cinematic Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#191D27] via-[#191D27]/90 to-[#191D27]/45" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#191D27] via-transparent to-[#191D27]/35" />

      {/* Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />

      {/* Bronze Ambient Glow */}
      <div className="pointer-events-none absolute -right-32 top-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-[#B58A62]/15 blur-[140px]" />

      <div className="mx-auto w-full max-w-[1500px] px-5 pb-32 pt-24 sm:px-8 lg:px-12 lg:pb-36 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT CONTENT */}
          <div className="relative z-10 max-w-[720px]">
            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-[#B58A62]" />

              <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#D2AD8D] sm:text-[10px]">
                Digital Solutions · Built Around You
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-heading text-[clamp(2.8rem,5.7vw,5.4rem)] font-semibold leading-[0.99] tracking-[-0.065em] text-[#F4F1EA]">
              Turning bold
              <br />
              ideas into
              <br />
              <span className="text-[#B58A62]">digital reality.</span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[470px] text-[13px] leading-[1.9] text-[#F4F1EA]/70 sm:text-[15px]">
              We design and develop websites and mobile applications that bring
              ideas to life, support business goals and create meaningful
              digital experiences.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-6 bg-[#B58A62] px-6 py-4 text-[11px] font-semibold text-[#191D27] transition-all duration-300 hover:bg-[#F4F1EA]"
              >
                Start a Project
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  ↗
                </span>
              </Link>

              <Link
                href="/services"
                className="group inline-flex items-center gap-6 border border-white/25 px-6 py-4 text-[11px] font-semibold text-white transition-all duration-300 hover:border-[#B58A62] hover:text-[#D2AD8D]"
              >
                Explore Services
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  ↗
                </span>
              </Link>
            </div>

            {/* Small Trust Details */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-[9px] uppercase tracking-[1.8px] text-white/40">
                  Our Focus
                </p>
                <p className="mt-2 text-xs font-medium text-white/85">
                  Website Development
                </p>
              </div>

              <span className="hidden h-8 w-px bg-white/15 sm:block" />

              <div>
                <p className="text-[9px] uppercase tracking-[1.8px] text-white/40">
                  Our Expertise
                </p>
                <p className="mt-2 text-xs font-medium text-white/85">
                  Application Development
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative mx-auto hidden aspect-square w-full max-w-[490px] items-center justify-center lg:flex">
            {/* Orbital Circles */}
            <div className="absolute h-[390px] w-[390px] rounded-full border border-[#B58A62]/25" />

            <div className="absolute h-[310px] w-[310px] rounded-full border border-white/10" />

            <div className="absolute h-[230px] w-[230px] rounded-full border border-dashed border-[#B58A62]/35" />

            {/* Central Visual */}
            <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border border-[#B58A62]/35 bg-[#191D27]/80 shadow-[0_0_100px_rgba(181,138,98,0.15)] backdrop-blur-xl">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-[3px] text-[#D2AD8D]">
                  Alfa Solution
                </span>

                <div className="relative mt-4 h-16 w-16">
                  <Image
                    src="/icon.png"
                    alt="Alfa Solution"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>

                <p className="mt-3 text-[9px] uppercase tracking-[2px] text-white/45">
                  Digital Studio
                </p>
              </div>
            </div>

            {/* Floating Label 1 */}
            <div className="absolute right-0 top-[17%] border border-white/15 bg-[#191D27]/85 px-5 py-4 shadow-xl backdrop-blur-md">
              <span className="text-[8px] uppercase tracking-[2px] text-[#B58A62]">
                01 / Web
              </span>

              <p className="mt-2 text-xs font-medium text-white">
                Website Development
              </p>
            </div>

            {/* Floating Label 2 */}
            <div className="absolute bottom-[18%] left-0 border border-white/15 bg-[#191D27]/85 px-5 py-4 shadow-xl backdrop-blur-md">
              <span className="text-[8px] uppercase tracking-[2px] text-[#B58A62]">
                02 / Apps
              </span>

              <p className="mt-2 text-xs font-medium text-white">
                Application Development
              </p>
            </div>

            {/* Small Decorative Points */}
            <span className="absolute left-[19%] top-[25%] h-2 w-2 rounded-full bg-[#B58A62] shadow-[0_0_15px_#B58A62]" />

            <span className="absolute bottom-[26%] right-[17%] h-2 w-2 rounded-full bg-[#B58A62] shadow-[0_0_15px_#B58A62]" />

            <span className="absolute right-[25%] top-[8%] text-xs text-[#B58A62]">
              ∞
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-[1500px] items-center justify-between border-t border-white/15 px-5 py-5 sm:px-8 lg:px-12">
        <p className="text-[8px] uppercase tracking-[2px] text-white/45 sm:text-[9px]">
          Thoughtful work. Meaningful outcomes.
        </p>

        <a
          href="#services"
          className="group flex items-center gap-3 text-[8px] font-medium uppercase tracking-[1.8px] text-white/60 transition-colors hover:text-[#D2AD8D] sm:text-[9px]"
        >
          Scroll to explore
          <span className="inline-block text-base transition-transform duration-300 group-hover:translate-y-1">
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}
