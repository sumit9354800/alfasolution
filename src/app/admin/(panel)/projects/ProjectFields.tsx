import { SelectField, TextArea, TextField } from "@/components/admin/form";
import { PROJECT_STATUSES, type ClientProject } from "@/server/repos/crm";
import { toDateInput } from "@/lib/format";

export function ProjectFields({ project, clients, clientId }: { project?: ClientProject | null; clients: { id: number; name: string; company: string | null }[]; clientId?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SelectField name="client_id" label="Client" required placeholder="Choose a client" defaultValue={project?.client_id ?? clientId ?? ""} options={clients.map((c) => ({ value: c.id, label: c.company ? `${c.company} (${c.name})` : c.name }))} />
      <TextField name="title" label="Project title" required defaultValue={project?.title} />
      <SelectField name="status" label="Status" defaultValue={project?.status ?? "planning"} options={Object.entries(PROJECT_STATUSES).map(([value, label]) => ({ value, label }))} />
      <TextField name="budget" label="Budget (₹, incl. tax)" type="number" step="0.01" min={0} defaultValue={project?.budget ?? ""} />
      <TextField name="start_date" label="Start date" type="date" defaultValue={toDateInput(project?.start_date)} />
      <TextField name="due_date" label="Due date" type="date" defaultValue={toDateInput(project?.due_date)} />
      <TextArea name="description" label="Description & scope" rows={4} defaultValue={project?.description} className="sm:col-span-2" />
      <TextArea
        name="deliverables"
        label="Deliverables"
        rows={6}
        className="sm:col-span-2"
        defaultValue={(project?.deliverables ?? []).map((d) => `${d.done ? "[x]" : "[ ]"} ${d.title}`).join("\n")}
        hint="One per line. Start a line with [x] to mark it complete, e.g. “[x] Homepage design”."
      />
    </div>
  );
}
