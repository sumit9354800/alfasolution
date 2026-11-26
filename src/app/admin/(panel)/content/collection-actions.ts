"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/format";
import { adminAction, bool, lines, str, ValidationError } from "@/server/admin-action";
import { execute } from "@/server/db";
import { logActivity } from "@/server/audit";
import { refreshPublicSite } from "@/server/revalidate";
import { COLLECTIONS, type Collection } from "./collections";

function parse(collection: Collection, form: FormData) {
  const errors: Record<string, string> = {};
  const row: Record<string, string | number | null> = {};
  for (const field of collection.fields) {
    const raw = str(form, field.name);
    switch (field.type) {
      case "boolean":
        row[field.name] = bool(form, field.name) ? 1 : 0;
        break;
      case "number": {
        if (raw === "") row[field.name] = field.name === "sort_order" ? 0 : field.name === "advance_percent" ? 50 : null;
        else if (!Number.isFinite(Number(raw)) || Number(raw) < 0) errors[field.name] = "Enter a positive number.";
        else row[field.name] = Number(raw);
        break;
      }
      case "lines":
        row[field.name] = JSON.stringify(lines(form, field.name));
        break;
      case "select":
        if (!field.options?.some((o) => o.value === raw)) errors[field.name] = "Choose an option.";
        row[field.name] = raw;
        break;
      default:
        if (field.required && !raw) errors[field.name] = `Enter ${field.label.toLowerCase()}.`;
        if (field.max && raw.length > field.max) errors[field.name] = `Keep this under ${field.max} characters.`;
        if ((field.type === "url" || field.type === "image") && raw && !/^(\/(?!\/)|https?:\/\/)/.test(raw)) errors[field.name] = "Enter a path or a full https:// URL.";
        row[field.name] = raw || null;
    }
  }
  if (collection.key === "testimonials" && row.rating != null && (Number(row.rating) < 1 || Number(row.rating) > 5)) errors.rating = "Use a rating from 1 to 5.";
  if (collection.key === "pricing") {
    row.slug = slugify(String(row.slug || row.name || ""));
    if (!row.slug) errors.slug = "Enter a slug.";
    if (row.advance_percent != null && (Number(row.advance_percent) < 10 || Number(row.advance_percent) > 100)) errors.advance_percent = "Use 10–100.";
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return row;
}

function collectionFor(key: string) {
  if (!Object.hasOwn(COLLECTIONS, key)) throw new Error("Unknown collection");
  return COLLECTIONS[key as Collection["key"]];
}

export async function saveCollectionItem(key: Collection["key"], id: number | null, _: ActionState, form: FormData) {
  const collection = collectionFor(key);
  return adminAction("content.manage", async (user) => {
    const row = parse(collection, form);
    const columns = Object.keys(row);
    // Column names come from the fixed definitions above, never from the request.
    if (id) {
      await execute(`UPDATE ${collection.table} SET ${columns.map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`, [...Object.values(row), id]);
    } else {
      await execute(`INSERT INTO ${collection.table} (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`, Object.values(row));
    }
    await logActivity(user.id, id ? "update" : "create", collection.key, id, `${id ? "Updated" : "Added"} ${collection.singular} “${row[collection.titleField]}”`);
    refreshPublicSite();
    revalidatePath(`/admin/content/${collection.key}`);
    return { status: "success", message: id ? "Saved." : `${collection.singular[0].toUpperCase()}${collection.singular.slice(1)} added.`, at: Date.now() };
  });
}

export async function deleteCollectionItem(key: Collection["key"], id: number, _: ActionState, _form: FormData) {
  const collection = collectionFor(key);
  return adminAction("content.manage", async (user) => {
    await execute(`DELETE FROM ${collection.table} WHERE id = ?`, [id]);
    await logActivity(user.id, "delete", collection.key, id, `Deleted ${collection.singular} #${id}`);
    refreshPublicSite();
    revalidatePath(`/admin/content/${collection.key}`);
    return { status: "success", message: "Deleted.", at: Date.now() };
  });
}
