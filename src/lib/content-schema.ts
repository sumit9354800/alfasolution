// Field definitions for every editable site-settings group.
// The admin renders forms from these, and the server validates submissions
// against the same definitions — one source of truth for both.

export type FieldType = "text" | "textarea" | "url" | "image" | "boolean" | "number" | "strings" | "list" | "richtext";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  max?: number;
  fields?: FieldDef[]; // for "list"
  itemLabel?: string; // for "list"
};

export type SettingsGroup = {
  key: string;
  title: string;
  description: string;
  permission: "content.manage" | "settings.manage";
  fields: FieldDef[];
};

const link: FieldDef[] = [
  { name: "label", label: "Label", type: "text", max: 60 },
  { name: "href", label: "Link", type: "url", help: "A page path like /contact or a full URL." },
];

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    key: "site.home",
    title: "Homepage",
    description: "Hero, figures, introduction, process and closing call to action.",
    permission: "content.manage",
    fields: [
      { name: "heroHeadline", label: "Hero headline", type: "textarea", max: 140 },
      { name: "heroSubheadline", label: "Hero supporting text", type: "textarea", max: 400 },
      { name: "heroPrimaryLabel", label: "Primary button label", type: "text", max: 40 },
      { name: "heroPrimaryHref", label: "Primary button link", type: "url" },
      { name: "heroSecondaryLabel", label: "Secondary button label", type: "text", max: 40 },
      { name: "heroSecondaryHref", label: "Secondary button link", type: "url" },
      {
        name: "stats",
        label: "Key figures",
        type: "list",
        itemLabel: "figure",
        fields: [
          { name: "value", label: "Value", type: "text", max: 12 },
          { name: "label", label: "Label", type: "text", max: 60 },
        ],
      },
      { name: "introTitle", label: "Introduction title", type: "text", max: 140 },
      { name: "introBody", label: "Introduction text", type: "textarea", max: 800 },
      {
        name: "process",
        label: "Process steps",
        type: "list",
        itemLabel: "step",
        fields: [
          { name: "title", label: "Step", type: "text", max: 60 },
          { name: "description", label: "Description", type: "textarea", max: 300 },
        ],
      },
      { name: "ctaTitle", label: "Closing CTA title", type: "text", max: 120 },
      { name: "ctaBody", label: "Closing CTA text", type: "textarea", max: 300 },
      { name: "ctaLabel", label: "Closing CTA button", type: "text", max: 40 },
      { name: "ctaHref", label: "Closing CTA link", type: "url" },
    ],
  },
  {
    key: "site.about",
    title: "About us",
    description: "Story, values and photos on the About page.",
    permission: "content.manage",
    fields: [
      { name: "headline", label: "Headline", type: "textarea", max: 160 },
      { name: "intro", label: "Introduction", type: "textarea", max: 500 },
      { name: "storyTitle", label: "Story title", type: "text", max: 120 },
      { name: "story", label: "Story", type: "textarea", max: 3000, help: "Leave a blank line between paragraphs." },
      {
        name: "values",
        label: "Values",
        type: "list",
        itemLabel: "value",
        fields: [
          { name: "title", label: "Title", type: "text", max: 60 },
          { name: "description", label: "Description", type: "textarea", max: 300 },
        ],
      },
      { name: "images", label: "Photos", type: "strings", help: "Image URLs, one per line. Upload images in Media." },
    ],
  },
  {
    key: "site.navigation",
    title: "Navigation & footer",
    description: "Header menu, header button and footer link columns.",
    permission: "content.manage",
    fields: [
      { name: "header", label: "Header menu", type: "list", itemLabel: "link", fields: link },
      { name: "ctaLabel", label: "Header button label", type: "text", max: 40 },
      { name: "ctaHref", label: "Header button link", type: "url" },
      {
        name: "footerColumns",
        label: "Footer columns",
        type: "list",
        itemLabel: "column",
        fields: [
          { name: "title", label: "Column title", type: "text", max: 40 },
          { name: "links", label: "Links", type: "list", itemLabel: "link", fields: link },
        ],
      },
      { name: "footerNote", label: "Footer description", type: "textarea", max: 300 },
    ],
  },
  {
    key: "site.banner",
    title: "Announcement banner",
    description: "A thin bar above the header for offers or news.",
    permission: "content.manage",
    fields: [
      { name: "enabled", label: "Show the banner", type: "boolean" },
      { name: "message", label: "Message", type: "text", max: 160 },
      { name: "linkLabel", label: "Link label", type: "text", max: 40 },
      { name: "linkHref", label: "Link", type: "url" },
    ],
  },
  {
    key: "site.general",
    title: "Company & contact details",
    description: "Shown in the footer, contact page and structured data.",
    permission: "settings.manage",
    fields: [
      { name: "companyName", label: "Company name", type: "text", max: 120 },
      { name: "tagline", label: "Tagline", type: "text", max: 200 },
      { name: "email", label: "Email", type: "text", max: 191 },
      { name: "phone", label: "Phone", type: "text", max: 30 },
      { name: "whatsapp", label: "WhatsApp number", type: "text", max: 20, help: "Digits only with country code, e.g. 919315424622." },
      { name: "address", label: "Address", type: "textarea", max: 400 },
      { name: "hours", label: "Working hours", type: "text", max: 120 },
      { name: "socials", label: "Social profiles", type: "list", itemLabel: "profile", fields: link },
    ],
  },
  {
    key: "site.seo",
    title: "SEO defaults",
    description: "Default title, description, keywords and social image.",
    permission: "content.manage",
    fields: [
      { name: "defaultTitle", label: "Default page title", type: "text", max: 120 },
      { name: "defaultDescription", label: "Default meta description", type: "textarea", max: 320 },
      { name: "keywords", label: "Keywords", type: "strings", help: "One per line." },
      { name: "ogImage", label: "Social sharing image", type: "image", help: "1200 × 630 px recommended." },
      {
        name: "pages",
        label: "Page titles & descriptions",
        type: "list",
        itemLabel: "page",
        fields: [
          { name: "page", label: "Page path", type: "url", help: "For example /about" },
          { name: "title", label: "SEO title", type: "text", max: 70 },
          { name: "description", label: "Meta description", type: "textarea", max: 170 },
        ],
      },
    ],
  },
  {
    key: "billing",
    title: "Billing & invoices",
    description: "Details printed on every invoice, tax rate and numbering.",
    permission: "settings.manage",
    fields: [
      { name: "legalName", label: "Legal business name", type: "text", max: 160 },
      { name: "gstin", label: "GSTIN", type: "text", max: 20, help: "Leave empty if not GST registered." },
      { name: "address", label: "Registered address", type: "textarea", max: 400 },
      { name: "email", label: "Billing email", type: "text", max: 191 },
      { name: "phone", label: "Billing phone", type: "text", max: 30 },
      { name: "taxLabel", label: "Tax name", type: "text", max: 20 },
      { name: "taxRate", label: "Default tax rate (%)", type: "number" },
      { name: "sacCode", label: "SAC / HSN code", type: "text", max: 20 },
      { name: "invoicePrefix", label: "Invoice number prefix", type: "text", max: 10, help: "Invoices are numbered PREFIX/2026-27/0001." },
      { name: "paymentTermsDays", label: "Default payment terms (days)", type: "number" },
      { name: "invoiceNotes", label: "Invoice footer notes", type: "textarea", max: 600 },
      { name: "bankDetails", label: "Bank details for offline payment", type: "textarea", max: 600 },
    ],
  },
  {
    key: "site.legal",
    title: "Privacy & terms",
    description: "Content of the Privacy Policy and Terms & Conditions pages.",
    permission: "content.manage",
    fields: [
      { name: "privacyHtml", label: "Privacy policy", type: "richtext" },
      { name: "termsHtml", label: "Terms & conditions", type: "richtext" },
      { name: "updatedAt", label: "Last updated (YYYY-MM-DD)", type: "text", max: 10 },
    ],
  },
];

export function getGroup(key: string) {
  return SETTINGS_GROUPS.find((group) => group.key === key);
}

const SAFE_URL = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|#[^\s]*)?$/i;

/**
 * Validates and normalises a submitted value against field definitions.
 * Unknown keys are dropped. Returns errors keyed by dotted path.
 */
export function cleanAgainst(fields: FieldDef[], input: unknown, prefix = ""): { value: Record<string, unknown>; errors: Record<string, string> } {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const value: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const raw = source[field.name];
    const keyPath = prefix + field.name;
    switch (field.type) {
      case "boolean":
        value[field.name] = raw === true || raw === "true" || raw === "on";
        break;
      case "number": {
        const n = Number(raw);
        if (raw !== "" && raw != null && !Number.isFinite(n)) errors[keyPath] = "Enter a number.";
        value[field.name] = Number.isFinite(n) ? n : 0;
        break;
      }
      case "strings": {
        const list = Array.isArray(raw) ? raw : String(raw ?? "").split("\n");
        value[field.name] = list.map((s) => String(s).trim()).filter(Boolean).slice(0, 50);
        break;
      }
      case "list": {
        const items = Array.isArray(raw) ? raw.slice(0, 30) : [];
        value[field.name] = items.map((item, index) => {
          const result = cleanAgainst(field.fields ?? [], item, `${keyPath}.${index}.`);
          Object.assign(errors, result.errors);
          return result.value;
        });
        break;
      }
      case "richtext":
        value[field.name] = String(raw ?? "");
        break;
      default: {
        const text = String(raw ?? "").trim();
        const max = field.max ?? 500;
        if (text.length > max) errors[keyPath] = `Keep this under ${max} characters.`;
        if ((field.type === "url" || field.type === "image") && !SAFE_URL.test(text)) errors[keyPath] = "Enter a path like /contact or a full https:// URL.";
        value[field.name] = text.slice(0, max);
      }
    }
  }
  return { value, errors };
}
