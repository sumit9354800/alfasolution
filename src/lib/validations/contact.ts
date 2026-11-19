
import { z } from "zod";

export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(80, "Name cannot exceed 80 characters.")
      .regex(
        /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u,
        "Please enter a valid name."
      ),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long.")
      .toLowerCase(),

    phone: z
      .string()
      .trim()
      .max(10, "Phone number cannot exceed 10 digits.")
      .refine(
        (value) => value === "" || /^[6-9]\d{9}$/.test(value),
        "Please enter a valid 10-digit Indian mobile number."
      ),

    service: z.enum(
      [
        "Website Development",
        "Application Development",
        "Both",
        "Other",
      ],
      {
        error: "Please select a valid service.",
      }
    ),

    message: z
      .string()
      .trim()
      .min(20, "Please describe your project in at least 20 characters.")
      .max(3000, "Message cannot exceed 3000 characters."),

    captchaToken: z
      .string()
      .min(1, "Please refresh the verification code.")
      .max(2048, "Invalid verification token."),

    captchaAnswer: z
      .string()
      .trim()
      .length(5, "Please enter the 5-character verification code.")
      .regex(/^[A-Za-z0-9]{5}$/, "Invalid verification code."),

    website: z.string().max(0, "Invalid submission."),
  })
  .strict();

export type ContactFormData = z.infer<typeof contactSchema>;
