import Image from "next/image";
import Link from "next/link";
import { workProjects } from "@/data/work";

export default function WhatWeBuild() {
  const projects = workProjects
    .filter((project) => project.published && project.liveUrl)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="bg-[#191D27] px-6 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        {/* Heading */}
        <div className="mb-14 grid gap-7 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D0A47E]">
                Selected Projects
              </span>
            </div>

            <h2 className="max-w-2xl font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Digital solutions,
              <span className="block text-[#D0A47E]">
                built for real businesses.
              </span>
            </h2>
          </div>

          <p className="max-w-xl text-base leading-8 text-white/55 lg:justify-self-end">
            Explore a selection of websites and digital experiences developed
            for different business needs and ideas.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group overflow-hidden border border-white/10 bg-white/[0.035] transition duration-300 hover:border-[#B58A62]/60 hover:bg-white/[0.06]"
            >
              {/* Project Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#252B36]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <span className="absolute left-4 top-4 border border-white/20 bg-[#191D27]/80 px-3 py-2 text-xs font-semibold text-[#D0A47E] backdrop-blur-sm">
                  {project.year}
                </span>
              </div>

              {/* Project Content */}
              <div className="p-6 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D0A47E]">
                  {project.category}
                </p>

                <h3 className="mt-3 font-heading text-xl font-semibold text-white">
                  {project.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/55">
                  {project.description}
                </p>

                {/* Live Website Link */}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${project.title} live website`}
                    className="inline-flex items-center gap-3 text-sm font-semibold text-[#D0A47E] transition hover:text-white"
                  >
                    View Live Website
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-7 text-white/55">
            Have a website or application idea? Let&apos;s discuss how we can
            bring it to life.
          </p>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-4 bg-[#B58A62] px-6 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#191D27]"
          >
            Discuss Your Idea
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
