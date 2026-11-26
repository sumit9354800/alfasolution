import { requirePageAccess } from "@/server/auth/guard";
import { PageHeader } from "@/components/admin/ui";
import { createService } from "../actions";
import { ServiceForm } from "../ServiceForm";

export default async function NewServicePage() {
  await requirePageAccess("content.manage");
  return (
    <>
      <PageHeader back={{ href: "/admin/services", label: "Services" }} title="Add service" />
      <ServiceForm action={createService} submitLabel="Create service" />
    </>
  );
}
