import type { BlogCategory, BlogPost } from "@/server/repos/blog";
import type { ActionState } from "@/lib/action-state";
import { toDateTimeInput } from "@/lib/format";
import { ActionForm, CheckboxField, FormSection, ImageField, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function PostForm({ action, post, categories, submitLabel }: { action: (s: ActionState, f: FormData) => Promise<ActionState>; post?: BlogPost | null; categories: BlogCategory[]; submitLabel: string }) {
  return (
    <ActionForm action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormSection title="Article">
          <TextField name="title" label="Title" required defaultValue={post?.title} />
          <TextArea name="excerpt" label="Excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt} hint="Shown on listings and in search results. Generated from the article if left empty." />
          <RichTextEditor name="content" label="Content" defaultValue={post?.content ?? ""} minHeight={420} />
        </FormSection>
        <FormSection title="Search engines" description="Leave empty to use the title and excerpt.">
          <TextField name="slug" label="URL slug" defaultValue={post?.slug} hint="Page URL: /blog/<slug>. Changing it breaks existing links." />
          <TextField name="seo_title" label="SEO title" maxLength={160} defaultValue={post?.seo_title} />
          <TextArea name="seo_description" label="Meta description" rows={2} maxLength={320} defaultValue={post?.seo_description} />
        </FormSection>
      </div>
      <div className="space-y-6">
        <FormSection title="Publishing">
          <SelectField name="status" label="Status" defaultValue={post?.status ?? "draft"} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
          <TextField name="published_at" label="Publish date & time (IST)" type="datetime-local" defaultValue={toDateTimeInput(post?.published_at)} hint="Set a future time to schedule the post. Empty = now." />
          <CheckboxField name="is_featured" label="Feature at the top of the blog" defaultChecked={Boolean(post?.is_featured)} />
          <SubmitButton className="w-full">{submitLabel}</SubmitButton>
        </FormSection>
        <FormSection title="Organise">
          <SelectField name="category_id" label="Category" placeholder="Uncategorised" defaultValue={post?.category_id ?? ""} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <TextField name="tags" label="Tags" defaultValue={(post?.tags ?? []).map((t) => t.name).join(", ")} hint="Separate with commas." />
          <ImageField name="cover_image" label="Featured image" defaultValue={post?.cover_image} />
        </FormSection>
      </div>
    </ActionForm>
  );
}
