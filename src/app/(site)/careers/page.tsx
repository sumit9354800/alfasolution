import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { EMPLOYMENT_TYPES, WORK_MODES, listOpenDepartments, listOpenJobs } from "@/server/repos/careers";
import { PageIntro } from "@/components/site/blocks";
import { ApplyForm } from "@/components/site/ApplyForm";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/careers", title: "Careers" });
}

type Props = { searchParams: Promise<{ department?: string; type?: string }> };

const PERKS = [
  ["Real client work", "Ship production websites and apps used by real businesses from your first month."],
  ["Small, senior team", "Work directly with the people making decisions. Your ideas get used."],
  ["Learn the whole stack", "Design, frontend, backend, deployment — see how every part fits together."],
  ["Flexible working", "Hybrid and remote roles, with focus time protected."],
];

export default async function CareersPage({ searchParams }: Props) {
  const filters = await searchParams;
  const [jobs, departments] = await Promise.all([listOpenJobs(filters), listOpenDepartments()]);
  const pill = (active: boolean) => `rounded-full border px-3.5 py-1.5 text-sm ${active ? "border-ink bg-ink text-white" : "border-line bg-white text-slate hover:text-ink"}`;
  const href = (next: { department?: string; type?: string }) => {
    const merged = { ...filters, ...next };
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/careers?${qs}` : "/careers";
  };

  return (
    <>
      <PageIntro
        crumbs={[{ label: "Careers" }]}
        title="Build things people actually use."
        lede="We’re a small studio that ships real products for real businesses. If you care about craft and like seeing your work go live, we’d like to hear from you."
      >
        <a href="#roles" className="btn btn-dark">See open roles</a>
      </PageIntro>

      <section className="bg-white">
        <div className="container-site grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map(([title, body]) => (
            <div key={title} className="border-t border-line pt-5">
              <h2 className="text-lg">{title}</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-slate">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="scroll-mt-24 bg-paper">
        <div className="container-site py-16 sm:py-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="display-md">Open roles</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={href({ department: undefined })} className={pill(!filters.department)}>All teams</Link>
              {departments.map((d) => (
                <Link key={d} href={href({ department: d })} className={pill(filters.department === d)}>{d}</Link>
              ))}
              <span className="mx-1 hidden w-px bg-line md:block" />
              {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
                <Link key={value} href={href({ type: filters.type === value ? undefined : value })} className={pill(filters.type === value)}>{label}</Link>
              ))}
            </div>
          </div>

          {jobs.length ? (
            <ul className="mt-10 divide-y divide-line border-y border-line bg-white">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/careers/${job.slug}`} className="group grid gap-3 px-5 py-6 sm:grid-cols-[1.4fr_1fr_auto] sm:items-center sm:px-7">
                    <div>
                      <h3 className="text-xl group-hover:text-accent">{job.title}</h3>
                      <p className="mt-1 text-[0.95rem] text-slate">{job.summary}</p>
                    </div>
                    <p className="text-sm text-slate">
                      {job.department} · {job.location} · {WORK_MODES[job.work_mode]}
                    </p>
                    <span className="chip w-fit">{EMPLOYMENT_TYPES[job.employment_type]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-white p-8">
              <h3 className="text-xl">{filters.department || filters.type ? "No roles match these filters" : "No open roles right now"}</h3>
              <p className="mt-2 max-w-xl text-slate">
                We still read every application. Send us your CV below and we’ll get in touch when a role that fits you opens.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h2 className="display-md">Don’t see your role?</h2>
            <p className="mt-4 text-slate">Send a general application. Tell us what you do best and show us something you’ve built.</p>
          </div>
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
