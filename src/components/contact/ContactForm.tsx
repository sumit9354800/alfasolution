/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";

type FormStatus = {
  type: "success" | "error";
  message: string;
};

type Captcha = {
  token: string;
  svg: string;
};

export function ContactFrom() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [phone, setPhone] = useState("");

  const loadCaptcha = useCallback(async () => {
    try {
      const response = await fetch("/api/captcha?fg=191D27&bg=F4F1EA", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load verification code.");
      }

      const data = await response.json();
      setCaptcha(data);
      setCaptchaAnswer("");
    } catch {
      setCaptcha(null);
      setStatus({
        type: "error",
        message: "Unable to load verification code. Please refresh.",
      });
    }
  }, []);

  useEffect(() => {
    void loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setStatus(null);

    if (!captcha) {
      setStatus({
        type: "error",
        message: "Verification code is not ready. Please refresh it.",
      });
      return;
    }

    if (captchaAnswer.trim().length !== 5) {
      setStatus({
        type: "error",
        message: "Please enter the 5-character verification code.",
      });
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setStatus({
        type: "error",
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone,
      service: String(formData.get("service") || ""),
      message: String(formData.get("message") || ""),
      captchaToken: captcha.token,
      captchaAnswer: captchaAnswer.trim().toUpperCase(),
      website: String(formData.get("website") || ""),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send your enquiry."
        );
      }

      setStatus({
        type: "success",
        message:
          "Thank you! Your enquiry has been received. We'll get back to you soon.",
      });

      form.reset();
      setPhone("");
      await loadCaptcha();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });

      await loadCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-none border-b border-[#191D27]/20 bg-transparent px-0 py-3.5 text-sm text-[#191D27] outline-none transition-colors placeholder:text-[#99999B] focus:border-[#B58A62]";

  const labelClass =
    "mb-2 block text-xs font-semibold tracking-wide text-[#191D27]";

  return (
    <div className="relative overflow-hidden border border-[#191D27]/10 bg-white p-6 sm:p-9 lg:p-10">
      <div className="absolute right-0 top-0 h-24 w-24 border-b border-l border-[#B58A62]/20" />

      <div className="relative mb-9">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8D6749]">
          Project Enquiry
        </p>

        <h2 className="max-w-lg text-2xl font-semibold leading-tight tracking-tight text-[#191D27] sm:text-3xl">
          Let&apos;s discuss your next big idea.
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-[#686A70]">
          Tell us a little about your project. Share your requirements
          and our team will get in touch with you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-7">
        {/* Honeypot */}
        <div
          className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name and Email */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>
              Your Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone and Service */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="service" className={labelClass}>
              Interested In *
            </label>
            <select
              id="service"
              name="service"
              required
              defaultValue=""
              className={`${inputClass} cursor-pointer`}
            >
              <option value="" disabled>
                Select a service
              </option>
              <option value="Website Development">
                Website Development
              </option>
              <option value="Application Development">
                Application Development
              </option>
              <option value="Both">Website & Application</option>
              <option value="Other">Other Requirements</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={labelClass}>
            Tell Us About Your Project *
          </label>
          <textarea
            id="message"
            name="message"
            required
            minLength={20}
            maxLength={3000}
            rows={5}
            placeholder="Describe your idea, requirements, goals or the type of website/application you want to build..."
            className={`${inputClass} resize-none leading-6`}
          />
          <p className="mt-2 text-right text-[10px] text-[#99999B]">
            Minimum 20 characters
          </p>
        </div>

        {/* CAPTCHA */}
        <div className="border-t border-[#191D27]/10 pt-6">
          <label className={labelClass}>Verification Code *</label>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex h-[60px] w-[190px] items-center justify-center overflow-hidden border border-[#191D27]/10 bg-[#F4F1EA]">
              {captcha ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(captcha.svg)}`}
                  alt="Verification code"
                  width={190}
                  height={60}
                  draggable={false}
                  className="h-full w-full select-none object-cover"
                />
              ) : (
                <span className="text-xs text-[#686A70]">
                  Loading...
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStatus(null);
                void loadCaptcha();
              }}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#8D6749] transition-colors hover:text-[#191D27]"
            >
              <RefreshCw size={14} />
              Generate another code
            </button>
          </div>

          <input
            type="text"
            value={captchaAnswer}
            onChange={(event) =>
              setCaptchaAnswer(
                event.target.value
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .slice(0, 5)
                  .toUpperCase()
              )
            }
            maxLength={5}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Enter the 5-character code"
            className="mt-4 w-full max-w-sm border-b border-[#191D27]/20 bg-transparent px-0 py-3.5 text-sm uppercase tracking-[0.2em] outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-[#99999B] focus:border-[#B58A62] text-black"
          />
        </div>

        {/* Status */}
        {status && (
          <div
            role="status"
            aria-live="polite"
            className={`border p-4 text-sm leading-6 ${
              status.type === "success"
                ? "border-green-700/20 bg-green-50 text-green-800"
                : "border-red-700/20 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !captcha}
          className="group flex w-full items-center justify-between bg-[#191D27] px-6 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#8D6749] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            {isSubmitting ? "Sending Your Enquiry..." : "Send Project Enquiry"}
          </span>

          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            {isSubmitting ? "..." : "↗"}
          </span>
        </button>

        <p className="text-center text-[11px] leading-5 text-[#99999B]">
          Your information will only be used to respond to your project enquiry.
        </p>
      </form>
    </div>
  );
}
