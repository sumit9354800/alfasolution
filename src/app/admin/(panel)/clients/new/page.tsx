import { requirePageAccess } from "@/server/auth/guard";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { Card, PageHeader } from "@/components/admin/ui";
import { createClient } from "../actions";
import { ClientFields } from "../ClientFields";

export default async function NewClientPage() {
  await requirePageAccess("clients.manage");
  return (
    <>
      <PageHeader back={{ href: "/admin/clients", label: "Clients" }} title="Add client" />
      <Card>
        <ActionForm action={createClient} className="space-y-6">
          <ClientFields />
          <SubmitButton>Add client</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
