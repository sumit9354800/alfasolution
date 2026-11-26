import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata } from "@/server/seo";
import { env } from "@/server/env";
import { listTeam } from "@/server/repos/content";
import { CtaBand, EmptyState, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { initials, canOptimizeImage } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const team = await listTeam();
  // An entry for /team in Admin → SEO → Page titles & descriptions takes priority over these.
  const meta = await buildMetadata({
    path: "/team",
    title: "Our Web Designers & Developers in India",
    description: "Meet the designers, developers and strategists at Alfa Solution who plan, build and support websites and apps for businesses across India.",
  });
  // An empty team page is thin content — keep it out of search until profiles are added.
  return team.length ? meta : { ...meta, robots: { index: false, follow: true } };
}

const absolute = (src: string) => (src.startsWith("http") ? src : `${env.siteUrl}${src}`);

export default async function TeamPage() {
  const team = await listTeam();
  return (
    <>
      <PageIntro
        crumbs={[{ label: "About", href: "/about" }, { label: "Team" }]}
        title="Meet our web design & development team"
        lede="The people who plan, design and build your project. You work directly with the people doing the work — no account-manager relay."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/about" className="btn btn-outline">About us</Link>
          <Link href="/services" className="btn btn-outline">Our services</Link>
        </div>
      </PageIntro>
      <section className="bg-white">
        <div className="container-site py-16 sm:py-20">
          {team.length ? (
            <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <li key={member.id}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-paper">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={`${member.name}, ${member.role} at Alfa Solution`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                        unoptimized={!canOptimizeImage(member.photo)}
                      />
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
                      {member.name} on LinkedIn
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

      {team.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alfa Solution team",
            url: `${env.siteUrl}/team`,
            itemListElement: team.map((member, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Person",
                name: member.name,
                jobTitle: member.role,
                ...(member.bio ? { description: member.bio } : {}),
                ...(member.photo ? { image: absolute(member.photo) } : {}),
                ...(member.linkedin_url ? { sameAs: [member.linkedin_url] } : {}),
                worksFor: { "@type": "Organization", name: "Alfa Solution", url: env.siteUrl },
              },
            })),
          }}
        />
      ) : null}
    </>
  );
}