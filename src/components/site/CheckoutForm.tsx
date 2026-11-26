"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";

type Quote = { option: "full" | "advance"; label: string; total: string; detail: string };

type Props =
  | { mode: "package"; slug: string; quotes: Quote[]; prefill?: Partial<Billing>; enabled: boolean }
  | { mode: "link"; token: string; amountLabel: string; prefill?: Partial<Billing>; enabled: boolean };

type Billing = { name: string; email: string; phone: string; company: string; gstin: string; address: string };

type OrderResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  description: string;
  reference: string;
  prefill: { name: string; email: string; contact: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (response: { error?: { description?: string } }) => void) => void };
  }
}

export function CheckoutForm(props: Props) {
  const router = useRouter();
  const [option, setOption] = useState<"full" | "advance">("full");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [scriptReady, setScriptReady] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!window.Razorpay) {
      setMessage("The payment window is still loading. Wait a moment and try again.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const billing: Billing = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company: String(form.get("company") ?? ""),
      gstin: String(form.get("gstin") ?? ""),
      address: String(form.get("address") ?? ""),
    };
    setBusy(true);
    setMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props.mode === "package" ? { type: "package", slug: props.slug, option, billing } : { type: "link", token: props.token, billing }),
      });
      const order = (await response.json().catch(() => ({}))) as OrderResponse;
      if (!response.ok || !order.success) {
        setErrors(order.errors ?? {});
        setMessage(order.message ?? "We couldn’t start the payment. Please try again.");
        setBusy(false);
        return;
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Alfa Solution",
        description: order.description,
        image: "/icon.png",
        prefill: order.prefill,
        notes: { reference: order.reference },
        theme: { color: "#191D27" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage("Payment cancelled. You haven’t been charged — you can try again whenever you’re ready.");
          },
        },
        handler: async (result: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setMessage("Confirming your payment…");
          try {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            });
            const data = await verify.json().catch(() => ({}));
            router.push(`/payment/status?ref=${encodeURIComponent(data.reference ?? order.reference)}`);
          } catch {
            // The webhook will still record the payment; the status page polls for it.
            router.push(`/payment/status?ref=${encodeURIComponent(order.reference)}`);
          }
        },
      });
      checkout.on("payment.failed", (response) => {
        setMessage(`Payment failed: ${response.error?.description ?? "your bank declined the payment"}. You can try again or use another method.`);
      });
      checkout.open();
    } catch {
      setMessage("We couldn’t reach the server. Check your connection and try again.");
      setBusy(false);
    }
  }

  const err = (key: string) => errors[key]?.[0];
  const prefill = props.prefill ?? {};
  const field = (name: keyof Billing, label: string, attrs: React.InputHTMLAttributes<HTMLInputElement> = {}, optional = false) => (
    <div>
      <label htmlFor={`bill-${name}`} className="field-label">
        {label} {optional ? <span className="font-normal text-slate">(optional)</span> : null}
      </label>
      <input id={`bill-${name}`} name={name} defaultValue={prefill[name] ?? ""} className="input" aria-invalid={Boolean(err(name))} {...attrs} />
      {err(name) ? <p className="field-error">{err(name)}</p> : null}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />

      {props.mode === "package" ? (
        <fieldset>
          <legend className="field-label">How would you like to pay?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {props.quotes.map((quote) => (
              <label
                key={quote.option}
                className={`flex cursor-pointer flex-col rounded-[var(--radius-card)] border p-5 transition-colors ${option === quote.option ? "border-ink ring-1 ring-ink" : "border-line-strong hover:border-ink"}`}
              >
                <input type="radio" name="option" value={quote.option} checked={option === quote.option} onChange={() => setOption(quote.option)} className="sr-only" />
                <span className="font-semibold">{quote.label}</span>
                <span className="mt-1 font-display text-2xl font-semibold">{quote.total}</span>
                <span className="mt-1 text-sm text-slate">{quote.detail}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Billing details</legend>
        {field("name", "Full name", { required: true, autoComplete: "name" })}
        {field("email", "Email", { required: true, type: "email", autoComplete: "email" })}
        {field("phone", "Phone", { required: true, type: "tel", autoComplete: "tel" })}
        {field("company", "Company", { autoComplete: "organization" }, true)}
        {field("gstin", "GSTIN", { maxLength: 15, className: "input uppercase" }, true)}
        <div className="sm:col-span-2">
          <label htmlFor="bill-address" className="field-label">Billing address <span className="font-normal text-slate">(optional)</span></label>
          <textarea id="bill-address" name="address" rows={3} maxLength={400} defaultValue={prefill.address ?? ""} className="input !min-h-0" />
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-slate">
          <Lock size={15} aria-hidden="true" /> Secure payment by Razorpay. By paying you accept our <a href="/terms" className="link">terms</a>.
        </p>
        <button type="submit" disabled={busy || !props.enabled || !scriptReady} className="btn btn-primary">
          {busy ? "Opening payment…" : props.mode === "package" ? `Pay ${props.quotes.find((q) => q.option === option)?.total ?? ""}` : `Pay ${props.amountLabel}`}
        </button>
      </div>
      {!props.enabled ? (
        <p role="status" className="rounded-[var(--radius-control)] bg-accent-tint px-4 py-3 text-sm text-ink">
          Online payment isn’t available right now. Please <a href="/contact" className="link">contact us</a> and we’ll send you a payment link.
        </p>
      ) : null}
      {message ? (
        <p role="alert" className="rounded-[var(--radius-control)] border border-line-strong bg-paper px-4 py-3 text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
