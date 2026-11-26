import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/server/settings";
import { listServices } from "@/server/repos/content";

export async function SiteFooter() {
  const [nav, general, services] = await Promise.all([
    getSetting("site.navigation"),
    getSetting("site.general"),
    listServices().catch(() => []),
  ]);
  const socials = general.socials.filter((s) => s.href);
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
                  <a href={`mailto:${general.email}`} className="text-white hover:text-accent-light">
                    {general.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {general.phone ? (
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>
                  <a href={`tel:${general.phone.replace(/\s+/g, "")}`} className="text-white hover:text-accent-light">
                    {general.phone}
                  </a>
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
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold tracking-normal text-white/45">Services</h2>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            {services.slice(0, 6).map((service) => (
              <li key={service.id}>
                <Link href={`/services/${service.slug}`} className="text-white/80 hover:text-white">
                  {service.title}
                </Link>
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
                  <Link href={link.href} className="text-white/80 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {general.companyName}. All rights reserved.
          </p>
          {socials.length ? (
            <ul className="flex flex-wrap gap-5">
              {socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
