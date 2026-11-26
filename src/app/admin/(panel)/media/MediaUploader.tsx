"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

export function MediaUploader() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(files: FileList) {
    setBusy(true);
    setMessage("");
    let ok = 0;
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (response.ok) ok += 1;
      else setMessage(`${file.name}: ${data.message ?? "upload failed"}`);
    }
    setBusy(false);
    if (ok) router.refresh();
  }
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong px-6 py-10 text-center hover:border-ink">
        <Upload size={22} className="text-slate" aria-hidden="true" />
        <span className="font-semibold">{busy ? "Uploading…" : "Choose images to upload"}</span>
        <span className="text-sm text-slate">You can select several files at once.</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.length && upload(e.target.files)} />
      </label>
      {message ? <p role="alert" className="mt-3 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
