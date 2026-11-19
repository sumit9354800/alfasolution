
import { z } from "zod";

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(80, "Name is too long")
      .regex(
        /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u,
        "Please enter a valid name"
      ),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(254, "Email address is too long")
      .toLowerCase(),

    phone: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^[6-9]\d{9}$/.test(value),
        "Please enter a valid 10-digit Indian mobile number"
      ),

    service: z.enum([
      "Website Development",
      "Application Development",
      "Both",
      "Other",
    ]),

    message: z
      .string()
      .trim()
      .min(20, "Please describe your project in at least 20 characters")
      .max(3000, "Message cannot exceed 3000 characters"),

    // Cloudflare Turnstile CAPTCHA token
    captchaToken: z
      .string()
      .min(1, "Please complete the CAPTCHA verification")
      .max(2048, "Invalid CAPTCHA token"),

    // Honeypot protection
    website: z.string().max(0, "Invalid submission"),
  })
  .strict();

export type ContactFormData = z.infer<typeof contactSchema>;
