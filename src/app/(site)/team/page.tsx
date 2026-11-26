import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { listTeam } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { initials, canOptimizeImage } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/team", title: "Our team" });
}

export default async function TeamPage() {
  const team = await listTeam();
  return (
    <>
      <PageIntro
        crumbs={[{ label: "About", href: "/about" }, { label: "Team" }]}
        title="The people who plan, design and build your project."
        lede="You work directly with the people doing the work — no account-manager relay."
      />
      <section className="bg-white">
        <div className="container-site py-16 sm:py-20">
          {team.length ? (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li key={member.id}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-paper">
                    {member.photo ? (
                      <Image src={member.photo} alt={member.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" unoptimized={!canOptimizeImage(member.photo)} />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-6xl text-line-strong" aria-hidden="true">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-5 text-xl">{member.name}</h2>
                  <p className="text-slate">{member.role}</p>
                  {member.bio ? <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">{member.bio}</p> : null}
                  {member.linkedin_url ? (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block text-sm">
                      LinkedIn profile
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Team profiles are on their way"
              body="In the meantime, you can see what we’ve built — or join us."
              action={
                <div className="flex gap-3">
                  <Link href="/work" className="btn btn-outline">See our work</Link>
                  <Link href="/careers" className="btn btn-dark">Open roles</Link>
                </div>
              }
            />
          )}
        </div>
      </section>
      <CtaBand title="Want to work with us?" body="We’re always glad to meet people who care about craft." label="See open roles" href="/careers" />
    </>
  );
}
