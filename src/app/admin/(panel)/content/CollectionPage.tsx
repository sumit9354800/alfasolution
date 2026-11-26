import { query } from "@/server/db";
import { parseJson } from "@/server/db";
import { ActionForm, CheckboxField, ConfirmSubmit, ImageField, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { Badge, PageHeader } from "@/components/admin/ui";
import { COLLECTIONS, type Collection, type CollectionField } from "./collections";
import { deleteCollectionItem, saveCollectionItem } from "./collection-actions";

function Field({ field, value }: { field: CollectionField; value: unknown }) {
  const cls = field.wide ? "sm:col-span-2" : "";
  switch (field.type) {
    case "boolean":
      return <div className={cls}><CheckboxField name={field.name} label={field.label} defaultChecked={value === undefined ? true : Boolean(value)} /></div>;
    case "textarea":
      return <TextArea name={field.name} label={field.label} required={field.required} defaultValue={(value as string) ?? ""} rows={3} hint={field.hint} className={cls} />;
    case "image":
      return <ImageField name={field.name} label={field.label} defaultValue={(value as string) ?? ""} className={cls} />;
    case "lines":
      return <TextArea name={field.name} label={field.label} defaultValue={parseJson<string[]>(value, []).join("\n")} rows={5} hint="One per line." className={cls} />;
    case "select":
      return <SelectField name={field.name} label={field.label} defaultValue={(value as string) ?? field.options?.[0]?.value} options={field.options ?? []} className={cls} />;
    case "number":
      return <TextField name={field.name} label={field.label} type="number" defaultValue={value as number | null} hint={field.hint} className={cls} step="0.01" />;
    default:
      return <TextField name={field.name} label={field.label} required={field.required} defaultValue={(value as string) ?? ""} hint={field.hint} className={cls} />;
  }
}

function ItemForm({ collection, item }: { collection: Collection; item?: Record<string, unknown> }) {
  const id = item ? Number(item.id) : null;
  return (
    <ActionForm action={saveCollectionItem.bind(null, collection.key, id)} resetOnSuccess={!id} className="grid gap-4 sm:grid-cols-2">
      {collection.fields.map((field) => (
        <Field key={field.name} field={field} value={item?.[field.name]} />
      ))}
      <div className="sm:col-span-2"><SubmitButton>{id ? "Save" : `Add ${collection.singular}`}</SubmitButton></div>
    </ActionForm>
  );
}

export async function CollectionPage({ name }: { name: Collection["key"] }) {
  const collection = COLLECTIONS[name];
  const items = await query<Record<string, unknown>>(`SELECT * FROM ${collection.table} ORDER BY sort_order, id`);
  return (
    <>
      <PageHeader back={{ href: "/admin/content", label: "Pages & content" }} title={collection.title} description={collection.description} />
      <details className="mb-6 rounded-xl border border-line bg-white" open={!items.length}>
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold">Add {collection.singular}</summary>
        <div className="border-t border-line p-5"><ItemForm collection={collection} /></div>
      </details>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={String(item.id)}>
            <details className="group rounded-xl border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="font-semibold">{String(item[collection.titleField] ?? "")}</span>
                  {collection.subtitleField && item[collection.subtitleField] ? <span className="ml-2 text-sm text-slate">{String(item[collection.subtitleField])}</span> : null}
                </span>
                <span className="flex items-center gap-2">
                  {item.is_published ? <Badge tone="success">Live</Badge> : <Badge>Hidden</Badge>}
                  <span className="text-sm text-slate group-open:hidden">Edit</span>
                </span>
              </summary>
              <div className="border-t border-line p-5">
                <ItemForm collection={collection} item={item} />
                <ActionForm action={deleteCollectionItem.bind(null, collection.key, Number(item.id))} className="mt-4 border-t border-line pt-4">
                  <ConfirmSubmit label={`Delete ${collection.singular}`} />
                </ActionForm>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
