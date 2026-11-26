"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { cleanAgainst, getGroup, type FieldDef } from "@/lib/content-schema";
import { adminAction, UserFacingError, ValidationError } from "@/server/admin-action";
import { logActivity } from "@/server/audit";
import { refreshPublicSite } from "@/server/revalidate";
import { sanitizeRichText } from "@/server/security/sanitize";
import { getRawSetting, saveSetting } from "@/server/settings";

function sanitizeRich(fields: FieldDef[], value: Record<string, unknown>) {
  for (const field of fields) if (field.type === "richtext") value[field.name] = sanitizeRichText(String(value[field.name] ?? ""));
}

export async function saveSettingsGroup(key: string, state: ActionState, form: FormData): Promise<ActionState> {
  const group = getGroup(key);
  if (!group) return { status: "error", message: "Unknown settings group.", at: Date.now() };
  return adminAction(group.permission, async (user) => {
    let payload: unknown;
    try {
      payload = JSON.parse(String(form.get("payload") ?? "{}"));
    } catch {
      throw new UserFacingError("The form data was invalid. Reload the page and try again.");
    }
    const { value, errors } = cleanAgainst(group.fields, payload);
    if (Object.keys(errors).length) throw new ValidationError(errors);
    sanitizeRich(group.fields, value);
    const existing = await getRawSetting(key);
    await saveSetting(key, { ...existing, ...value });
    await logActivity(user.id, "update", "settings", key, `Updated ${group.title}`);
    refreshPublicSite();
    revalidatePath(`/admin/content/${key}`);
    return { status: "success", message: `${group.title} saved. Changes are live on the website.`, at: Date.now() };
  });
}
