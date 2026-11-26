"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase, CreditCard, FileText, FolderKanban, History, Image as ImageIcon, Inbox, Layers, LayoutDashboard, LogOut, Menu,
  MonitorPlay, Newspaper, PanelsTopLeft, Settings, ShieldCheck, Tag, UserCheck, Users, X, ExternalLink, KeyRound,
} from "lucide-react";
import type { NavGroup } from "./nav";

const ICONS = { Briefcase, CreditCard, FileText, FolderKanban, History, Image: ImageIcon, Inbox, Layers, LayoutDashboard, MonitorPlay, Newspaper, PanelsTopLeft, Settings, ShieldCheck, Tag, UserCheck, Users };

export function Sidebar({ groups, user, logout, badges }: { groups: NavGroup[]; user: { name: string; email: string; roleLabel: string }; logout: () => Promise<void>; badges: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // The most specific matching nav item is active.
  const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));
  const activeHref = allHrefs
    .filter((href) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-xs font-medium text-white/40">{group.title}</p>
          <ul className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICONS[item.icon as keyof typeof ICONS] ?? LayoutDashboard;
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-white/10 font-semibold text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {badges[item.href] ? <span className="rounded-full bg-accent px-1.5 py-0.5 text-[0.7rem] font-semibold leading-none text-white">{badges[item.href]}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-white/50">{user.roleLabel}</p>
      </div>
      <Link href="/admin/account" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white">
        <KeyRound size={16} /> Account & password
      </Link>
      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white">
        <ExternalLink size={16} /> View website
      </a>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/5 hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="relative block h-9 w-32">
      <Image src="/images/logo-white.png" alt="Alfa Solution admin" fill sizes="128px" className="object-contain object-left" />
    </Link>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 lg:hidden">
        {brand}
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-md p-2 text-white">
          <Menu size={20} />
        </button>
      </div>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink lg:flex">
        <div className="flex h-16 items-center px-6">{brand}</div>
        {nav}
        {footer}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink">
            <div className="flex h-14 items-center justify-between px-4">
              {brand}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-2 text-white">
                <X size={20} />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      ) : null}
    </>
  );
}
