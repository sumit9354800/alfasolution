
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

export default function HomeMarquee() {
  return (
    <section className="overflow-hidden border-y border-[#191D27]/10 bg-[#B58A62] py-5 sm:py-6">
      <div className="flex w-max animate-marquee">
        {[...services, ...services, ...services].map((service, index) => (
          <div
            key={`${service}-${index}`}
            className="flex shrink-0 items-center gap-8 px-5 sm:gap-12 sm:px-8"
          >
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[2px] text-[#191D27] sm:text-xs">
              {service}
            </span>

            <span className="h-1.5 w-1.5 rotate-45 border border-[#191D27]/70" />
          </div>
        ))}
      </div>
    </section>
  );
}
