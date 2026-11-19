
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";
import { verifyCaptchaToken } from "@/lib/captcha";

// Rate limiter: 5 requests per 10 minutes per IP.
const requests = new Map<
  string,
  { count: number; resetAt: number }
>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_SIZE = 16_000;

function isRateLimited(ip: string) {
  const now = Date.now();
  const record = requests.get(ip);

  if (!record || now > record.resetAt) {
    requests.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return false;
  }

  if (record.count >= MAX_REQUESTS) {
    return true;
  }

  record.count += 1;
  return false;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request: Request) {
  try {
    // Content type validation
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid request format." },
        { status: 415 }
      );
    }

    // Request size validation
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request is too large." },
        { status: 413 }
      );
    }

    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request is too large." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const submitted = body as Record<string, unknown>;

    // Honeypot: return fake success to automated spam submissions.
    if (
      typeof submitted.website === "string" &&
      submitted.website.trim() !== ""
    ) {
      return NextResponse.json({ success: true });
    }

    // IP rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Zod validation
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];

      return NextResponse.json(
        {
          success: false,
          message: firstError?.message || "Invalid form information.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      service,
      message,
      captchaToken,
      captchaAnswer,
    } = validation.data;

    // Server-side CAPTCHA verification
    const captchaValid = verifyCaptchaToken(
      captchaToken,
      captchaAnswer
    );

    if (!captchaValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code is incorrect or expired. Please try again.",
        },
        { status: 400 }
      );
    }

    // Resend environment validation
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      console.error("Missing Resend environment variables.");

      return NextResponse.json(
        {
          success: false,
          message: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `New Project Enquiry — ${name}`,
      text: `
New Project Enquiry

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Service: ${service}

Project Details:
${message}
      `,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#191D27;">
          <div style="background:#191D27;padding:25px;color:#ffffff;">
            <h2 style="margin:0;">New Project Enquiry</h2>
            <p style="margin:8px 0 0;color:#B58A62;">Alfa Solution</p>
          </div>

          <div style="padding:25px;border:1px solid #eeeeee;">
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Interested In:</strong> ${safeService}</p>

            <hr style="border:none;border-top:1px solid #eeeeee;margin:25px 0;" />

            <h3>Project Details</h3>
            <p style="line-height:1.7;">${safeMessage}</p>
          </div>
        </div>
      `,
    });

    if (error || !data?.id) {
      console.error("RESEND EMAIL ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to send your enquiry. Please try again.",
        },
        { status: 502 }
      );
    }

    console.info("RESEND EMAIL ACCEPTED:", data.id);

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
