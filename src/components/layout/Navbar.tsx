/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/work" },
  { label: "Facilities", href: "/facilities" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#191D27]/10 bg-[#F4F1EA]/95 backdrop-blur-xl">
        {/* Top Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B58A62] to-transparent" />

        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* Logo */}
          <Link
            href="/"
            aria-label="Alfa Solution Home"
            className="group relative z-50 block h-[46px] w-[145px] shrink-0 sm:w-[165px]"
          >
            <Image
              src="/images/logo-black.png"
              alt="Alfa Solution"
              fill
              priority
              sizes="(max-width: 640px) 145px, 165px"
              className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link, index) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-2 px-4 py-3 text-[12px] font-medium transition-colors duration-300 ${
                    active
                      ? "text-[#8D6749]"
                      : "text-[#191D27]/75 hover:text-[#191D27]"
                  }`}
                >

                  {link.label}

                  {/* Active / Hover Underline */}
                  <span
                    className={`absolute bottom-[3px] left-4 h-[2px] bg-[#B58A62] transition-all duration-300 ${
                      active
                        ? "w-[calc(100%-32px)]"
                        : "w-0 group-hover:w-[calc(100%-32px)]"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center lg:flex">
            <Link
              href="/contact"
              className="group relative flex items-center gap-4 overflow-hidden bg-[#191D27] px-5 py-3.5 text-[11px] font-semibold tracking-wide text-white transition-all duration-300 hover:bg-[#8D6749]"
            >
              <span className="relative z-10">Start a Project</span>

              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[6px] border border-[#191D27]/15 transition-colors duration-300 hover:border-[#B58A62] lg:hidden"
          >
            <span
              className={`h-[1.5px] w-5 bg-[#191D27] transition-all duration-300 ${
                menuOpen ? "translate-y-[3.75px] rotate-45" : ""
              }`}
            />

            <span
              className={`h-[1.5px] w-5 bg-[#191D27] transition-all duration-300 ${
                menuOpen ? "scale-0 opacity-0" : ""
              }`}
            />

            <span
              className={`h-[1.5px] w-5 bg-[#191D27] transition-all duration-300 ${
                menuOpen ? "-translate-y-[3.75px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#191D27]/40 transition-opacity duration-300 lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Panel */}
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-0 top-[78px] z-40 overflow-y-auto border-b border-[#191D27]/10 bg-[#F4F1EA] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          menuOpen
            ? "visible max-h-[calc(100dvh-78px)] translate-y-0 opacity-100"
            : "invisible max-h-0 -translate-y-3 opacity-0"
        }`}
      >
        <div className="px-6 pb-8 pt-5 sm:px-8">
          {/* Mobile Label */}
          <div className="mb-5 flex items-center justify-between border-b border-[#191D27]/15 pb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8D6749]">
              Navigation
            </span>

            <span className="text-[10px] tracking-wider text-[#191D27]/40">
              ALFA SOLUTION
            </span>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col">
            {navLinks.map((link, index) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    transitionDelay: menuOpen
                      ? `${index * 60}ms`
                      : "0ms",
                  }}
                  className={`group flex items-center justify-between border-b border-[#191D27]/10 py-5 transition-all duration-300 ${
                    menuOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={`text-[10px] tracking-widest ${
                        active ? "text-[#8D6749]" : "text-[#191D27]/35"
                      }`}
                    >
                      0{index + 1}
                    </span>

                    <span
                      className={`text-xl font-semibold tracking-tight transition-colors ${
                        active
                          ? "text-[#8D6749]"
                          : "text-[#191D27] group-hover:text-[#8D6749]"
                      }`}
                    >
                      {link.label}
                    </span>
                  </div>

                  <span
                    className={`text-lg transition-all duration-300 ${
                      active
                        ? "translate-x-0 text-[#8D6749]"
                        : "-translate-x-2 text-[#191D27]/30 group-hover:translate-x-0 group-hover:text-[#8D6749]"
                    }`}
                  >
                    ↗
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile CTA */}
          <Link
            href="/contact"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            className="mt-7 flex items-center justify-between bg-[#191D27] px-6 py-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#8D6749]"
          >
            <span>Start a Project</span>
            <span className="text-lg">↗</span>
          </Link>

          {/* Bottom Text */}
          <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#191D27]/40">
            Digital ideas. Thoughtful execution.
          </p>
        </div>
      </div>
    </>
  );
}
