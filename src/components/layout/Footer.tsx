import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/work" },
  { label: "Facilities", href: "/facilities" },
  { label: "Contact", href: "/contact" },
];

const services = [
  "Website Development",
  "Web Application Development",
  "Mobile App Development",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#191D27] text-[#F4F1EA]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-[#B58A62]/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        {/* CTA */}
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 py-14 sm:py-16 lg:flex-row lg:items-end">
          <div>
            <span className="mb-5 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B58A62]">
              <span className="h-px w-8 bg-[#B58A62]" />
              Let&apos;s work together
            </span>

            <h2 className="max-w-[600px] font-[family-name:var(--font-manrope)] text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Have an idea?
              <span className="block text-[#B58A62]">Let&apos;s build it.</span>
            </h2>
          </div>

          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-5 border border-[#B58A62] px-6 py-4 text-sm font-semibold transition-all duration-300 hover:bg-[#B58A62] hover:text-white"
          >
            Start a Project
            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>

        {/* Footer Content */}
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr] lg:gap-10 lg:py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="Alfa Solution home"
              className="inline-flex"
            >
              <Image
                src="/images/logo-white.png"
                alt="Alfa Solution"
                width={160}
                height={60}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-[300px] text-sm leading-7 text-white/55">
              Alfa Solution creates modern websites and mobile applications that
              help businesses build their digital presence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#B58A62]">
              Explore
            </h3>

            <ul className="space-y-4">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-[#B58A62]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#B58A62]">
              Our Services
            </h3>

            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-sm leading-6 text-white/60 transition-colors hover:text-[#B58A62]"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#B58A62]">
              Get in Touch
            </h3>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs text-white/35">Email</p>
                <a
                  href="mailto:nishant@aplhasolution.net"
                  className="break-all text-sm text-white/65 transition-colors hover:text-[#B58A62]"
                >
                  nishant@aplhasolution.net
                </a>
              </div>
              <div>
                <p className="mb-2 text-xs text-white/35">Phone</p>
                <a
                  href="tel:+919315424622"
                  className="break-all text-sm text-white/65 transition-colors hover:text-[#B58A62]"
                >
                  +91 9315424622
                </a>
              </div>

              <div>
                <p className="mb-2 text-xs text-white/35">Location</p>
                <p className="text-sm text-white/65">India</p>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-[#B58A62] transition-colors hover:text-white"
              >
                Contact Us <span>↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col justify-between gap-5 border-t border-white/10 py-7 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">
            © 2026 Alfa Solution. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/sitemap.xml"
              className="text-xs text-white/40 transition-colors hover:text-[#B58A62]"
            >
              Sitemap
            </Link>

            <a
              href="#top"
              className="text-xs text-white/40 transition-colors hover:text-[#B58A62]"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
