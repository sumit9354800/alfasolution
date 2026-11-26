"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

type NavLink = { label: string; href: string };

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
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
            {active ? (
              <span className="mx-auto mt-0.5 block h-[2px] w-4 rounded bg-accent" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({
  links,
  ctaLabel,
  ctaHref,
}: {
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(72);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isActive = useIsActive();

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  function toggle() {
    // Open the panel right under the header, wherever it currently is (banner shown or not).
    const header = buttonRef.current?.closest("header");
    if (header) setTop(Math.max(0, header.getBoundingClientRect().bottom));
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The header uses backdrop-blur, which traps `position: fixed` children inside it.
  // Rendering the panel into <body> lets it cover the screen properly.
  const panel = (
    <div
      id="mobile-menu"
      className="fixed inset-x-0 bottom-0 z-[60] overflow-y-auto border-t border-line bg-white lg:hidden"
      style={{ top }}
    >
      <nav aria-label="Mobile" className="container-site flex flex-col py-4">
        {[{ label: "Home", href: "/" }, ...links].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={`border-b border-line py-4 font-display text-2xl tracking-tight ${isActive(link.href) ? "text-accent" : "text-ink"}`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={ctaHref}
          onClick={() => setOpen(false)}
          className="btn btn-dark mt-6"
        >
          {ctaLabel}
        </Link>
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="mt-4 text-center text-sm text-slate"
        >
          Or email us — we reply within one working day
        </Link>
      </nav>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? createPortal(panel, document.body) : null}
    </div>
  );
}
