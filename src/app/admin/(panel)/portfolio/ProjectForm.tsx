import type { PortfolioProject, Service } from "@/server/repos/content";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, CheckboxField, FormSection, ImageField, LinesField, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";

export function PortfolioForm({ action, project, services, submitLabel }: { action: (s: ActionState, f: FormData) => Promise<ActionState>; project?: PortfolioProject | null; services: Service[]; submitLabel: string }) {
  return (
    <ActionForm action={action} className="space-y-6">
      <FormSection title="Project">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="title" label="Title" required defaultValue={project?.title} />
          <TextField name="slug" label="URL slug" defaultValue={project?.slug} hint="Leave empty to generate. Page URL: /work/<slug>" />
          <TextField name="client_name" label="Client name" defaultValue={project?.client_name} />
          <TextField name="category" label="Category" required defaultValue={project?.category} placeholder="e.g. Business website" />
          <SelectField name="project_type" label="Type" defaultValue={project?.project_type ?? "client"} options={[{ value: "client", label: "Client project" }, { value: "independent", label: "Studio / independent project" }]} />
          <SelectField name="service_id" label="Service" placeholder="None" defaultValue={project?.service_id ?? ""} options={services.map((s) => ({ value: s.id, label: s.title }))} />
          <TextField name="year" label="Year" type="number" defaultValue={project?.year ?? ""} />
          <TextField name="role" label="Our role" defaultValue={project?.role} />
        </div>
        <TextArea name="summary" label="Summary" rows={3} required defaultValue={project?.summary} />
        <ImageField name="cover_image" label="Screenshot / cover image" defaultValue={project?.cover_image} hint="Shown before the live preview loads, and as the fallback when a site can’t be embedded." />
      </FormSection>
      <FormSection title="Live preview" description="Visitors can use the real website inside an interactive frame on desktop, tablet and mobile sizes.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="live_url" label="Live website URL" type="url" defaultValue={project?.live_url} placeholder="https://…" />
          <SelectField
            name="embed_mode"
            label="Preview mode"
            defaultValue={project?.embed_mode ?? "auto"}
            options={[
              { value: "auto", label: "Automatic — live if the site allows it" },
              { value: "iframe", label: "Always try the live site" },
              { value: "screenshot", label: "Screenshot only, with a link" },
            ]}
          />
          <TextField name="repo_url" label="Repository URL (private, not shown)" type="url" defaultValue={project?.repo_url} />
        </div>
      </FormSection>
      <FormSection title="Case study">
        <TextArea name="challenge" label="The challenge" rows={4} defaultValue={project?.challenge} />
        <TextArea name="solution" label="What we built" rows={4} defaultValue={project?.solution} />
        <TextArea name="results" label="The outcome" rows={3} defaultValue={project?.results} />
        <div className="grid gap-5 sm:grid-cols-2">
          <LinesField name="technologies" label="Technologies" defaultValue={project?.technologies} />
          <LinesField name="features" label="Key features" defaultValue={project?.features} />
        </div>
      </FormSection>
      <FormSection title="Search engines">
        <TextField name="seo_title" label="SEO title" defaultValue={project?.seo_title} />
        <TextArea name="seo_description" label="Meta description" rows={2} defaultValue={project?.seo_description} />
      </FormSection>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap gap-6">
          <CheckboxField name="is_published" label="Published" defaultChecked={project ? Boolean(project.is_published) : true} />
          <CheckboxField name="is_featured" label="Featured on homepage" defaultChecked={Boolean(project?.is_featured)} />
          <TextField name="sort_order" label="Order" type="number" min={0} defaultValue={project?.sort_order ?? 0} className="w-24" />
        </div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
