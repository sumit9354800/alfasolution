import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

/**
 * File storage on the local disk (works on XAMPP and Hostinger).
 *   <STORAGE_DIR>/public/...   images served at /media/...
 *   <STORAGE_DIR>/private/...  CVs and other files, only reachable through
 *                              authenticated admin routes.
 * File type is decided by the file's actual bytes, never by its name or the
 * browser-supplied MIME type.
 */

type Kind = { mime: string; ext: string };

const IMAGE_SIGNATURES: { kind: Kind; test: (b: Buffer) => boolean }[] = [
  { kind: { mime: "image/jpeg", ext: "jpg" }, test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { kind: { mime: "image/png", ext: "png" }, test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { kind: { mime: "image/gif", ext: "gif" }, test: (b) => b.subarray(0, 6).toString("ascii") === "GIF89a" || b.subarray(0, 6).toString("ascii") === "GIF87a" },
  { kind: { mime: "image/webp", ext: "webp" }, test: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
  { kind: { mime: "image/avif", ext: "avif" }, test: (b) => b.subarray(4, 8).toString("ascii") === "ftyp" && /avi[fs]/.test(b.subarray(8, 12).toString("ascii")) },
];

const DOCUMENT_SIGNATURES: { kind: Kind; test: (b: Buffer, name: string) => boolean }[] = [
  { kind: { mime: "application/pdf", ext: "pdf" }, test: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-" },
  {
    kind: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" },
    test: (b, name) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04 && /\.docx$/i.test(name) && b.includes(Buffer.from("word/")),
  },
  {
    kind: { mime: "application/msword", ext: "doc" },
    test: (b, name) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) && /\.doc$/i.test(name),
  },
];

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {}

export function detectImage(buffer: Buffer): Kind | null {
  return IMAGE_SIGNATURES.find((s) => s.test(buffer))?.kind ?? null;
}

export function detectDocument(buffer: Buffer, name: string): Kind | null {
  return DOCUMENT_SIGNATURES.find((s) => s.test(buffer, name))?.kind ?? null;
}

function datedFolder() {
  const now = new Date();
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function writeInto(area: "public" | "private", folder: string, ext: string, buffer: Buffer) {
  const relative = `${folder}/${datedFolder()}/${randomBytes(12).toString("hex")}.${ext}`;
  const absolute = resolveInside(area, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer, { flag: "wx", mode: 0o640 });
  return relative;
}

/** Resolves a stored relative path and refuses anything that escapes the storage area. */
export function resolveInside(area: "public" | "private", relative: string) {
  const base = path.join(env.storageDir, area);
  const absolute = path.resolve(base, relative);
  if (!absolute.startsWith(base + path.sep)) throw new UploadError("Invalid file path.");
  return absolute;
}

export async function saveImage(file: File) {
  if (file.size === 0) throw new UploadError("The file is empty.");
  if (file.size > IMAGE_MAX_BYTES) throw new UploadError("Images must be 5 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectImage(buffer);
  if (!kind) throw new UploadError("Upload a JPG, PNG, WebP, AVIF or GIF image.");
  const relative = await writeInto("public", "images", kind.ext, buffer);
  return { url: `/media/${relative}`, path: relative, mime: kind.mime, size: buffer.length };
}

export async function saveResume(file: File) {
  if (file.size === 0) throw new UploadError("The CV file is empty.");
  if (file.size > RESUME_MAX_BYTES) throw new UploadError("Your CV must be 5 MB or smaller.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectDocument(buffer, file.name);
  if (!kind) throw new UploadError("Upload your CV as a PDF, DOC or DOCX file.");
  const relative = await writeInto("private", "resumes", kind.ext, buffer);
  return { path: relative, mime: kind.mime, size: buffer.length, ext: kind.ext };
}

export async function readStored(area: "public" | "private", relative: string) {
  const absolute = resolveInside(area, relative);
  const info = await stat(absolute);
  if (!info.isFile()) throw new UploadError("Not a file.");
  return { buffer: await readFile(absolute), size: info.size, modified: info.mtime };
}

export function mimeForExtension(ext: string) {
  const all = [...IMAGE_SIGNATURES.map((s) => s.kind), ...DOCUMENT_SIGNATURES.map((s) => s.kind)];
  return all.find((kind) => kind.ext === ext.toLowerCase())?.mime ?? "application/octet-stream";
}

export function safeDownloadName(name: string) {
  return name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
}
