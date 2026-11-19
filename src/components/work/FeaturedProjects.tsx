import Image from "next/image";
import { workProjects } from "@/data/work";

export default function FeaturedProjects() {
  const projects = workProjects
    .filter((project) => project.published && project.liveUrl)
    .sort((a, b) => a.order - b.order);

  return (
    <section
      id="featured-projects"
      className="bg-[#F4F1EA] px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <div className="mb-14 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#B58A62]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8D6749]">
                Featured Projects
              </span>
            </div>

            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#191D27] sm:text-4xl lg:text-5xl">
              Digital work made
              <span className="block text-[#B58A62]">with purpose.</span>
            </h2>
          </div>

          <p className="max-w-md text-base leading-8 text-[#626873]">
            Explore selected website and web application projects, built around
            real business requirements and digital ideas.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <article key={project.id} className="group min-w-0">
              {/* Project Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#E7E2D9]">
                <Image
                  src={project.image}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

                <span className="absolute left-4 top-4 bg-[#191D27] px-4 py-2 text-xs font-semibold text-[#D0A47E]">
                  {project.projectType}
                </span>

                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} live website`}
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-[#191D27] transition duration-300 hover:bg-[#B58A62] hover:text-white"
                >
                  ↗
                </a>
              </div>

              {/* Project Details */}
              <div className="pt-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8D6749]">
                    {project.category}
                  </p>

                  <span className="shrink-0 text-xs text-[#99938B]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-3 font-heading text-xl font-semibold text-[#191D27] sm:text-2xl">
                  {project.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#626873]">
                  {project.description}
                </p>

                {/* Live Website */}
                <div className="mt-6 border-t border-[#191D27]/10 pt-5">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#191D27] transition hover:text-[#B58A62]"
                  >
                    View Live Website
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-14 border-t border-[#191D27]/15 pt-7">
          <p className="max-w-2xl text-sm leading-7 text-[#77736D]">
            Every project reflects a different idea, requirement and approach.
            Our focus is on creating useful digital experiences that work for
            businesses and their customers.
          </p>
        </div>
      </div>
    </section>
  );
}
