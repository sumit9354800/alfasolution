"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { adminAction, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute } from "@/server/db";
import { logActivity } from "@/server/audit";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the client’s name.").max(160),
  company: z.string().trim().max(160),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").max(191),
  phone: z.string().trim().max(20).refine((v) => v === "" || /^\+?[0-9][0-9\s-]{6,17}$/.test(v), "Enter a valid phone number."),
  gstin: z.string().trim().toUpperCase().max(15).refine((v) => v === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v), "Enter a valid GSTIN or leave it empty."),
  address_line1: z.string().trim().max(255),
  address_line2: z.string().trim().max(255),
  city: z.string().trim().max(120),
  state: z.string().trim().max(120),
  postal_code: z.string().trim().max(12),
  country: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(4000),
});

function parse(form: FormData) {
  const raw = Object.fromEntries([...form.entries()].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const result = schema.safeParse({ country: "India", ...raw });
  if (!result.success) throw new ValidationError(zodFieldErrors(result.error));
  const d = result.data;
  const n = (v: string) => v || null;
  return [d.name, n(d.company), d.email, n(d.phone), n(d.gstin), n(d.address_line1), n(d.address_line2), n(d.city), n(d.state), n(d.postal_code), d.country, n(d.notes)] as const;
}

export async function createClient(_: ActionState, form: FormData) {
  let id = 0;
  const result = await adminAction("clients.manage", async (user) => {
    const values = parse(form);
    const r = await execute(
      "INSERT INTO clients (name, company, email, phone, gstin, address_line1, address_line2, city, state, postal_code, country, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [...values]
    );
    id = r.insertId;
    await logActivity(user.id, "create", "client", id, `Added client ${values[0]}`);
  });
  if (result.status === "success") redirect(`/admin/clients/${id}?created=1`);
  return result;
}

export async function updateClient(id: number, _: ActionState, form: FormData) {
  return adminAction("clients.manage", async (user) => {
    const values = parse(form);
    await execute(
      "UPDATE clients SET name = ?, company = ?, email = ?, phone = ?, gstin = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, notes = ? WHERE id = ?",
      [...values, id]
    );
    await logActivity(user.id, "update", "client", id, `Updated client ${values[0]}`);
    revalidatePath(`/admin/clients/${id}`);
    return { status: "success", message: "Client saved.", at: Date.now() };
  });
}

export async function deleteClient(id: number, _: ActionState, _form: FormData) {
  const result = await adminAction("clients.manage", async (user) => {
    await execute("DELETE FROM clients WHERE id = ?", [id]);
    await logActivity(user.id, "delete", "client", id, `Deleted client #${id}`);
  });
  if (result.status === "success") redirect("/admin/clients");
  return result;
}
