"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type NavLink = { label: string; href: string };

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const isActive = useIsActive();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-[0.94rem] transition-colors ${active ? "font-semibold text-ink" : "text-slate hover:text-ink"}`}
          >
            {link.label}
            {active ? <span className="mx-auto mt-0.5 block h-[2px] w-4 rounded bg-accent" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ links, ctaLabel, ctaHref }: { links: NavLink[]; ctaLabel: string; ctaHref: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = useIsActive();

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto border-t border-line bg-white"
      >
        <nav aria-label="Mobile" className="container-site flex flex-col py-4">
          {[{ label: "Home", href: "/" }, ...links].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`border-b border-line py-4 font-display text-2xl tracking-tight ${isActive(link.href) ? "text-accent" : "text-ink"}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href={ctaHref} className="btn btn-dark mt-6">
            {ctaLabel}
          </Link>
          <Link href="/contact" className="mt-4 text-center text-sm text-slate">
            Or email us — we reply within one working day
          </Link>
        </nav>
      </div>
    </div>
  );
}
