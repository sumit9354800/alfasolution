import Link from "next/link";
import { ContactFrom } from "./ContactForm";

const contactPoints = [
  {
    number: "01",
    title: "Website Development",
    description: "Business websites, custom websites and e-commerce solutions.",
  },
  {
    number: "02",
    title: "Application Development",
    description: "Mobile applications designed around your business needs.",
  },
  {
    number: "03",
    title: "Custom Requirements",
    description: "Have a different idea? Tell us what you are planning.",
  },
];

export default function ContactSection() {
  return (
    <section className="bg-[#F4F1EA] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left Content */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8D6749]">
              Let&apos;s Work Together
            </span>

            <h2 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight text-[#191D27] sm:text-5xl">
              Tell us about your
              <span className="text-[#8D6749]"> next project.</span>
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-[#686A70] sm:text-base">
              Whether you need a website or a mobile application, share your
              ideas with us. Let&apos;s explore how we can turn your vision into
              a digital solution.
            </p>

            <div className="mt-12 border-t border-[#191D27]/15">
              {contactPoints.map((item) => (
                <div
                  key={item.number}
                  className="grid grid-cols-[42px_1fr] gap-4 border-b border-[#191D27]/15 py-6"
                >
                  <span className="text-xs font-semibold tracking-wider text-[#8D6749]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="text-base font-semibold text-[#191D27]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#77777A]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/services"
              className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#191D27] transition-colors hover:text-[#8D6749]"
            >
              Explore our services
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {/* Right Form */}
          <div className="border border-[#191D27]/10 bg-white p-6 shadow-sm sm:p-9 lg:p-11">
            <div className="mb-9">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8D6749]">
                Project Enquiry
              </span>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#191D27] sm:text-3xl">
                Let&apos;s start a conversation.
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#77777A]">
                Fill in the details below and tell us a little about your
                project.
              </p>
            </div>

            <ContactFrom />
          </div>
        </div>
      </div>
    </section>
  );
}
