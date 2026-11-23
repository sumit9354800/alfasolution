import Image from "next/image";
import Link from "next/link";

const heroStyles = `
@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hero-fade-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes hero-spin { to { transform: rotate(360deg); } }
@keyframes hero-spin-reverse { to { transform: rotate(-360deg); } }
@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
@keyframes hero-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(5px); }
}
@keyframes hero-pulse-glow {
  0%, 100% { opacity: 0.12; }
  50%      { opacity: 0.22; }
}
.hero-fade-up { animation: hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--d, 0ms); }
.hero-fade-in { animation: hero-fade-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: var(--d, 0ms); }
.hero-spin-slow { animation: hero-spin 60s linear infinite; }
.hero-spin-slower { animation: hero-spin-reverse 90s linear infinite; }
.hero-float { animation: hero-float 6s ease-in-out infinite; animation-delay: var(--d, 0ms); }
.hero-bounce { animation: hero-bounce 1.8s ease-in-out infinite; }
.hero-glow { animation: hero-pulse-glow 6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .hero-fade-up, .hero-fade-in, .hero-spin-slow, .hero-spin-slower,
  .hero-float, .hero-bounce, .hero-glow { animation: none !important; }
}
`;

const focusItems = [
  { label: "Our Focus", value: "Website Development" },
  { label: "Our Expertise", value: "Application Development" },
  { label: "Our Approach", value: "Design-led · Performance-first" },
];

const capabilities = ["Websites", "Mobile Apps", "UI / UX", "Web Platforms"];

export default function HomeHero() {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate flex min-h-[720px] items-center overflow-hidden bg-[#191D27] lg:min-h-[calc(100svh-76px)]"
    >
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />

      {/* Background Image (optimised, LCP-friendly) */}
      <Image
        src="/hero-bg/home-hero.jpeg"
        alt=""
        fill
        priority
        quality={80}
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* Dark Cinematic Overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#191D27] via-[#191D27]/90 to-[#191D27]/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#191D27] via-transparent to-[#191D27]/35" />

      {/* Vignette for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(25,29,39,0.7)_100%)]" />

      {/* Grid Background with soft fade-out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />

      {/* Bronze Ambient Glows */}
      <div className="hero-glow pointer-events-none absolute -right-32 top-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-[#B58A62] blur-[140px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[320px] w-[320px] rounded-full bg-[#B58A62]/10 blur-[130px]" />

      <div className="mx-auto w-full max-w-[1500px] px-5 pb-32 pt-24 sm:px-8 lg:px-12 lg:pb-36 lg:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT CONTENT */}
          <div className="relative z-10 max-w-[720px]">
            {/* Eyebrow */}
            <div
              className="hero-fade-up mb-7 flex items-center gap-3"
              style={{ ["--d" as string]: "0ms" }}
            >
              <span className="h-px w-10 bg-gradient-to-r from-[#B58A62] to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#D2AD8D] sm:text-[11px]">
                Digital Solutions · Built Around You
              </span>
            </div>

            {/* Heading */}
            <h1
              id="home-hero-heading"
              className="hero-fade-up font-heading text-[clamp(2.8rem,5.7vw,5.4rem)] font-semibold leading-[0.99] tracking-[-0.065em] text-[#F4F1EA]"
              style={{ ["--d" as string]: "120ms" }}
            >
              Turning bold
              <br />
              ideas into
              <br />
              <span className="bg-gradient-to-r from-[#B58A62] via-[#E3C3A3] to-[#B58A62] bg-clip-text text-transparent">
                digital reality.
              </span>
            </h1>

            {/* Description */}
            <p
              className="hero-fade-up mt-7 max-w-[520px] text-[14px] leading-[1.85] text-[#F4F1EA]/75 sm:text-[16px]"
              style={{ ["--d" as string]: "260ms" }}
            >
              We design and develop websites and mobile applications that bring
              ideas to life, support business goals and create meaningful
              digital experiences.
            </p>

            {/* Capability chips */}
            <ul
              className="hero-fade-up mt-6 flex flex-wrap gap-2"
              style={{ ["--d" as string]: "340ms" }}
              aria-label="What we build"
            >
              {capabilities.map((item) => (
                <li
                  key={item}
                  className="border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/75 backdrop-blur-sm transition-colors duration-300 hover:border-[#B58A62]/60 hover:text-[#D2AD8D]"
                >
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div
              className="hero-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ ["--d" as string]: "420ms" }}
            >
              <Link
                href="/contact"
                className="group inline-flex min-h-[52px] items-center gap-6 bg-[#B58A62] px-7 py-4 text-[12px] font-semibold tracking-wide text-[#191D27] shadow-[0_10px_40px_-10px_rgba(181,138,98,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2AD8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191D27]"
              >
                Start a Project
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                >
                  ↗
                </span>
              </Link>

              <Link
                href="/services"
                className="group inline-flex min-h-[52px] items-center gap-6 border border-white/25 bg-white/[0.03] px-7 py-4 text-[12px] font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#B58A62] hover:text-[#D2AD8D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2AD8D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191D27]"
              >
                Explore Services
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                >
                  ↗
                </span>
              </Link>
            </div>

            {/* Trust Details */}
            <dl
              className="hero-fade-up mt-12 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-white/15 pt-6 sm:grid-cols-3"
              style={{ ["--d" as string]: "520ms" }}
            >
              {focusItems.map((item, i) => (
                <div
                  key={item.label}
                  className={
                    i > 0 ? "sm:border-l sm:border-white/15 sm:pl-8" : ""
                  }
                >
                  <dt className="text-[10px] uppercase tracking-[1.8px] text-white/45">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-[13px] font-medium text-white/90">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT VISUAL */}
          <div
            aria-hidden="true"
            className="hero-fade-in relative mx-auto hidden aspect-square w-full max-w-[490px] items-center justify-center lg:flex"
            style={{ ["--d" as string]: "300ms" }}
          >
            {/* Orbital Circles */}
            <div className="hero-spin-slow absolute h-[390px] w-[390px] rounded-full border border-[#B58A62]/25">
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B58A62] shadow-[0_0_18px_#B58A62]" />
            </div>

            <div className="absolute h-[310px] w-[310px] rounded-full border border-white/10" />

            <div className="hero-spin-slower absolute h-[230px] w-[230px] rounded-full border border-dashed border-[#B58A62]/35">
              <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#D2AD8D] shadow-[0_0_14px_#D2AD8D]" />
            </div>

            {/* Central Visual */}
            <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full border border-[#B58A62]/35 bg-[#191D27]/80 shadow-[0_0_100px_rgba(181,138,98,0.2)] backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-[3px] text-[#D2AD8D]">
                  Alfa Solution
                </span>

                <div className="relative mt-4 h-16 w-16">
                  <Image
                    src="/icon.png"
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>

                <p className="mt-3 text-[9px] uppercase tracking-[2px] text-white/50">
                  Digital Studio
                </p>
              </div>
            </div>

            {/* Floating Label 1 */}
            <div
              className="hero-float absolute right-0 top-[17%] border border-white/15 bg-[#191D27]/85 px-5 py-4 shadow-xl backdrop-blur-md"
              style={{ ["--d" as string]: "0ms" }}
            >
              <span className="text-[9px] uppercase tracking-[2px] text-[#B58A62]">
                01 / Web
              </span>
              <p className="mt-2 text-xs font-medium text-white">
                Website Development
              </p>
            </div>

            {/* Floating Label 2 */}
            <div
              className="hero-float absolute bottom-[18%] left-0 border border-white/15 bg-[#191D27]/85 px-5 py-4 shadow-xl backdrop-blur-md"
              style={{ ["--d" as string]: "-3s" }}
            >
              <span className="text-[9px] uppercase tracking-[2px] text-[#B58A62]">
                02 / Apps
              </span>
              <p className="mt-2 text-xs font-medium text-white">
                Application Development
              </p>
            </div>

            {/* Decorative Points */}
            <span className="absolute left-[19%] top-[25%] h-2 w-2 rounded-full bg-[#B58A62] shadow-[0_0_15px_#B58A62]" />
            <span className="absolute right-[25%] top-[8%] text-xs text-[#B58A62]">
              ∞
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-[1500px] items-center justify-between border-t border-white/15 px-5 py-5 sm:px-8 lg:px-12">
        <p className="text-[9px] uppercase tracking-[2px] text-white/50 sm:text-[10px]">
          Thoughtful work. Meaningful outcomes.
        </p>

        <a
          href="#services"
          className="group flex items-center gap-3 text-[9px] font-medium uppercase tracking-[1.8px] text-white/65 transition-colors hover:text-[#D2AD8D] focus-visible:text-[#D2AD8D] focus-visible:outline-none sm:text-[10px]"
        >
          Scroll to explore
          <span
            aria-hidden="true"
            className="hero-bounce inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm transition-colors group-hover:border-[#B58A62]"
          >
            ↓
          </span>
        </a>
      </div>
    </section>
  );
}