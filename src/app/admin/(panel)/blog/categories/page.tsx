import { requirePageAccess } from "@/server/auth/guard";
import { query } from "@/server/db";
import { ActionForm, ConfirmSubmit, SubmitButton, TextField } from "@/components/admin/form";
import { Card, PageHeader } from "@/components/admin/ui";
import { deleteCategory, deleteUnusedTags, renameTag, saveCategory } from "../actions";

export default async function BlogTaxonomyPage() {
  await requirePageAccess("blog.manage");
  const [categories, tags] = await Promise.all([
    query<{ id: number; name: string; slug: string; description: string | null; n: number }>("SELECT c.*, (SELECT COUNT(*) FROM blog_posts p WHERE p.category_id = c.id) AS n FROM blog_categories c ORDER BY c.name"),
    query<{ id: number; name: string; slug: string; n: number }>("SELECT t.*, (SELECT COUNT(*) FROM blog_post_tags pt WHERE pt.tag_id = t.id) AS n FROM blog_tags t ORDER BY t.name"),
  ]);
  return (
    <>
      <PageHeader back={{ href: "/admin/blog", label: "Blog" }} title="Categories & tags" />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <Card title="Add category">
            <ActionForm action={saveCategory.bind(null, null)} resetOnSuccess className="grid gap-4 sm:grid-cols-2">
              <TextField name="name" label="Name" required />
              <TextField name="slug" label="Slug" hint="Optional" />
              <TextField name="description" label="Description" className="sm:col-span-2" />
              <div><SubmitButton>Add category</SubmitButton></div>
            </ActionForm>
          </Card>
          {categories.map((c) => (
            <Card key={c.id} title={`${c.name} · ${c.n} posts`} actions={<ActionForm action={deleteCategory.bind(null, c.id)}><ConfirmSubmit label="Delete" /></ActionForm>}>
              <ActionForm action={saveCategory.bind(null, c.id)} className="grid gap-4 sm:grid-cols-2">
                <TextField name="name" label="Name" defaultValue={c.name} />
                <TextField name="slug" label="Slug" defaultValue={c.slug} />
                <TextField name="description" label="Description" defaultValue={c.description} className="sm:col-span-2" />
                <div><SubmitButton>Save</SubmitButton></div>
              </ActionForm>
            </Card>
          ))}
        </div>
        <Card title="Tags" actions={<ActionForm action={deleteUnusedTags}><SubmitButton variant="outline">Remove unused</SubmitButton></ActionForm>}>
          <p className="mb-4 text-sm text-slate">Tags are created from the post editor. Rename them here.</p>
          <ul className="space-y-3">
            {tags.map((t) => (
              <li key={t.id}>
                <ActionForm action={renameTag.bind(null, t.id)} className="flex items-end gap-2">
                  <TextField name="name" label={`#${t.slug} · ${t.n} posts`} defaultValue={t.name} className="flex-1" />
                  <SubmitButton variant="outline">Rename</SubmitButton>
                </ActionForm>
              </li>
            ))}
            {!tags.length ? <li className="text-sm text-slate">No tags yet.</li> : null}
          </ul>
        </Card>
      </div>
    </>
  );
}
