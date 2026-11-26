import { requirePageAccess } from "@/server/auth/guard";
import { ROLE_LABELS } from "@/lib/rbac";
import { ActionForm, SubmitButton, TextField } from "@/components/admin/form";
import { Card, DescriptionList, PageHeader } from "@/components/admin/ui";
import { changeOwnPassword, signOutEverywhere } from "../users/actions";

export default async function AccountPage() {
  const user = await requirePageAccess("dashboard.view");
  return (
    <>
      <PageHeader title="Your account" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile"><DescriptionList items={[["Name", user.name], ["Email", user.email], ["Role", ROLE_LABELS[user.role]]]} /></Card>
        <Card title="Change password">
          <ActionForm action={changeOwnPassword} resetOnSuccess className="space-y-4">
            <TextField name="current" label="Current password" type="password" required />
            <TextField name="password" label="New password" type="password" required hint="At least 12 characters, with letters and numbers or symbols." />
            <TextField name="confirm" label="Confirm new password" type="password" required />
            <SubmitButton>Change password</SubmitButton>
          </ActionForm>
        </Card>
        <Card title="Sessions">
          <ActionForm action={signOutEverywhere}>
            <p className="mb-3 text-sm text-slate">Lost a device or used a shared computer? Sign out of every session, including this one.</p>
            <SubmitButton variant="outline">Sign out everywhere</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
