
import Image from "next/image";

const galleryImages = [
  {
    src: "/about/about-team.jpeg",
    alt: "Creative team collaboration",
    title: "Ideas & Collaboration",
    category: "The Creative Process",
    className: "lg:col-span-2 lg:row-span-2",
  },
  {
    src: "/about/about-design.jpeg",
    alt: "Digital design workspace",
    title: "Design With Purpose",
    category: "Creative Thinking",
    className: "",
  },
  {
    src: "/about/about-workspace.jpeg",
    alt: "Modern digital workspace",
    title: "Built With Technology",
    category: "Digital Craft",
    className: "",
  },
];

export default function AboutGallery() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Heading */}
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                Behind The Work
              </span>
            </div>

            <h2 className="max-w-[600px] font-heading text-3xl font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27] sm:text-5xl">
              A closer look at
              <span className="block text-[#B58A62]">
                how we create.
              </span>
            </h2>
          </div>

          <p className="max-w-[390px] text-xs leading-7 text-[#777A80] sm:text-sm">
            Every great digital experience starts with an idea.
            Explore the creative thinking, design and technology
            that shape the work we do.
          </p>

        </div>

        {/* Image Gallery */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[260px_260px]">

          {galleryImages.map((image, index) => (
            <article
              key={image.src}
              className={`group relative min-h-[260px] overflow-hidden bg-[#191D27] ${image.className}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 100vw, 33vw"
                }
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#191D27]/90 via-[#191D27]/10 to-transparent" />

              {/* Image Content */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">

                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[1.8px] text-[#D5B18D]">
                    {image.category}
                  </span>

                  <h3 className="mt-2 font-heading text-xl font-semibold tracking-[-0.5px] text-white sm:text-2xl">
                    {image.title}
                  </h3>
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-all duration-300 group-hover:border-[#B58A62] group-hover:bg-[#B58A62]">
                  ↗
                </span>

              </div>
            </article>
          ))}

        </div>

        {/* Bottom Note */}
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[#191D27]/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-[10px] uppercase tracking-[1.5px] text-[#777A80]">
            Thoughtful ideas. Creative execution. Better experiences.
          </p>

          <span className="font-heading text-sm font-semibold text-[#8D6749]">
            Alfa Solution
          </span>
        </div>

      </div>
    </section>
  );
}
