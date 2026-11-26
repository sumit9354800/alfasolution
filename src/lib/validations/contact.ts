import { z } from "zod";

export const BUDGETS = ["Under ₹25,000", "₹25,000 – ₹75,000", "₹75,000 – ₹2,00,000", "Above ₹2,00,000", "Not sure yet"] as const;

const phone = z
  .string()
  .trim()
  .max(20)
  .refine((value) => value === "" || /^\+?[0-9][0-9\s-]{6,17}$/.test(value), "Enter a valid phone number.");

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(80, "Name cannot exceed 80 characters.")
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u, "Enter a valid name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(191),
    phone,
    company: z.string().trim().max(160).optional().default(""),
    service: z.string().trim().min(2, "Choose a service.").max(160),
    budget: z.string().trim().max(80).optional().default(""),
    message: z.string().trim().min(20, "Tell us a little more — at least 20 characters.").max(3000, "Keep your message under 3000 characters."),
    source: z.string().trim().max(60).regex(/^[a-z0-9:_-]*$/i).optional().default("contact"),
    captchaToken: z.string().min(1, "Refresh the verification code.").max(2048),
    captchaAnswer: z.string().trim().regex(/^[A-Za-z0-9]{5}$/, "Enter the 5-character code."),
    website: z.string().max(0, "Invalid submission.").optional().default(""),
  })
  .strict();

export type ContactInput = z.infer<typeof contactSchema>;

export const applicationSchema = z.object({
  jobId: z.coerce.number().int().positive().optional(),
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(191),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,17}$/, "Enter a valid phone number."),
  linkedinUrl: z.union([z.literal(""), z.string().trim().url("Enter a full URL starting with https://").max(500)]).default(""),
  portfolioUrl: z.union([z.literal(""), z.string().trim().url("Enter a full URL starting with https://").max(500)]).default(""),
  experienceYears: z.union([z.literal(""), z.coerce.number().min(0).max(50)]).default(""),
  noticePeriod: z.string().trim().max(80).default(""),
  coverLetter: z.string().trim().max(4000, "Keep your note under 4000 characters.").default(""),
  consent: z.literal("on", { error: "Please agree to the privacy policy." }),
});

export const billingSchema = z.object({
  name: z.string().trim().min(2, "Enter the billing name.").max(160),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(191),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,17}$/, "Enter a valid phone number."),
  company: z.string().trim().max(160).default(""),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .max(15)
    .refine((v) => v === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v), "Enter a valid 15-character GSTIN, or leave it empty.")
    .default(""),
  address: z.string().trim().max(400).default(""),
});

export type BillingInput = z.infer<typeof billingSchema>;
