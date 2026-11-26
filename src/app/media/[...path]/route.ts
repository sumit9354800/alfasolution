import path from "node:path";
import { mimeForExtension, readStored } from "@/server/storage";

/** Serves uploaded images from STORAGE_DIR/public. Private files are never reachable here. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const relative = segments.join("/");
  if (!/^images\/\d{4}\/\d{2}\/[a-f0-9]{24}\.(jpg|png|gif|webp|avif)$/.test(relative)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const file = await readStored("public", relative);
    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": mimeForExtension(path.extname(relative).slice(1)),
        "Content-Length": String(file.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
