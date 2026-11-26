import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { canEmbed, getProjectById, listServices } from "@/server/repos/content";
import { ActionForm, ConfirmSubmit, SubmitButton } from "@/components/admin/form";
import { Card, PageHeader } from "@/components/admin/ui";
import { LiveBrowser } from "@/components/site/LiveBrowser";
import { formatDateTime } from "@/lib/format";
import { deleteProject, recheckEmbed, updateProject } from "../actions";
import { PortfolioForm } from "../ProjectForm";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("portfolio.manage");
  const id = idParam((await params).id);
  const project = id ? await getProjectById(id) : null;
  if (!project || !id) notFound();
  const services = await listServices({ includeDrafts: true });
  return (
    <>
      <PageHeader back={{ href: "/admin/portfolio", label: "Portfolio" }} title={project.title} actions={<a href={`/work/${project.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View on site</a>} />
      {project.live_url ? (
        <Card title="Live preview" className="mb-6" actions={
          <ActionForm action={recheckEmbed.bind(null, id)}>
            <SubmitButton variant="outline" pendingLabel="Checking…">Re-check embedding</SubmitButton>
          </ActionForm>
        }>
          <p className="mb-4 text-sm text-slate">
            Embedding: <strong>{project.embed_status}</strong>{project.embed_checked_at ? ` · checked ${formatDateTime(project.embed_checked_at)}` : ""}. This is exactly what visitors see.
          </p>
          <LiveBrowser sites={[{ slug: project.slug, title: project.title, url: project.live_url, cover: project.cover_image, embeddable: canEmbed(project) }]} height={460} />
        </Card>
      ) : null}
      <PortfolioForm action={updateProject.bind(null, id)} project={project} services={services} submitLabel="Save project" />
      <ActionForm action={deleteProject.bind(null, id)} className="mt-8">
        <ConfirmSubmit label="Delete project" />
      </ActionForm>
    </>
  );
}
