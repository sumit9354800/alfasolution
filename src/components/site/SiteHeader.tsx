import Image from "next/image";
import Link from "next/link";
import { getSetting } from "@/server/settings";
import { MobileNav, NavLinks } from "./SiteNav";

export async function SiteHeader() {
  const [nav, banner] = await Promise.all([getSetting("site.navigation"), getSetting("site.banner")]);

  return (
    <>
      {banner.enabled && banner.message ? (
        <div className="bg-ink text-[0.85rem] text-white/85">
          <div className="container-site flex min-h-10 flex-wrap items-center justify-center gap-x-3 py-2 text-center">
            <span>{banner.message}</span>
            {banner.linkHref && banner.linkLabel ? (
              <Link href={banner.linkHref} className="font-semibold text-accent-light underline underline-offset-4">
                {banner.linkLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="container-site flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="Alfa Solution — home" className="relative block h-[54px] w-[164px] shrink-0">
            <Image src="/images/logo-black.png" alt="Alfa Solution" fill priority sizes="164px" className="object-contain object-left" />
          </Link>
          <NavLinks links={nav.header} />
          <div className="flex items-center gap-2">
            <Link href={nav.ctaHref || "/contact"} className="btn btn-dark btn-sm hidden sm:inline-flex">
              {nav.ctaLabel || "Start a project"}
            </Link>
            <MobileNav links={nav.header} ctaLabel={nav.ctaLabel || "Start a project"} ctaHref={nav.ctaHref || "/contact"} />
          </div>
        </div>
      </header>
    </>
  );
}
