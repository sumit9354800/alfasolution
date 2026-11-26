import { requirePageAccess } from "@/server/auth/guard";
import { listMedia } from "@/server/repos/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { MediaUploader } from "./MediaUploader";
import { CopyField } from "../payments/CopyField";
import { formatDate } from "@/lib/format";

export default async function MediaPage() {
  await requirePageAccess("content.manage");
  const media = await listMedia();
  return (
    <>
      <PageHeader title="Media" description="Images uploaded for pages, posts and projects. JPG, PNG, WebP, AVIF or GIF up to 5 MB." />
      <Card className="mb-6"><MediaUploader /></Card>
      {media.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${m.path}`} alt={m.alt_text ?? ""} loading="lazy" className="aspect-[4/3] w-full bg-paper object-cover" />
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-semibold" title={m.original_name}>{m.original_name}</p>
                <p className="text-xs text-slate">{Math.round(m.size_bytes / 1024)} KB · {formatDate(m.created_at)}</p>
                <CopyField label="URL" value={`/media/${m.path}`} />
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate">No uploads yet.</p>}
    </>
  );
}
