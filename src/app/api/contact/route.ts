
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validations/contact";

// Basic in-memory rate limiter
const requests = new Map<string, { count: number; resetAt: number }>();

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

// Escape dynamic values before inserting them into HTML
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
  console.log("ALFA CONTACT API HIT");

  try {
    // 1. Check content type
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid request format." },
        { status: 415 }
      );
    }

    // 2. Check declared request size
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request is too large." },
        { status: 413 }
      );
    }

    // 3. Read and check actual request size
    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request is too large." },
        { status: 413 }
      );
    }

    // 4. Parse JSON safely
    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid form submission." },
        { status: 400 }
      );
    }

    // 5. Honeypot protection
    const formBody = body as Record<string, unknown>;

    if (
      typeof formBody.website === "string" &&
      formBody.website.trim() !== ""
    ) {
      // Return a generic success response to bots
      return NextResponse.json({
        success: true,
        message: "Your enquiry has been submitted successfully.",
      });
    }

    // 6. Basic IP rate limiting
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

    // 7. Validate form data
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your details and try again.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, service, message } = validation.data;

    // 8. Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      console.error("CONTACT EMAIL CONFIGURATION ERROR:", {
        hasApiKey: Boolean(apiKey),
        hasFromEmail: Boolean(fromEmail),
        hasToEmail: Boolean(toEmail),
      });

      return NextResponse.json(
        {
          success: false,
          message: "Email configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    // 9. Escape values for HTML email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

    // 10. Create Resend instance
    const resend = new Resend(apiKey);

    // 11. Send email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `New Project Enquiry — ${name}`,
      text: `
NEW PROJECT ENQUIRY
==============================

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Interested In: ${service}

PROJECT DETAILS:
${message}

==============================
Sent from Alfa Solution Contact Form
      `,
      html: `
        <div style="margin:0;padding:40px 15px;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#191d27;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e8e2d8;">

            <div style="padding:28px 32px;background:#191d27;">
              <p style="margin:0;color:#b58a62;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;">
                Alfa Solution
              </p>
              <h1 style="margin:14px 0 0;color:#ffffff;font-size:26px;line-height:1.3;">
                New Project Enquiry
              </h1>
              <p style="margin:8px 0 0;color:#c8c8c8;font-size:14px;">
                A new enquiry has been submitted through your website.
              </p>
            </div>

            <div style="padding:30px 32px;">
              <p style="margin:0 0 22px;color:#8d6749;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                Contact Information
              </p>

              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:13px 0;color:#777;border-bottom:1px solid #eee;width:130px;">Name</td>
                  <td style="padding:13px 0;color:#191d27;font-weight:bold;border-bottom:1px solid #eee;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:13px 0;color:#777;border-bottom:1px solid #eee;">Email</td>
                  <td style="padding:13px 0;border-bottom:1px solid #eee;">
                    <a href="mailto:${safeEmail}" style="color:#8d6749;text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:13px 0;color:#777;border-bottom:1px solid #eee;">Phone</td>
                  <td style="padding:13px 0;color:#191d27;border-bottom:1px solid #eee;">${safePhone}</td>
                </tr>
                <tr>
                  <td style="padding:13px 0;color:#777;border-bottom:1px solid #eee;">Service</td>
                  <td style="padding:13px 0;color:#191d27;font-weight:bold;border-bottom:1px solid #eee;">${safeService}</td>
                </tr>
              </table>

              <div style="margin-top:30px;">
                <p style="margin:0 0 12px;color:#8d6749;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                  Project Details
                </p>
                <div style="padding:20px;background:#f8f6f2;border-left:3px solid #b58a62;color:#333;font-size:14px;line-height:1.8;overflow-wrap:anywhere;">
                  ${safeMessage}
                </div>
              </div>

              <div style="margin-top:30px;">
                <a href="mailto:${safeEmail}" style="display:inline-block;padding:13px 22px;background:#191d27;color:#ffffff;text-decoration:none;font-size:13px;font-weight:bold;">
                  Reply to Enquiry
                </a>
              </div>
            </div>

            <div style="padding:20px 32px;background:#f8f6f2;border-top:1px solid #eee;">
              <p style="margin:0;color:#777;font-size:12px;line-height:1.7;">
                This enquiry was submitted through the Alfa Solution website contact form.
              </p>
            </div>

          </div>
        </div>
      `,
    });

    // 12. Handle Resend errors
    if (error || !data?.id) {
      console.error("RESEND EMAIL ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Email could not be sent. Please try again.",
        },
        { status: 502 }
      );
    }

    // 13. Log successful Resend acceptance
    console.log("RESEND EMAIL ACCEPTED:", data.id);

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
      emailId: data.id,
    });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
