import { AuthError, requirePermission } from "@/server/auth/guard";
import { can } from "@/lib/rbac";
import { execute } from "@/server/db";
import { logActivity } from "@/server/audit";
import { IMAGE_MAX_BYTES, UploadError, saveImage } from "@/server/storage";
import { isSameOrigin, jsonError } from "@/server/security/request";
import { rateLimit } from "@/server/security/rate-limit";

/** Image upload for the admin (editors, blog authors, portfolio managers). */
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return jsonError("Request blocked.", 403);
    const user = await requirePermission("dashboard.view");
    if (!["content.manage", "blog.manage", "portfolio.manage"].some((p) => can(user.role, p as never))) throw new AuthError();
    if (!(await rateLimit(`upload:${user.id}`, 60, 600))) return jsonError("Too many uploads. Wait a few minutes.", 429);
    if (Number(request.headers.get("content-length") ?? 0) > IMAGE_MAX_BYTES + 100_000) return jsonError("Images must be 5 MB or smaller.", 413);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Choose an image to upload.", 400);
    const saved = await saveImage(file);
    const originalName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 200) || "image";
    const result = await execute("INSERT INTO media (path, original_name, mime_type, size_bytes, uploaded_by) VALUES (?, ?, ?, ?, ?)", [saved.path, originalName, saved.mime, saved.size, user.id]);
    await logActivity(user.id, "upload", "media", result.insertId, `Uploaded ${originalName}`);
    return Response.json({ success: true, url: saved.url, id: result.insertId });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.message, 403);
    if (error instanceof UploadError) return jsonError(error.message, 400);
    console.error("[admin/upload] failed", error);
    return jsonError("Upload failed. Please try again.", 500);
  }
}
