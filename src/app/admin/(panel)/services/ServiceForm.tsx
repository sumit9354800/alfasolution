import type { Service } from "@/server/repos/content";
import type { ActionState } from "@/lib/action-state";
import { ActionForm, CheckboxField, FormSection, ImageField, LinesField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function ServiceForm({ action, service, submitLabel }: { action: (s: ActionState, f: FormData) => Promise<ActionState>; service?: Service | null; submitLabel: string }) {
  return (
    <ActionForm action={action} className="space-y-6">
      <FormSection title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="title" label="Title" required defaultValue={service?.title} />
          <TextField name="slug" label="URL slug" defaultValue={service?.slug} hint="Leave empty to generate from the title. Page URL: /services/<slug>" />
        </div>
        <TextArea name="short_description" label="One-line summary" rows={2} required defaultValue={service?.short_description} />
        <RichTextEditor name="description" label="Full description" defaultValue={service?.description ?? ""} minHeight={200} />
        <ImageField name="image" label="Image" defaultValue={service?.image} />
      </FormSection>
      <FormSection title="Details">
        <div className="grid gap-5 sm:grid-cols-2">
          <LinesField name="features" label="What’s included" defaultValue={service?.features} />
          <LinesField name="deliverables" label="Deliverables" defaultValue={service?.deliverables} />
          <LinesField name="technologies" label="Technologies" defaultValue={service?.technologies} />
          <TextArea name="process_steps" label="Process steps" rows={5} defaultValue={(service?.process_steps ?? []).map((s) => `${s.title}: ${s.description}`).join("\n")} hint="One per line as “Step name: description”." />
          <TextField name="starting_price" label="Starting price (₹)" type="number" min={0} defaultValue={service?.starting_price ?? ""} hint="Optional. Shown as “From ₹…”." />
          <TextField name="sort_order" label="Display order" type="number" min={0} defaultValue={service?.sort_order ?? 0} />
        </div>
      </FormSection>
      <FormSection title="Search engines" description="Leave empty to use the title and summary.">
        <TextField name="seo_title" label="SEO title" maxLength={160} defaultValue={service?.seo_title} />
        <TextArea name="seo_description" label="Meta description" rows={2} maxLength={320} defaultValue={service?.seo_description} />
      </FormSection>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CheckboxField name="is_published" label="Published" hint="Visible on the website" defaultChecked={service ? Boolean(service.is_published) : true} />
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
