import { contactSchema } from "@/lib/validations/contact";
import { verifyCaptchaToken } from "@/lib/captcha";
import { createEnquiry } from "@/server/repos/crm";
import { execute } from "@/server/db";
import { notifyTeam } from "@/server/mail";
import { rateLimit } from "@/server/security/rate-limit";
import { ipFromHeaders, isSameOrigin, jsonError } from "@/server/security/request";

const MAX_BODY = 16_000;

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return jsonError("Request blocked.", 403);
    if (!(request.headers.get("content-type") ?? "").includes("application/json")) return jsonError("Invalid request format.", 415);

    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY) return jsonError("Request is too large.", 413);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonError("Invalid request.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return jsonError("Invalid request.", 400);

    // Honeypot: pretend success for bots.
    const website = (body as Record<string, unknown>).website;
    if (typeof website === "string" && website.trim() !== "") return Response.json({ success: true });

    const ip = ipFromHeaders(request.headers);
    if (!(await rateLimit(`contact:${ip}`, 5, 600))) {
      return jsonError("Too many messages from your connection. Please try again in a few minutes.", 429);
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Check the form and try again.", 400, {
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const data = parsed.data;

    if (!verifyCaptchaToken(data.captchaToken, data.captchaAnswer)) {
      return jsonError("The verification code is wrong or expired. Try the new code.", 400, {
        errors: { captchaAnswer: ["That code didn’t match. Try the new one."] },
      });
    }

    const id = await createEnquiry({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service: data.service,
      budget: data.budget || null,
      message: data.message,
      source: data.source || "contact",
      ip,
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 255),
    });
    // Link to an existing client record if we already know this email.
    await execute("UPDATE enquiries e JOIN clients c ON c.email = e.email SET e.client_id = c.id WHERE e.id = ?", [id]);

    void notifyTeam(
      `New enquiry — ${data.name} (${data.service})`,
      [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone || "Not provided"],
        ["Company", data.company || "—"],
        ["Service", data.service],
        ["Budget", data.budget || "—"],
        ["Message", data.message],
      ],
      data.email
    );

    return Response.json({ success: true, message: "Your enquiry has been sent." });
  } catch (error) {
    console.error("[contact] failed", error);
    return jsonError("Something went wrong on our side. Please try again or email us directly.", 500);
  }
}
