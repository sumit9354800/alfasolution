"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { BUDGETS } from "@/lib/validations/contact";

type Captcha = { token: string; svg: string };
type Errors = Partial<Record<string, string[]>>;

async function fetchCaptcha(): Promise<Captcha> {
  const response = await fetch("/api/captcha?fg=191D27&bg=F4F5F7", { cache: "no-store" });
  if (!response.ok) throw new Error("captcha");
  return response.json();
}

export function useCaptcha() {
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [failed, setFailed] = useState(false);
  const apply = useCallback((promise: Promise<Captcha>) => {
    promise.then(
      (next) => {
        setCaptcha(next);
        setFailed(false);
      },
      () => {
        setCaptcha(null);
        setFailed(true);
      }
    );
  }, []);
  useEffect(() => {
    apply(fetchCaptcha());
  }, [apply]);
  const reload = useCallback(() => apply(fetchCaptcha()), [apply]);
  return { captcha, failed, reload };
}

export function CaptchaField({ captcha, failed, reload, error }: { captcha: Captcha | null; failed: boolean; reload: () => void; error?: string }) {
  return (
    <div>
      <label htmlFor="captchaAnswer" className="field-label">
        Type the characters you see
      </label>
      <div className="flex items-center gap-3">
        <div className="flex h-[50px] w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-line bg-paper">
          {captcha ? (
            <span aria-hidden="true" className="[&>svg]:h-[50px] [&>svg]:w-[160px]" dangerouslySetInnerHTML={{ __html: captcha.svg }} />
          ) : (
            <span className="text-xs text-slate">{failed ? "Couldn’t load code" : "Loading…"}</span>
          )}
        </div>
        <button type="button" onClick={reload} className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] border border-line-strong text-slate hover:text-ink" aria-label="Show a new code">
          <RefreshCw size={16} />
        </button>
        <input id="captchaAnswer" name="captchaAnswer" required maxLength={5} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="input max-w-[140px] uppercase tracking-[0.3em]" aria-invalid={Boolean(error)} />
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function ContactForm({ services, defaultService, source = "contact" }: { services: string[]; defaultService?: string; source?: string }) {
  const { captcha, failed, reload } = useCaptcha();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const options = [...new Set([...services, "Other"])];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    if (!captcha) {
      setMessage("The verification code didn’t load. Select the refresh button and try again.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company: String(form.get("company") ?? ""),
      service: String(form.get("service") ?? ""),
      budget: String(form.get("budget") ?? ""),
      message: String(form.get("message") ?? ""),
      source,
      captchaToken: captcha.token,
      captchaAnswer: String(form.get("captchaAnswer") ?? "").trim().toUpperCase(),
      website: String(form.get("website") ?? ""),
    };
    setState("sending");
    setMessage("");
    setErrors({});
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setErrors(data.errors ?? {});
        setMessage(data.message ?? "We couldn’t send your message. Check the form and try again.");
        setState("idle");
        void reload();
        return;
      }
      setState("sent");
    } catch {
      setMessage("We couldn’t reach the server. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-line bg-paper p-8">
        <CheckCircle2 className="text-success" size={28} aria-hidden="true" />
        <h3 className="mt-4 text-2xl">Message sent</h3>
        <p className="mt-2 text-slate">Thanks — we’ve received your enquiry and will reply within one working day.</p>
      </div>
    );
  }

  const err = (key: string) => errors[key]?.[0];

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="field-label">Your name</label>
        <input id="name" name="name" required autoComplete="name" className="input" aria-invalid={Boolean(err("name"))} />
        {err("name") ? <p className="field-error">{err("name")}</p> : null}
      </div>
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" aria-invalid={Boolean(err("email"))} />
        {err("email") ? <p className="field-error">{err("email")}</p> : null}
      </div>
      <div>
        <label htmlFor="phone" className="field-label">Phone <span className="font-normal text-slate">(optional)</span></label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className="input" aria-invalid={Boolean(err("phone"))} />
        {err("phone") ? <p className="field-error">{err("phone")}</p> : null}
      </div>
      <div>
        <label htmlFor="company" className="field-label">Company <span className="font-normal text-slate">(optional)</span></label>
        <input id="company" name="company" autoComplete="organization" className="input" />
      </div>
      <div>
        <label htmlFor="service" className="field-label">What do you need?</label>
        <select id="service" name="service" required defaultValue={defaultService ?? ""} className="input" aria-invalid={Boolean(err("service"))}>
          <option value="" disabled>Choose a service</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {err("service") ? <p className="field-error">{err("service")}</p> : null}
      </div>
      <div>
        <label htmlFor="budget" className="field-label">Budget <span className="font-normal text-slate">(optional)</span></label>
        <select id="budget" name="budget" defaultValue="" className="input">
          <option value="">Prefer not to say</option>
          {BUDGETS.map((budget) => (
            <option key={budget} value={budget}>{budget}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="field-label">Project details</label>
        <textarea id="message" name="message" required rows={6} maxLength={3000} placeholder="What are you building, who is it for, and when do you need it?" className="input" aria-invalid={Boolean(err("message"))} />
        {err("message") ? <p className="field-error">{err("message")}</p> : null}
      </div>
      {/* Honeypot: hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="sm:col-span-2">
        <CaptchaField captcha={captcha} failed={failed} reload={reload} error={err("captchaAnswer")} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate">
          We use your details only to reply. See our <a href="/privacy-policy" className="link">privacy policy</a>.
        </p>
        <button type="submit" disabled={state === "sending"} className="btn btn-primary">
          {state === "sending" ? "Sending…" : "Send enquiry"}
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
