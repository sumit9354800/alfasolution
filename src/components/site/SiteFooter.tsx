import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaFacebookF, FaGlobe, FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { getSetting } from "@/server/settings";
import { listServices } from "@/server/repos/content";

type Brand = { icon: IconType; background: string; match: (key: string) => boolean };

/** Official brand colours; the first match wins. */
const BRANDS: Brand[] = [
  {
    icon: FaInstagram,
    background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    match: (k) => k.includes("instagram"),
  },
  { icon: FaLinkedinIn, background: "#0A66C2", match: (k) => k.includes("linkedin") },
  { icon: FaFacebookF, background: "#1877F2", match: (k) => k.includes("facebook") },
  { icon: FaYoutube, background: "#FF0000", match: (k) => k.includes("youtube") },
  { icon: FaWhatsapp, background: "#25D366", match: (k) => k.includes("whatsapp") || k.includes("wa.me") },
  { icon: FaXTwitter, background: "#000000", match: (k) => k.includes("twitter") || k.includes("x.com") || k.trim().startsWith("x ") },
];

function brandFor(label: string, href: string) {
  const key = `${label} ${href}`.toLowerCase();
  return BRANDS.find((brand) => brand.match(key)) ?? { icon: FaGlobe, background: "#5D6575" };
}

export async function SiteFooter() {
  const [nav, general, services] = await Promise.all([
    getSetting("site.navigation"),
    getSetting("site.general"),
    listServices().catch(() => []),
  ]);
  // GitHub is not shown on the website.
  const socials = general.socials.filter((s) => s.href && !`${s.label} ${s.href}`.toLowerCase().includes("github"));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:py-20">
        <div className="max-w-sm">
          <Link href="/" aria-label="Alfa Solution — home" className="relative block h-[46px] w-[146px]">
            <Image src="/images/logo-white.png" alt="Alfa Solution" fill sizes="146px" className="object-contain object-left" />
          </Link>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/60">{nav.footerNote || general.tagline}</p>
          <dl className="mt-6 space-y-2 text-[0.95rem]">
            {general.email ? (
              <div>
                <dt className="sr-only">Email</dt>
                <dd>
                  <a href={`mailto:${general.email}`} className="text-white hover:text-accent-light">{general.email}</a>
                </dd>
              </div>
            ) : null}
            {general.phone ? (
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a href={`tel:${general.phone.replace(/\s+/g, "")}`} className="text-white hover:text-accent-light">{general.phone}</a>
                </dd>
              </div>
            ) : null}
            {general.address ? (
              <div>
                <dt className="sr-only">Location</dt>
                <dd className="whitespace-pre-line text-white/60">{general.address}</dd>
              </div>
            ) : null}
          </dl>

          {socials.length ? (
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Social media">
              {socials.map((social) => {
                const { icon: Icon, background } = brandFor(social.label, social.href);
                return (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Alfa Solution on ${social.label}`}
                      title={social.label}
                      style={{ background }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white ring-1 ring-white/15 transition-transform hover:-translate-y-0.5 hover:scale-105"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-normal text-white/45">Services</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {services.slice(0, 6).map((service) => (
              <li key={service.id}>
                <Link href={`/services/${service.slug}`} className="text-white/80 hover:text-white">{service.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {nav.footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="font-sans text-sm font-semibold tracking-normal text-white/45">{column.title}</h2>
            <ul className="mt-4 space-y-3 text-[0.95rem]">
              {column.links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="text-white/80 hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {general.companyName}. All rights reserved.</p>
          <p>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <span className="mx-2">·</span>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}