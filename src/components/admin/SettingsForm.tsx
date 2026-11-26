"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { FieldDef } from "@/lib/content-schema";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, SubmitButton } from "./form";
import { RichTextEditor } from "./RichTextEditor";

type Value = Record<string, unknown>;

function emptyItem(fields: FieldDef[]): Value {
  return Object.fromEntries(fields.map((f) => [f.name, f.type === "list" || f.type === "strings" ? [] : f.type === "boolean" ? false : ""]));
}

function FieldInput({ field, value, onChange, path, errors }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; path: string; errors: Record<string, string> }) {
  const id = `s-${path}`;
  const error = errors[path];
  const label = (
    <label htmlFor={id} className="field-label">
      {field.label}
    </label>
  );
  const hint = error ? <p className="field-error">{error}</p> : field.help ? <p className="field-hint">{field.help}</p> : null;

  switch (field.type) {
    case "boolean":
      return (
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--color-ink)]" />
          {field.label}
        </label>
      );
    case "textarea":
      return (
        <div>{label}<textarea id={id} rows={field.max && field.max > 400 ? 5 : 3} value={String(value ?? "")} maxLength={field.max} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} className="input !min-h-0" />{hint}</div>
      );
    case "strings":
      return (
        <div>{label}<textarea id={id} rows={4} value={(Array.isArray(value) ? value : []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} className="input !min-h-0" />{hint ?? <p className="field-hint">One per line.</p>}</div>
      );
    case "richtext":
      return <RichTextEditor label={field.label} defaultValue={String(value ?? "")} onChange={onChange} minHeight={260} />;
    case "number":
      return (
        <div>{label}<input id={id} type="number" step="0.01" value={String(value ?? "")} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} aria-invalid={Boolean(error)} className="input" />{hint}</div>
      );
    case "list": {
      const items = (Array.isArray(value) ? value : []) as Value[];
      const fields = field.fields ?? [];
      const set = (next: Value[]) => onChange(next);
      return (
        <fieldset>
          <legend className="field-label">{field.label}</legend>
          <ol className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="rounded-lg border border-line bg-paper/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate">{(field.itemLabel ?? "item").replace(/^./, (c) => c.toUpperCase())} {index + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" disabled={index === 0} onClick={() => { const n = [...items]; [n[index - 1], n[index]] = [n[index], n[index - 1]]; set(n); }} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label="Move up"><ArrowUp size={14} /></button>
                    <button type="button" disabled={index === items.length - 1} onClick={() => { const n = [...items]; [n[index + 1], n[index]] = [n[index], n[index + 1]]; set(n); }} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label="Move down"><ArrowDown size={14} /></button>
                    <button type="button" onClick={() => set(items.filter((_, i) => i !== index))} className="rounded p-1.5 text-slate hover:bg-white hover:text-danger" aria-label={`Remove ${field.itemLabel ?? "item"}`}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {fields.map((sub) => (
                    <div key={sub.name} className={sub.type === "textarea" || sub.type === "list" ? "sm:col-span-2" : ""}>
                      <FieldInput field={sub} value={item[sub.name]} path={`${path}.${index}.${sub.name}`} errors={errors} onChange={(v) => set(items.map((it, i) => (i === index ? { ...it, [sub.name]: v } : it)))} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => set([...items, emptyItem(fields)])} className="btn btn-outline btn-sm mt-3">
            <Plus size={14} /> Add {field.itemLabel ?? "item"}
          </button>
        </fieldset>
      );
    }
    default:
      return (
        <div>{label}<input id={id} value={String(value ?? "")} maxLength={field.max} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} className="input" placeholder={field.type === "url" || field.type === "image" ? "/page or https://…" : undefined} />{hint}</div>
      );
  }
}

/** Form generated from field definitions; submits the whole value as JSON. */
export function SettingsForm({ fields, initial, action }: { fields: FieldDef[]; initial: Value; action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [value, setValue] = useState<Value>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <ActionForm
      action={async (state, form) => {
        const result = await action(state, form);
        setErrors(result.errors ?? {});
        return result;
      }}
      className="space-y-6"
    >
      <div className="space-y-6 rounded-xl border border-line bg-white p-5 sm:p-6">
        {fields.map((field) => (
          <FieldInput key={field.name} field={field} value={value[field.name]} path={field.name} errors={errors} onChange={(v) => setValue((prev) => ({ ...prev, [field.name]: v }))} />
        ))}
      </div>
      <input type="hidden" name="payload" value={JSON.stringify(value)} />
      <div className="sticky bottom-4 flex justify-end">
        <SubmitButton className="shadow-lg">Save changes</SubmitButton>
      </div>
    </ActionForm>
  );
}
