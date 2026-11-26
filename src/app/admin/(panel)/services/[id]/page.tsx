import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { getServiceById } from "@/server/repos/content";
import { ActionForm, ConfirmSubmit } from "@/components/admin/form";
import { PageHeader } from "@/components/admin/ui";
import { deleteService, updateService } from "../actions";
import { ServiceForm } from "../ServiceForm";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("content.manage");
  const id = idParam((await params).id);
  const service = id ? await getServiceById(id) : null;
  if (!service || !id) notFound();
  return (
    <>
      <PageHeader back={{ href: "/admin/services", label: "Services" }} title={service.title} actions={<a href={`/services/${service.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View on site</a>} />
      <ServiceForm action={updateService.bind(null, id)} service={service} submitLabel="Save service" />
      <ActionForm action={deleteService.bind(null, id)} className="mt-8">
        <ConfirmSubmit label="Delete service" />
      </ActionForm>
    </>
  );
}
