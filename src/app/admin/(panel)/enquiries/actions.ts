"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { adminAction, str, UserFacingError } from "@/server/admin-action";
import { execute, queryOne } from "@/server/db";
import { logActivity } from "@/server/audit";
import { ENQUIRY_STATUSES, findOrCreateClient } from "@/server/repos/crm";

export async function updateEnquiryStatus(id: number, _: ActionState, form: FormData) {
  return adminAction("enquiries.manage", async (user) => {
    const status = str(form, "status");
    if (!(status in ENQUIRY_STATUSES)) throw new UserFacingError("Choose a valid status.");
    await execute("UPDATE enquiries SET status = ? WHERE id = ?", [status, id]);
    await logActivity(user.id, "update", "enquiry", id, `Enquiry #${id} marked ${ENQUIRY_STATUSES[status as keyof typeof ENQUIRY_STATUSES]}`);
    revalidatePath(`/admin/enquiries/${id}`);
    return { status: "success", message: "Status updated.", at: Date.now() };
  });
}

export async function addEnquiryNote(id: number, _: ActionState, form: FormData) {
  return adminAction("enquiries.manage", async (user) => {
    const note = str(form, "note");
    if (note.length < 2) throw new UserFacingError("Write a note first.");
    if (note.length > 4000) throw new UserFacingError("Keep notes under 4000 characters.");
    await execute("INSERT INTO enquiry_notes (enquiry_id, user_id, note) VALUES (?, ?, ?)", [id, user.id, note]);
    revalidatePath(`/admin/enquiries/${id}`);
    return { status: "success", message: "Note added.", at: Date.now() };
  });
}

/** Turns an enquiry into a client record (or links the existing one). */
export async function convertToClient(id: number, _: ActionState, _form: FormData) {
  let clientId = 0;
  const result = await adminAction("clients.manage", async (user) => {
    const enquiry = await queryOne<{ name: string; email: string; phone: string | null; company: string | null }>("SELECT name, email, phone, company FROM enquiries WHERE id = ?", [id]);
    if (!enquiry) throw new UserFacingError("Enquiry not found.");
    clientId = await findOrCreateClient({ name: enquiry.name, email: enquiry.email, phone: enquiry.phone, company: enquiry.company });
    await execute("UPDATE enquiries SET client_id = ?, status = IF(status IN ('new','contacted'), 'qualified', status) WHERE id = ?", [clientId, id]);
    await logActivity(user.id, "convert", "enquiry", id, `Enquiry #${id} linked to client #${clientId}`);
  });
  if (result.status === "success") redirect(`/admin/clients/${clientId}`);
  return result;
}

export async function deleteEnquiry(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("enquiries.manage", async (user) => {
    await execute("DELETE FROM enquiries WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "enquiry", id, `Deleted enquiry #${id}`);
  });
  if (result.status === "success") redirect("/admin/enquiries");
  return result;
}
