import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { EMPLOYMENT_TYPES, WORK_MODES, getOpenJob, isJobOpen } from "@/server/repos/careers";
import { PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { ApplyForm } from "@/components/site/ApplyForm";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getOpenJob(slug);
  if (!job) return { title: "Role not found" };
  return buildMetadata({ path: `/careers/${job.slug}`, title: `${job.title} — Careers`, description: job.summary, noindex: !isJobOpen(job) });
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getOpenJob(slug);
  if (!job) notFound();
  const open = isJobOpen(job);

  const facts: [string, string][] = [
    ["Team", job.department],
    ["Location", job.location],
    ["Work mode", WORK_MODES[job.work_mode]],
    ["Type", EMPLOYMENT_TYPES[job.employment_type]],
    ...(job.experience ? [["Experience", job.experience] as [string, string]] : []),
    ...(job.salary_range ? [["Salary", job.salary_range] as [string, string]] : []),
    ...(job.closes_at ? [["Apply by", formatDate(job.closes_at, "long")] as [string, string]] : []),
  ];

  return (
    <>
      <PageIntro crumbs={[{ label: "Careers", href: "/careers" }, { label: job.title }]} title={job.title} lede={job.summary}>
        {open ? <a href="#apply" className="btn btn-primary">Apply for this role</a> : <p className="font-semibold text-danger">This role is closed to new applications.</p>}
      </PageIntro>

      <section className="bg-white">
        <div className="container-site grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-12">
            {job.description ? <div className="prose-alfa" dangerouslySetInnerHTML={{ __html: job.description }} /> : null}
            {job.responsibilities.length ? (
              <div>
                <h2 className="text-2xl">What you’ll do</h2>
                <ul className="prose-alfa mt-4">
                  {job.responsibilities.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
            {job.requirements.length ? (
              <div>
                <h2 className="text-2xl">What we’re looking for</h2>
                <ul className="prose-alfa mt-4">
                  {job.requirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
          <aside>
            <dl className="sticky top-28 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper px-6">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3.5 text-[0.95rem]">
                  <dt className="text-slate">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      {open ? (
        <section id="apply" className="scroll-mt-24 bg-paper">
          <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <h2 className="display-md">Apply</h2>
              <p className="mt-4 text-slate">It takes about five minutes. We reply to every applicant.</p>
            </div>
            <ApplyForm jobId={job.id} jobTitle={job.title} />
          </div>
        </section>
      ) : null}

      {open ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: `${job.summary}${job.description ? ` ${job.description.replace(/<[^>]+>/g, " ")}` : ""}`,
            datePosted: new Date(job.created_at).toISOString().slice(0, 10),
            ...(job.closes_at ? { validThrough: new Date(job.closes_at).toISOString() } : {}),
            employmentType: job.employment_type.toUpperCase(),
            hiringOrganization: { "@type": "Organization", name: "Alfa Solution", sameAs: env.siteUrl, logo: `${env.siteUrl}/images/logo-black.png` },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "IN" } },
            ...(job.work_mode === "remote" ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "India" } } : {}),
          }}
        />
      ) : null}
    </>
  );
}
