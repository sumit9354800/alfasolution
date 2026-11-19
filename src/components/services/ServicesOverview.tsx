
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    number: "01",
    category: "WEBSITE DEVELOPMENT",
    title: "Website Development",
    description:
      "We build fast, responsive and scalable websites that help businesses establish a strong online presence. From business websites to advanced web applications, our website development solutions are designed around your goals.",
    image: "/service/web.jpeg",
    imageAlt: "Website development and responsive web design displayed on desktop and laptop screens",
    features: [
      "Business Website Development",
      "Custom Website Development",
      "E-commerce Website Development",
      "Responsive Web Design",
      "Web Application Development",
      "Website Maintenance & Support",
    ],
    technologies: ["Next.js", "React", "JavaScript", "Tailwind CSS"],
    link: "/services/website-development",
  },
  {
    number: "02",
    category: "APP DEVELOPMENT",
    title: "App Development",
    description:
      "We develop user-focused mobile applications with reliable functionality, intuitive experiences and scalable architecture. Our app development solutions help businesses connect with customers and simplify everyday operations.",
    image: "/service/app.jpeg",
    imageAlt: "Mobile application development displayed on modern smartphone screens",
    features: [
      "Android App Development",
      "iOS App Development",
      "Cross-Platform App Development",
      "Custom Mobile Applications",
      "API Integration",
      "App Maintenance & Support",
    ],
    technologies: ["React Native", "Flutter", "JavaScript", "REST APIs"],
    link: "/services/app-development",
  },
];

export default function ServicesOverview() {
  return (
    <section
      id="our-services"
      className="bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Section Heading */}
        <div className="mb-16 grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8D6749]">
                Our Core Services
              </span>
            </div>

            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#191D27] sm:text-4xl lg:text-5xl">
              Digital solutions built around your needs.
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-[#626873] lg:justify-self-end">
            We focus on two core areas of digital development: website
            development and mobile app development. Each solution is built
            with attention to performance, usability, functionality and
            long-term scalability.
          </p>
        </div>

        {/* Service Blocks */}
        <div className="space-y-20 lg:space-y-28">
          {services.map((service, index) => (
            <article
              key={service.number}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/* Image */}
              <div
                className={`relative aspect-[5/4] overflow-hidden bg-[#F4F1EA] ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute left-5 top-5 bg-[#191D27] px-4 py-3">
                  <span className="font-heading text-lg font-semibold text-[#D0A47E]">
                    {service.number}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 border border-white/20 bg-[#191D27]/80 p-4 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    {service.category}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A17A57]">
                  {service.category}
                </p>

                <h3 className="mt-4 font-heading text-3xl font-semibold leading-tight text-[#191D27] sm:text-4xl">
                  {service.title}
                </h3>

                <p className="mt-5 text-base leading-8 text-[#626873]">
                  {service.description}
                </p>

                <div className="mt-8">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#191D27]">
                    What We Develop
                  </h4>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className="mt-1 text-[#B58A62]">↗</span>
                        <span className="text-sm leading-6 text-[#626873]">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 border-t border-[#191D27]/10 pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#191D27]">
                    Technologies
                  </h4>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="border border-[#191D27]/10 bg-[#F4F1EA] px-3 py-2 text-xs font-medium text-[#626873]"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={service.link}
                  className="mt-8 inline-flex items-center gap-3 border-b border-[#B58A62] pb-2 text-sm font-semibold text-[#191D27] transition hover:text-[#A17A57]"
                >
                  Explore {service.title}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
