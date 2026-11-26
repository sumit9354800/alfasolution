// Simple content collections edited inline in the admin (team, testimonials, FAQs, pricing).
// One definition drives both the form and server-side validation.

export type CollectionField = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "image"
    | "url"
    | "number"
    | "boolean"
    | "lines"
    | "select";
  required?: boolean;
  max?: number;
  options?: { value: string; label: string }[];
  hint?: string;
  wide?: boolean;
};

export type Collection = {
  key: "team" | "testimonials" | "faqs" | "pricing";
  table: string;
  title: string;
  singular: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  fields: CollectionField[];
};

export const COLLECTIONS: Record<Collection["key"], Collection> = {
  team: {
    key: "team",
    table: "team_members",
    title: "Team members",
    singular: "team member",
    description: "People shown on the Team page.",
    titleField: "name",
    subtitleField: "role",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 120 },
      { name: "role", label: "Role", type: "text", required: true, max: 120 },
      {
        name: "bio",
        label: "Short bio",
        type: "textarea",
        max: 800,
        wide: true,
      },
      { name: "photo", label: "Photo", type: "image", wide: true },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url", max: 500 },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "is_published", label: "Show on website", type: "boolean" },
    ],
  },
  testimonials: {
    key: "testimonials",
    table: "testimonials",
    title: "Testimonials",
    singular: "testimonial",
    description:
      "Client quotes on the homepage. Only publish real reviews you have permission to use.",
    titleField: "author_name",
    subtitleField: "company",
    fields: [
      {
        name: "author_name",
        label: "Client name",
        type: "text",
        required: true,
        max: 120,
      },
      { name: "author_role", label: "Role", type: "text", max: 120 },
      { name: "company", label: "Company", type: "text", max: 160 },
      { name: "rating", label: "Rating (1–5)", type: "number" },
      {
        name: "quote",
        label: "Quote",
        type: "textarea",
        required: true,
        max: 1200,
        wide: true,
      },
      { name: "avatar", label: "Photo", type: "image", wide: true },
      {
        name: "source",
        label: "Where this review came from",
        type: "select",
        options: [
          { value: "direct", label: "Direct (email, WhatsApp, in person)" },
          { value: "google", label: "Google review" },
        ],
        hint: "Choose Google only for reviews posted on your Google Business Profile — they show the Google logo.",
      },
      {
        name: "source_url",
        label: "Link to the Google review",
        type: "url",
        max: 500,
        hint: "Optional. Shown as “View on Google”.",
      },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "is_published", label: "Show on website", type: "boolean" },
    ],
  },
  faqs: {
    key: "faqs",
    table: "faqs",
    title: "FAQs",
    singular: "question",
    description:
      "Questions on the FAQ page and homepage. Questions in the “Payments” category also appear on the pricing page.",
    titleField: "question",
    subtitleField: "category",
    fields: [
      {
        name: "question",
        label: "Question",
        type: "text",
        required: true,
        max: 300,
        wide: true,
      },
      {
        name: "answer",
        label: "Answer",
        type: "textarea",
        required: true,
        max: 3000,
        wide: true,
      },
      {
        name: "category",
        label: "Category",
        type: "text",
        required: true,
        max: 80,
        hint: "e.g. General, Process, Payments, Support",
      },
      { name: "sort_order", label: "Order", type: "number" },
      { name: "is_published", label: "Show on website", type: "boolean" },
    ],
  },
  pricing: {
    key: "pricing",
    table: "pricing_packages",
    title: "Pricing packages",
    singular: "package",
    description:
      "Packages on the pricing page. Purchasable packages with a price can be bought online.",
    titleField: "name",
    subtitleField: "category",
    fields: [
      {
        name: "name",
        label: "Package name",
        type: "text",
        required: true,
        max: 120,
      },
      {
        name: "slug",
        label: "Slug",
        type: "text",
        required: true,
        max: 160,
        hint: "Used in the checkout URL.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "website", label: "Website" },
          { value: "application", label: "Application" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "price",
        label: "Price (₹, excl. tax)",
        type: "number",
        hint: "Leave empty for “custom quote”.",
      },
      {
        name: "tagline",
        label: "Tagline",
        type: "textarea",
        max: 400,
        wide: true,
      },
      {
        name: "price_note",
        label: "Price note",
        type: "text",
        max: 160,
        hint: "e.g. one-time, excl. GST",
      },
      {
        name: "advance_percent",
        label: "Advance %",
        type: "number",
        hint: "For “pay advance” at checkout (10–100).",
      },
      {
        name: "features",
        label: "Included features",
        type: "lines",
        wide: true,
      },
      { name: "sort_order", label: "Order", type: "number" },
      {
        name: "is_featured",
        label: "Highlight as most chosen",
        type: "boolean",
      },
      {
        name: "is_purchasable",
        label: "Allow online purchase",
        type: "boolean",
      },
      { name: "is_published", label: "Show on website", type: "boolean" },
    ],
  },
};
