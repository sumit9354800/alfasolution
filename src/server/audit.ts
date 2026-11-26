import "server-only";
import { execute } from "./db";
import { getRequestMeta } from "./security/request";

/** Records an admin action in the activity log. Never throws. */
export async function logActivity(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: string | number | null,
  summary: string
) {
  try {
    const { ip } = await getRequestMeta().catch(() => ({ ip: null }));
    await execute(
      "INSERT INTO activity_log (user_id, action, entity_type, entity_id, summary, ip_address) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, action, entityType, entityId == null ? null : String(entityId), summary.slice(0, 255), ip]
    );
  } catch (error) {
    console.error("[audit] failed to write activity log", error);
  }
}
