import { applicationSchema } from "@/lib/validations/contact";
import { verifyCaptchaToken } from "@/lib/captcha";
import { execute, queryOne } from "@/server/db";
import { notifyTeam } from "@/server/mail";
import { rateLimit } from "@/server/security/rate-limit";
import { ipFromHeaders, isSameOrigin, jsonError } from "@/server/security/request";
import { RESUME_MAX_BYTES, UploadError, saveResume } from "@/server/storage";
import { env } from "@/server/env";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return jsonError("Request blocked.", 403);
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > RESUME_MAX_BYTES + 200_000) return jsonError("Your CV must be 5 MB or smaller.", 413, { errors: { resume: ["Your CV must be 5 MB or smaller."] } });

    const ip = ipFromHeaders(request.headers);
    if (!(await rateLimit(`apply:${ip}`, 5, 3600))) return jsonError("Too many applications from your connection. Please try again later.", 429);

    const form = await request.formData();
    if (String(form.get("website") ?? "") !== "") return Response.json({ success: true });

    const parsed = applicationSchema.safeParse({
      jobId: form.get("jobId") || undefined,
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      linkedinUrl: form.get("linkedinUrl") ?? "",
      portfolioUrl: form.get("portfolioUrl") ?? "",
      experienceYears: form.get("experienceYears") ?? "",
      noticePeriod: form.get("noticePeriod") ?? "",
      coverLetter: form.get("coverLetter") ?? "",
      consent: form.get("consent") ?? "",
    });
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Check the form and try again.", 400, { errors: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data;

    if (!verifyCaptchaToken(String(form.get("captchaToken") ?? ""), String(form.get("captchaAnswer") ?? ""))) {
      return jsonError("The verification code is wrong or expired.", 400, { errors: { captchaAnswer: ["That code didn’t match. Try the new one."] } });
    }

    let jobTitle = "General application";
    if (data.jobId) {
      const job = await queryOne<{ title: string }>(
        "SELECT title FROM job_openings WHERE id = ? AND status = 'open' AND (closes_at IS NULL OR closes_at >= UTC_DATE())",
        [data.jobId]
      );
      if (!job) return jsonError("This role is no longer accepting applications.", 410);
      jobTitle = job.title;
    }

    const resume = form.get("resume");
    if (!(resume instanceof File)) return jsonError("Attach your CV.", 400, { errors: { resume: ["Attach your CV as a PDF, DOC or DOCX file."] } });
    let stored;
    try {
      stored = await saveResume(resume);
    } catch (error) {
      if (error instanceof UploadError) return jsonError(error.message, 400, { errors: { resume: [error.message] } });
      throw error;
    }

    const originalName = resume.name.replace(/[^\w.\- ]+/g, "_").slice(0, 200) || `resume.${stored.ext}`;
    const result = await execute(
      `INSERT INTO job_applications (job_id, full_name, email, phone, linkedin_url, portfolio_url, experience_years, notice_period, cover_letter,
         resume_path, resume_original_name, resume_mime, resume_size, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.jobId ?? null,
        data.fullName,
        data.email,
        data.phone,
        data.linkedinUrl || null,
        data.portfolioUrl || null,
        data.experienceYears === "" ? null : data.experienceYears,
        data.noticePeriod || null,
        data.coverLetter || null,
        stored.path,
        originalName,
        stored.mime,
        stored.size,
        ip,
      ]
    );

    void notifyTeam(`New application — ${jobTitle}: ${data.fullName}`, [
      ["Role", jobTitle],
      ["Name", data.fullName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Review", `${env.siteUrl}/admin/careers/applications/${result.insertId}`],
    ], data.email);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[careers/apply] failed", error);
    return jsonError("Something went wrong on our side. Please try again.", 500);
  }
}
