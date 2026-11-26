import { TextArea, TextField } from "@/components/admin/form";
import type { Client } from "@/server/repos/crm";

export function ClientFields({ client }: { client?: Client | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField name="name" label="Contact name" required defaultValue={client?.name} />
      <TextField name="company" label="Company" defaultValue={client?.company} />
      <TextField name="email" label="Email" type="email" required defaultValue={client?.email} hint="Used for invoices and payment links." />
      <TextField name="phone" label="Phone" defaultValue={client?.phone} />
      <TextField name="gstin" label="GSTIN" defaultValue={client?.gstin} />
      <TextField name="country" label="Country" defaultValue={client?.country ?? "India"} />
      <TextField name="address_line1" label="Address line 1" defaultValue={client?.address_line1} className="sm:col-span-2" />
      <TextField name="address_line2" label="Address line 2" defaultValue={client?.address_line2} className="sm:col-span-2" />
      <TextField name="city" label="City" defaultValue={client?.city} />
      <TextField name="state" label="State" defaultValue={client?.state} />
      <TextField name="postal_code" label="PIN code" defaultValue={client?.postal_code} />
      <TextArea name="notes" label="Internal notes" defaultValue={client?.notes} className="sm:col-span-2" rows={3} />
    </div>
  );
}
