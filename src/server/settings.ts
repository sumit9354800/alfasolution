import "server-only";
import { cache } from "react";
import { execute, parseJson, query } from "./db";

export type LinkItem = { label: string; href: string };

export type GeneralSettings = {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  socials: LinkItem[];
};
export type BannerSettings = { enabled: boolean; message: string; linkLabel: string; linkHref: string };
export type HomeSettings = {
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  stats: { value: string; label: string }[];
  introTitle: string;
  introBody: string;
  process: { title: string; description: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};
export type AboutSettings = {
  headline: string;
  intro: string;
  storyTitle: string;
  story: string;
  values: { title: string; description: string }[];
  images: string[];
};
export type NavigationSettings = {
  header: LinkItem[];
  ctaLabel: string;
  ctaHref: string;
  footerColumns: { title: string; links: LinkItem[] }[];
  footerNote: string;
};
export type SeoSettings = {
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
  ogImage: string;
  pages: { page: string; title: string; description: string }[];
};
export type BillingSettings = {
  legalName: string;
  gstin: string;
  address: string;
  email: string;
  phone: string;
  taxLabel: string;
  taxRate: number;
  sacCode: string;
  invoicePrefix: string;
  paymentTermsDays: number;
  invoiceNotes: string;
  bankDetails: string;
};
export type LegalSettings = { privacyHtml: string; termsHtml: string; updatedAt: string };

type SettingsMap = {
  "site.general": GeneralSettings;
  "site.banner": BannerSettings;
  "site.home": HomeSettings;
  "site.about": AboutSettings;
  "site.navigation": NavigationSettings;
  "site.seo": SeoSettings;
  "site.legal": LegalSettings;
  billing: BillingSettings;
};

const DEFAULTS: SettingsMap = {
  "site.general": { companyName: "Alfa Solution", tagline: "", email: "", phone: "", whatsapp: "", address: "India", hours: "", socials: [] },
  "site.banner": { enabled: false, message: "", linkLabel: "", linkHref: "" },
  "site.home": {
    heroHeadline: "We design and build websites that run real businesses.",
    heroSubheadline: "",
    heroPrimaryLabel: "Start a project",
    heroPrimaryHref: "/contact",
    heroSecondaryLabel: "See our work",
    heroSecondaryHref: "/work",
    stats: [],
    introTitle: "",
    introBody: "",
    process: [],
    ctaTitle: "Have a project in mind?",
    ctaBody: "",
    ctaLabel: "Start a project",
    ctaHref: "/contact",
  },
  "site.about": { headline: "About Alfa Solution", intro: "", storyTitle: "", story: "", values: [], images: [] },
  "site.navigation": {
    header: [
      { label: "Services", href: "/services" },
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Insights", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
    ctaLabel: "Start a project",
    ctaHref: "/contact",
    footerColumns: [],
    footerNote: "",
  },
  "site.seo": { defaultTitle: "Alfa Solution", defaultDescription: "", keywords: [], ogImage: "/images/og-image.jpg", pages: [] },
  "site.legal": { privacyHtml: "", termsHtml: "", updatedAt: "" },
  billing: {
    legalName: "Alfa Solution",
    gstin: "",
    address: "",
    email: "",
    phone: "",
    taxLabel: "GST",
    taxRate: 18,
    sacCode: "",
    invoicePrefix: "ALFA",
    paymentTermsDays: 7,
    invoiceNotes: "",
    bankDetails: "",
  },
};

export type SettingKey = keyof SettingsMap;

/** All settings, loaded once per request. Falls back to defaults if the DB is unreachable. */
const loadAll = cache(async (): Promise<Record<string, unknown>> => {
  try {
    const rows = await query<{ setting_key: string; setting_value: string }>("SELECT setting_key, setting_value FROM settings");
    return Object.fromEntries(rows.map((row) => [row.setting_key, parseJson(row.setting_value, {})]));
  } catch (error) {
    console.error("[settings] could not load settings", error);
    return {};
  }
});

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingsMap[K]> {
  const all = await loadAll();
  return { ...DEFAULTS[key], ...((all[key] as object) ?? {}) } as SettingsMap[K];
}

export async function getRawSetting(key: string): Promise<Record<string, unknown>> {
  const all = await loadAll();
  return { ...((DEFAULTS as Record<string, object>)[key] ?? {}), ...((all[key] as object) ?? {}) } as Record<string, unknown>;
}

export async function saveSetting(key: string, value: unknown) {
  await execute(
    "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    [key, JSON.stringify(value)]
  );
}
