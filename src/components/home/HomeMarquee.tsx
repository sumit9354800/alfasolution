const services = [
  "Website Development",
  "App Development",
  "E-commerce Solutions",
  "Custom Web Applications",
  "Mobile Applications",
  "Responsive Design",
  "Modern Technology",
  "Digital Experiences",
];

const marqueeStyles = `
@keyframes home-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.home-marquee-track {
  animation: home-marquee var(--marquee-duration, 45s) linear infinite;
  will-change: transform;
}
.home-marquee:hover .home-marquee-track,
.home-marquee:focus-within .home-marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .home-marquee-track { animation: none; }
  .home-marquee { overflow-x: auto; }
}
`;

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  // Services are repeated twice per group so the track is always
  // wider than the screen, even on ultra-wide displays.
  const items = [...services, ...services];

  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {items.map((service, index) => (
        <div
          key={`${service}-${index}`}
          className="group flex shrink-0 items-center gap-8 px-5 sm:gap-12 sm:px-8"
        >
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[2.2px] text-[#191D27] transition-colors duration-300 group-hover:text-[#F4F1EA] sm:text-[13px]">
            {service}
          </span>

          <span className="h-1.5 w-1.5 rotate-45 bg-[#191D27]/70 transition-all duration-300 group-hover:rotate-[225deg] group-hover:bg-[#F4F1EA]" />
        </div>
      ))}
    </div>
  );
}

export default function HomeMarquee() {
  return (
    <section
      aria-label="Our services"
      className="home-marquee relative overflow-hidden border-y border-[#191D27]/15 bg-gradient-to-r from-[#A87B54] via-[#B58A62] to-[#A87B54] py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] sm:py-6"
    >
      <style dangerouslySetInnerHTML={{ __html: marqueeStyles }} />

      {/* Screen-reader friendly list (the scrolling copy is decorative) */}
      <ul className="sr-only">
        {services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>

      {/* Soft edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#A87B54] to-transparent sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#A87B54] to-transparent sm:w-32"
      />

      {/* Two identical groups => seamless loop at translateX(-50%) */}
      <div
        aria-hidden="true"
        className="home-marquee-track flex w-max"
        style={{ ["--marquee-duration" as string]: "45s" }}
      >
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </section>
  );
}