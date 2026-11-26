import type { Job } from "@/server/repos/careers";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/server/repos/careers";
import type { ActionState } from "@/lib/action-state";
import { toDateInput } from "@/lib/format";
import { ActionForm, FormSection, LinesField, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/form";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export function JobForm({ action, job, submitLabel }: { action: (s: ActionState, f: FormData) => Promise<ActionState>; job?: Job | null; submitLabel: string }) {
  return (
    <ActionForm action={action} className="space-y-6">
      <FormSection title="Role">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="title" label="Job title" required defaultValue={job?.title} />
          <TextField name="slug" label="URL slug" defaultValue={job?.slug} hint="Leave empty to generate. URL: /careers/<slug>" />
          <TextField name="department" label="Team / department" required defaultValue={job?.department} placeholder="Engineering" />
          <TextField name="location" label="Location" required defaultValue={job?.location} placeholder="Delhi NCR" />
          <SelectField name="employment_type" label="Employment type" defaultValue={job?.employment_type ?? "full_time"} options={Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => ({ value, label }))} />
          <SelectField name="work_mode" label="Work mode" defaultValue={job?.work_mode ?? "onsite"} options={Object.entries(WORK_MODES).map(([value, label]) => ({ value, label }))} />
          <TextField name="experience" label="Experience" defaultValue={job?.experience} placeholder="1–3 years" />
          <TextField name="salary_range" label="Salary range" defaultValue={job?.salary_range} placeholder="Optional" />
        </div>
        <TextArea name="summary" label="Summary" rows={2} required defaultValue={job?.summary} />
      </FormSection>
      <FormSection title="Description">
        <RichTextEditor name="description" label="About the role" defaultValue={job?.description ?? ""} minHeight={180} />
        <div className="grid gap-5 sm:grid-cols-2">
          <LinesField name="responsibilities" label="Responsibilities" defaultValue={job?.responsibilities} rows={6} />
          <LinesField name="requirements" label="Requirements" defaultValue={job?.requirements} rows={6} />
        </div>
      </FormSection>
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="status" label="Status" defaultValue={job?.status ?? "draft"} options={[{ value: "draft", label: "Draft — hidden" }, { value: "open", label: "Open — accepting applications" }, { value: "closed", label: "Closed" }]} />
          <TextField name="closes_at" label="Closing date" type="date" defaultValue={toDateInput(job?.closes_at)} hint="Optional — closes automatically after this date." />
        </div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
