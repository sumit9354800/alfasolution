import { requirePageAccess } from "@/server/auth/guard";
import { listAdminUsers } from "@/server/repos/admin";
import { ROLE_LABELS, ROLES, permissionsFor } from "@/lib/rbac";
import { ActionForm, CheckboxField, SelectField, SubmitButton, TextField } from "@/components/admin/form";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { createUser, updateUser } from "./actions";

export default async function UsersPage() {
  const me = await requirePageAccess("users.manage");
  const users = await listAdminUsers();
  const roleOptions = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));
  return (
    <>
      <PageHeader title="Admin users" description="Who can sign in to this admin, and what each role can do." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          {users.map((u) => (
            <details key={u.id} className="rounded-xl border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 [&::-webkit-details-marker]:hidden">
                <span><span className="font-semibold">{u.name}</span> <span className="text-sm text-slate">{u.email}</span></span>
                <span className="flex items-center gap-2">
                  <Badge tone="accent">{ROLE_LABELS[u.role]}</Badge>
                  {u.is_active ? null : <Badge tone="danger">Deactivated</Badge>}
                </span>
              </summary>
              <div className="border-t border-line p-5">
                <p className="mb-4 text-xs text-slate">Last sign-in: {formatDateTime(u.last_login_at)}</p>
                <ActionForm action={updateUser.bind(null, u.id)} className="grid gap-4 sm:grid-cols-2">
                  <SelectField name="role" label="Role" defaultValue={u.role} options={roleOptions} />
                  <TextField name="password" label="Reset password" type="password" hint="Leave empty to keep the current password." />
                  <CheckboxField name="is_active" label="Active" hint={u.id === me.id ? "This is you." : "Deactivated users are signed out immediately."} defaultChecked={Boolean(u.is_active)} />
                  <div className="sm:col-span-2"><SubmitButton>Save</SubmitButton></div>
                </ActionForm>
              </div>
            </details>
          ))}
        </div>
        <div className="space-y-6">
          <Card title="Add admin user">
            <ActionForm action={createUser} resetOnSuccess className="space-y-4">
              <TextField name="name" label="Name" required />
              <TextField name="email" label="Email" type="email" required />
              <SelectField name="role" label="Role" defaultValue="editor" options={roleOptions} />
              <TextField name="password" label="Temporary password" type="password" required hint="At least 12 characters. Ask them to change it after signing in." />
              <SubmitButton>Add user</SubmitButton>
            </ActionForm>
          </Card>
          <Card title="Roles">
            <dl className="space-y-3 text-sm">
              {ROLES.map((r) => (
                <div key={r}>
                  <dt className="font-semibold">{ROLE_LABELS[r]}</dt>
                  <dd className="text-slate">{permissionsFor(r).filter((p) => p !== "dashboard.view").map((p) => p.split(".")[0]).join(", ")}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
