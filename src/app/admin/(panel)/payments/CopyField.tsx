"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex gap-2">
        <input readOnly value={value} className="input text-sm" onFocus={(e) => e.currentTarget.select()} aria-label={label} />
        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0"
          onClick={async () => {
            await navigator.clipboard.writeText(value).catch(() => undefined);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
