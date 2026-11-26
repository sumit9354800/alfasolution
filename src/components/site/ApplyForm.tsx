"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { CaptchaField, useCaptcha } from "./ContactForm";

type Errors = Partial<Record<string, string[]>>;

export function ApplyForm({ jobId, jobTitle }: { jobId?: number; jobTitle?: string }) {
  const { captcha, failed, reload } = useCaptcha();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = new FormData(event.currentTarget);
    const resume = form.get("resume");
    if (!(resume instanceof File) || resume.size === 0) {
      setErrors({ resume: ["Attach your CV as a PDF, DOC or DOCX file."] });
      return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      setErrors({ resume: ["Your CV must be 5 MB or smaller."] });
      return;
    }
    if (!captcha) {
      setMessage("The verification code didn’t load. Select the refresh button and try again.");
      return;
    }
    form.set("captchaToken", captcha.token);
    form.set("captchaAnswer", String(form.get("captchaAnswer") ?? "").trim().toUpperCase());
    if (jobId) form.set("jobId", String(jobId));

    setState("sending");
    setMessage("");
    setErrors({});
    try {
      const response = await fetch("/api/careers/apply", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "We couldn’t submit your application. Check the form and try again.");
        setState("idle");
        void reload();
        return;
      }
      setState("sent");
      formRef.current?.reset();
    } catch {
      setMessage("We couldn’t reach the server. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-line bg-paper p-8">
        <CheckCircle2 className="text-success" size={28} aria-hidden="true" />
        <h3 className="mt-4 text-2xl">Application received</h3>
        <p className="mt-2 text-slate">
          Thanks for applying{jobTitle ? ` for ${jobTitle}` : ""}. We review every application and will contact you if your profile matches the role.
        </p>
      </div>
    );
  }

  const err = (key: string) => errors[key]?.[0];
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> & { optional?: boolean } = {}) => {
    const { optional, ...rest } = props;
    return (
      <div>
        <label htmlFor={name} className="field-label">
          {label} {optional ? <span className="font-normal text-slate">(optional)</span> : null}
        </label>
        <input id={name} name={name} className="input" aria-invalid={Boolean(err(name))} {...rest} />
        {err(name) ? <p className="field-error">{err(name)}</p> : null}
      </div>
    );
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate encType="multipart/form-data" className="grid gap-5 sm:grid-cols-2">
      {field("fullName", "Full name", { required: true, autoComplete: "name" })}
      {field("email", "Email", { required: true, type: "email", autoComplete: "email" })}
      {field("phone", "Phone", { required: true, type: "tel", autoComplete: "tel" })}
      {field("experienceYears", "Years of experience", { optional: true, type: "number", min: 0, max: 50, step: 0.5, inputMode: "decimal" })}
      {field("linkedinUrl", "LinkedIn profile", { optional: true, type: "url", placeholder: "https://linkedin.com/in/…" })}
      {field("portfolioUrl", "Portfolio or GitHub", { optional: true, type: "url", placeholder: "https://…" })}
      {field("noticePeriod", "Notice period", { optional: true, placeholder: "e.g. 30 days" })}

      <div>
        <span className="field-label" id="resume-label">CV / résumé</span>
        <label className={`input flex cursor-pointer items-center gap-2 ${err("resume") ? "!border-danger" : ""}`}>
          <FileText size={16} className="shrink-0 text-slate" aria-hidden="true" />
          <span className={`truncate ${fileName ? "text-ink" : "text-mist"}`}>{fileName || "Choose a PDF, DOC or DOCX (max 5 MB)"}</span>
          <input
            name="resume"
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-labelledby="resume-label"
            className="sr-only"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          />
        </label>
        {err("resume") ? <p className="field-error">{err("resume")}</p> : null}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="coverLetter" className="field-label">
          Why this role? <span className="font-normal text-slate">(optional)</span>
        </label>
        <textarea id="coverLetter" name="coverLetter" rows={5} maxLength={4000} className="input" placeholder="A few lines about you and a project you’re proud of." />
        {err("coverLetter") ? <p className="field-error">{err("coverLetter")}</p> : null}
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="sm:col-span-2">
        <CaptchaField captcha={captcha} failed={failed} reload={reload} error={err("captchaAnswer")} />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
        <span>
          I agree that Alfa Solution may store my application to assess it for current and future roles, as described in the{" "}
          <a href="/privacy-policy" className="link">privacy policy</a>.
        </span>
      </label>
      {err("consent") ? <p className="field-error sm:col-span-2">{err("consent")}</p> : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn btn-primary">
          {state === "sending" ? "Submitting…" : "Submit application"}
        </button>
      </div>
      {message ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger sm:col-span-2">
          {message}
        </p>
      ) : null}
    </form>
  );
}
