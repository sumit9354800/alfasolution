
import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Website Design & Development",
    description:
      "Modern, responsive and high-performing websites designed to strengthen your digital presence and support business growth.",
    tags: ["Web Design", "Development", "Responsive"],
  },
  {
    number: "02",
    title: "UI/UX Design",
    description:
      "Thoughtful digital interfaces and user experiences that make products easier to use, understand and navigate.",
    tags: ["User Research", "Interface Design", "Prototyping"],
  },
  {
    number: "03",
    title: "E-commerce Solutions",
    description:
      "Flexible online stores designed to create smooth shopping experiences and simplify the buying journey.",
    tags: ["Online Stores", "Shopping Experience", "Integration"],
  },
  {
    number: "04",
    title: "Digital Strategy",
    description:
      "Clear digital direction that connects your business goals with the right creative and technology decisions.",
    tags: ["Planning", "Consulting", "Strategy"],
  },
  {
    number: "05",
    title: "Mobile App Development",
    description:
      "Functional and intuitive mobile applications built around your users, business requirements and ideas.",
    tags: ["iOS", "Android", "Applications"],
  },
  {
    number: "06",
    title: "Digital Solutions",
    description:
      "Purpose-built digital tools and technology solutions that help businesses improve their everyday operations.",
    tags: ["Automation", "Technology", "Integration"],
  },
];

export default function HomeServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#F4F1EA] py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="mb-12 grid gap-7 border-b border-[#191D27]/15 pb-8 lg:mb-16 lg:grid-cols-[1fr_0.65fr] lg:items-end">

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-7 bg-[#B58A62]" />
              <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                What We Do
              </span>
            </div>

            <h2 className="max-w-[650px] font-heading text-[clamp(2.2rem,4.5vw,3.8rem)] font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27]">
              Digital solutions for{" "}
              <span className="text-[#B58A62]">what comes next.</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[390px] text-[12px] leading-[1.9] text-[#777A80] sm:text-[13px]">
              From the first idea to the final product, we bring together
              creative thinking, technology and strategy to build meaningful
              digital experiences.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-px overflow-hidden border border-[#191D27]/10 bg-[#191D27]/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="group relative flex min-h-[290px] flex-col bg-white p-6 transition-colors duration-300 hover:bg-[#191D27] sm:p-7 lg:p-8"
            >
              <div className="flex items-start justify-between">
                <span className="font-heading text-[13px] font-semibold text-[#B58A62]">
                  / {service.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center border border-[#191D27]/15 text-[#191D27] transition-all duration-300 group-hover:rotate-45 group-hover:border-[#B58A62] group-hover:text-[#B58A62]">
                  ↗
                </span>
              </div>

              <div className="mt-10 flex-1">
                <h3 className="max-w-[280px] font-heading text-[19px] font-semibold leading-[1.35] tracking-[-0.6px] text-[#191D27] transition-colors duration-300 group-hover:text-[#F4F1EA] sm:text-[21px]">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-[330px] text-[11px] leading-[1.9] text-[#777A80] transition-colors duration-300 group-hover:text-white/55 sm:text-[12px]">
                  {service.description}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#191D27]/10 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.8px] text-[#777A80] transition-colors duration-300 group-hover:border-white/15 group-hover:text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#B58A62] transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[400px] text-[12px] leading-7 text-[#777A80]">
            Have a specific requirement? Let&apos;s find the right solution for it.
          </p>

          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-4 border-b border-[#B58A62] pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#191D27] transition-colors hover:text-[#B58A62]"
          >
            Discuss Your Project
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}