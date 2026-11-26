import { AuthError, requirePermission } from "@/server/auth/guard";
import { getApplication } from "@/server/repos/careers";
import { readStored, safeDownloadName } from "@/server/storage";
import { logActivity } from "@/server/audit";

/** Streams an applicant's CV to HR staff. CVs are stored outside the public folder. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("careers.manage");
    const { id } = await params;
    const application = await getApplication(Number(id));
    if (!application) return new Response("Not found", { status: 404 });
    const file = await readStored("private", application.resume_path);
    await logActivity(user.id, "download", "application", application.id, `Downloaded CV of ${application.full_name}`);
    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": application.resume_mime,
        "Content-Disposition": `attachment; filename="${safeDownloadName(application.resume_original_name)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return new Response(error.message, { status: 403 });
    console.error("[resume download] failed", error);
    return new Response("File not available", { status: 404 });
  }
}
