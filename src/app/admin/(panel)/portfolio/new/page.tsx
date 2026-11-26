import { requirePageAccess } from "@/server/auth/guard";
import { listServices } from "@/server/repos/content";
import { PageHeader } from "@/components/admin/ui";
import { createProject } from "../actions";
import { PortfolioForm } from "../ProjectForm";

export default async function NewPortfolioPage() {
  await requirePageAccess("portfolio.manage");
  const services = await listServices({ includeDrafts: true });
  return (
    <>
      <PageHeader back={{ href: "/admin/portfolio", label: "Portfolio" }} title="Add portfolio project" />
      <PortfolioForm action={createProject} services={services} submitLabel="Create project" />
    </>
  );
}
