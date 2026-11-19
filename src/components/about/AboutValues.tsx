
const values = [
  {
    number: "01",
    title: "Purpose First",
    description:
      "Every decision starts with understanding the real purpose behind a project and the value it should create.",
    keyword: "Meaningful Work",
  },
  {
    number: "02",
    title: "Thoughtful Design",
    description:
      "We believe great design is more than appearance. It should feel intuitive, useful and effortless to experience.",
    keyword: "Design With Intent",
  },
  {
    number: "03",
    title: "Quality Always",
    description:
      "From the smallest detail to the final delivery, we focus on creating reliable and carefully crafted solutions.",
    keyword: "Attention To Detail",
  },
  {
    number: "04",
    title: "Grow Together",
    description:
      "We value collaboration, clear communication and lasting relationships built around shared goals.",
    keyword: "Better Together",
  },
];

export default function AboutValues() {
  return (
    <section className="bg-[#F4F1EA] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Heading */}
        <div className="mb-14 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[10px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                What Guides Us
              </span>
            </div>

            <h2 className="max-w-[600px] font-heading text-3xl font-semibold leading-[1.12] tracking-[-0.055em] text-[#191D27] sm:text-5xl lg:text-[54px]">
              Principles behind
              <span className="block text-[#B58A62]">
                everything we create.
              </span>
            </h2>
          </div>

          <p className="max-w-[390px] text-xs leading-7 text-[#777A80] sm:text-sm lg:pb-2">
            Our values shape how we think, collaborate and deliver.
            They keep every project focused on quality, purpose and
            meaningful results.
          </p>

        </div>

        {/* Values Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {values.map((value) => (
            <article
              key={value.number}
              className="group flex min-h-[300px] flex-col border border-[#191D27]/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#B58A62]/50 hover:shadow-[0_18px_45px_rgba(25,29,39,0.06)] sm:min-h-[330px] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold text-[#B58A62]">
                  / {value.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#191D27]/10 text-sm text-[#191D27] transition-all duration-300 group-hover:border-[#B58A62] group-hover:bg-[#B58A62] group-hover:text-white">
                  ↗
                </span>
              </div>

              <div className="mt-auto">
                <p className="mb-3 text-[9px] font-semibold uppercase tracking-[1.6px] text-[#8D6749]">
                  {value.keyword}
                </p>

                <h3 className="font-heading text-xl font-semibold tracking-[-0.7px] text-[#191D27] sm:text-2xl">
                  {value.title}
                </h3>

                <p className="mt-4 text-[11px] leading-[1.9] text-[#777A80] sm:text-xs">
                  {value.description}
                </p>
              </div>

              <div className="mt-7 h-px w-full bg-[#191D27]/10 transition-colors duration-300 group-hover:bg-[#B58A62]" />
            </article>
          ))}

        </div>

        {/* Bottom Statement */}
        <div className="mt-10 flex flex-col gap-3 border-t border-[#191D27]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-sm font-semibold text-[#191D27]">
            Good work begins with the right values.
          </p>

          <span className="text-[9px] font-semibold uppercase tracking-[1.8px] text-[#8D6749]">
            The Alfa Philosophy
          </span>
        </div>

      </div>
    </section>
  );
}
