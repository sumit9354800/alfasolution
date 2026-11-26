"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import type { ActionState } from "@/lib/action-state";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<Record<string, string>>({});
const useFieldError = (name: string) => useContext(ErrorsContext)[name];

/**
 * Wraps a server action with pending, success and error states.
 * Field components read their own validation error from context.
 */
export function ActionForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
  onSuccess,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (state: ActionState) => void;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" } as ActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (state.status === "success" && state.at !== handled.current) {
      handled.current = state.at;
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.(state);
    }
  }, [state, resetOnSuccess, onSuccess]);

  return (
    <ErrorsContext value={state.errors ?? {}}>
      <form ref={formRef} action={formAction} className={className} noValidate>
        {children}
        <FormMessage state={state} />
      </form>
    </ErrorsContext>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <p
      role={ok ? "status" : "alert"}
      key={state.at}
      className={`mt-4 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm ${ok ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"}`}
    >
      {ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
      <span>{state.message}</span>
    </p>
  );
}

export function SubmitButton({ children = "Save changes", pendingLabel = "Saving…", variant = "dark", className = "" }: { children?: ReactNode; pendingLabel?: string; variant?: "dark" | "primary" | "outline" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  const styles = {
    dark: "btn-dark",
    primary: "btn-primary",
    outline: "btn-outline",
    danger: "bg-danger text-white hover:bg-red-700",
  }[variant];
  return (
    <button type="submit" disabled={pending} className={`btn btn-sm ${styles} ${className}`}>
      {pending ? <Loader2 size={15} className="animate-spin" /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Two-step destructive button: first click asks, second click submits. */
export function ConfirmSubmit({ label = "Delete", confirmLabel = "Click again to confirm" }: { label?: string; confirmLabel?: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);
  return armed ? (
    <button type="submit" disabled={pending} className="btn btn-sm bg-danger text-white hover:bg-red-700">
      {pending ? "Working…" : confirmLabel}
    </button>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="btn btn-sm border border-red-200 bg-white text-danger hover:bg-red-50">
      {label}
    </button>
  );
}

type BaseProps = { name: string; label: string; hint?: string; className?: string; required?: boolean };

function FieldShell({ name, label, hint, className = "", required, children }: BaseProps & { children: ReactNode }) {
  const error = useFieldError(name);
  return (
    <div className={className}>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function TextField({ defaultValue, type = "text", placeholder, maxLength, ...props }: BaseProps & { defaultValue?: string | number | null; type?: string; placeholder?: string; maxLength?: number; step?: string; min?: number }) {
  const error = useFieldError(props.name);
  return (
    <FieldShell {...props}>
      <input
        id={`f-${props.name}`}
        name={props.name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        step={props.step}
        min={props.min}
        required={props.required}
        aria-invalid={Boolean(error)}
        className="input"
      />
    </FieldShell>
  );
}

export function TextArea({ defaultValue, rows = 4, placeholder, maxLength, ...props }: BaseProps & { defaultValue?: string | null; rows?: number; placeholder?: string; maxLength?: number }) {
  const error = useFieldError(props.name);
  return (
    <FieldShell {...props}>
      <textarea id={`f-${props.name}`} name={props.name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} maxLength={maxLength} aria-invalid={Boolean(error)} className="input !min-h-0" />
    </FieldShell>
  );
}

/** Edits a string list as one item per line. */
export function LinesField({ defaultValue, rows = 5, ...props }: BaseProps & { defaultValue?: string[]; rows?: number }) {
  return <TextArea {...props} rows={rows} defaultValue={(defaultValue ?? []).join("\n")} hint={props.hint ?? "One item per line."} />;
}

export function SelectField({ options, defaultValue, placeholder, ...props }: BaseProps & { options: { value: string | number; label: string }[]; defaultValue?: string | number | null; placeholder?: string }) {
  const error = useFieldError(props.name);
  return (
    <FieldShell {...props}>
      <select id={`f-${props.name}`} name={props.name} defaultValue={defaultValue ?? ""} aria-invalid={Boolean(error)} className="input">
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--color-ink)]" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? <span className="block text-sm text-slate">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Image URL field with direct upload to the media library. */
export function ImageField({ defaultValue, ...props }: BaseProps & { defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const error = useFieldError(props.name);

  async function upload(file: File) {
    setUploading(true);
    setUploadError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Upload failed.");
      setValue(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldShell {...props} hint={uploadError || props.hint || "Upload an image or paste an image URL."}>
      <div className="flex items-start gap-3">
        <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-mist" />
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 size={18} className="animate-spin" />
            </span>
          ) : null}
        </div>
        <div className="flex-1 space-y-2">
          <input id={`f-${props.name}`} name={props.name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="/media/… or https://…" aria-invalid={Boolean(error)} className="input" />
          <div className="flex gap-2">
            <label className="btn btn-outline btn-sm cursor-pointer">
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            {value ? (
              <button type="button" onClick={() => setValue("")} className="btn btn-sm text-slate hover:text-ink">
                <X size={14} /> Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </FieldShell>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate">{description}</p> : null}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}
