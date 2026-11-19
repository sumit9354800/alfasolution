
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
      .max(20, "Phone number is too long")
      .refine(
        (value) =>
          value === "" || /^[+()\d\s.-]{7,20}$/.test(value),
        "Please enter a valid phone number"
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

    // Honeypot: real users should always leave this empty.
    website: z.string().max(0, "Invalid submission"),
  })
  .strict();

export type ContactFormData = z.infer<typeof contactSchema>;
