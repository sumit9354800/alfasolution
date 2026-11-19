
import Link from "next/link";
import Image from "next/image";
import { workProjects } from "@/data/work";

export default function HomeSelectedWork() {
  const projects = workProjects
    .filter((project) => project.published && project.liveUrl)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-[#191D27] py-20 text-[#F4F1EA] sm:py-24 lg:py-28">
      <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#B58A62]/[0.07] blur-[130px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-7 sm:flex-row sm:items-end lg:mb-16">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[9px] font-semibold uppercase tracking-[3px] text-[#D1AA85]">
                Selected Work
              </span>
            </div>

            <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.06em]">
              Making ideas
              <br />
              <span className="text-[#B58A62]">matter in digital.</span>
            </h2>
          </div>

          <div className="max-w-[300px]">
            <p className="text-[12px] leading-[1.9] text-white/55">
              A selection of digital experiences shaped by thoughtful
              design, purposeful strategy and technology.
            </p>

            <Link
              href="/work"
              className="group mt-5 inline-flex items-center gap-4 border-b border-[#B58A62]/70 pb-2 text-[9px] font-semibold uppercase tracking-[1.8px] text-white transition-colors hover:text-[#D1AA85]"
            >
              View All Projects
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </div>
        </div>

        {/* Dynamic Project Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-8">
          {projects.map((project, index) => (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={project.id}
              className="group block"
              aria-label={`View ${project.title} live website`}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#252B38]">
                <Image
                  src={project.image}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#191D27]/40 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="absolute left-5 top-5 text-[9px] font-medium tracking-[2px] text-white">
                  PROJECT / {String(index + 1).padStart(2, "0")}
                </span>

                <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F1EA] text-[#191D27] transition-all duration-500 group-hover:rotate-45 group-hover:bg-[#B58A62]">
                  ↗
                </span>
              </div>

              {/* Details */}
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] font-semibold uppercase tracking-[1.7px] text-[#D1AA85]">
                    {project.category}
                  </span>

                  <span className="shrink-0 text-[9px] text-white/40">
                    {project.year}
                  </span>
                </div>

                <h3 className="mt-3 font-heading text-[19px] font-medium tracking-[-0.5px] text-[#F4F1EA] transition-colors duration-300 group-hover:text-[#D1AA85]">
                  {project.title}
                </h3>

                <p className="mt-3 text-[11px] leading-[1.8] text-white/45">
                  {project.description}
                </p>

                <div className="mt-6 h-px w-full bg-white/15">
                  <div className="h-px w-0 bg-[#B58A62] transition-all duration-700 group-hover:w-full" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col justify-between gap-5 border-t border-white/15 pt-7 sm:flex-row sm:items-center">
          <p className="font-heading text-[16px] text-white/75 sm:text-[19px]">
            Every project starts with a better question.
          </p>

          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-4 text-[9px] font-semibold uppercase tracking-[1.8px] text-[#D1AA85] hover:text-white"
          >
            Have a Project in Mind?
            <span className="transition-transform group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}
