import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listClientOptions } from "@/server/repos/crm";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { Card, PageHeader } from "@/components/admin/ui";
import { createProject } from "../actions";
import { ProjectFields } from "../ProjectFields";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requirePageAccess("clients.manage");
  const [clients, { client }] = await Promise.all([listClientOptions(), searchParams]);
  return (
    <>
      <PageHeader back={{ href: "/admin/projects", label: "Projects" }} title="New project" />
      {clients.length ? (
        <Card>
          <ActionForm action={createProject} className="space-y-6">
            <ProjectFields clients={clients} clientId={Number(client) || undefined} />
            <SubmitButton>Create project</SubmitButton>
          </ActionForm>
        </Card>
      ) : (
        <Card><p className="text-sm">Add a client first. <Link href="/admin/clients/new" className="text-accent">Add client</Link></p></Card>
      )}
    </>
  );
}
