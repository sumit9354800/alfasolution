
import Link from "next/link";

export default function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#191D27] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Bronze Glow */}
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-[#B58A62]/10 blur-[130px]" />

      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#B58A62]" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D2AD8D]">
              Contact Alfa Solution
            </span>
          </div>

          <h1 className="mt-8 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-[76px]">
            Let&apos;s build
            <br />
            something
            <br />
            <span className="text-[#B58A62]">meaningful.</span>
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
            Every great digital experience starts with a conversation.
            Tell us what you have in mind, and let&apos;s explore what&apos;s possible.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="#contact-form"
              className="inline-flex items-center gap-4 bg-[#B58A62] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#191D27]"
            >
              Start a conversation
              <span aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center gap-4 border border-white/20 px-6 py-4 text-sm font-semibold text-white transition-colors hover:border-[#B58A62] hover:text-[#D2AD8D]"
            >
              Explore services
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-white/40">
              01 / Discuss
            </span>
            <p className="mt-3 text-sm font-medium text-white/85">
              Share your ideas
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-white/40">
              02 / Understand
            </span>
            <p className="mt-3 text-sm font-medium text-white/85">
              Define your requirements
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-white/40">
              03 / Create
            </span>
            <p className="mt-3 text-sm font-medium text-white/85">
              Move your project forward
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
