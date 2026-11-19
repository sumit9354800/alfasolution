
const stats = [
  {
    number: "03+",
    label: "Years of Experience",
    description: "Building digital experiences",
  },
  {
    number: "30+",
    label: "Projects Delivered",
    description: "Across different industries",
  },
  {
    number: "30+",
    label: "Happy Clients",
    description: "Built on trust and collaboration",
  },
  {
    number: "100%",
    label: "Commitment",
    description: "Focused on quality and results",
  },
];

export default function HomeStatsBand() {
  return (
    <section className="relative overflow-hidden bg-[#191D27] py-16 sm:py-20 lg:py-24">

      {/* Background Accent */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#B58A62]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-5 border-b border-white/15 pb-7 sm:flex-row sm:items-end lg:mb-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-7 bg-[#B58A62]" />
              <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#D1AA85]">
                Our Impact
              </span>
            </div>

            <h2 className="font-heading text-3xl font-semibold tracking-[-1.5px] text-[#F4F1EA] sm:text-4xl">
              Numbers that reflect our work.
            </h2>
          </div>

          <p className="max-w-[300px] text-[12px] leading-7 text-white/55">
            Every number represents a relationship, an idea and a digital
            solution brought to life.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative ${
                index % 2 === 0 ? "" : "lg:border-l lg:border-white/15 lg:pl-8"
              }`}
            >
              <p className="font-heading text-[clamp(2.3rem,4.5vw,4rem)] font-semibold leading-none tracking-[-0.06em] text-[#B58A62]">
                {stat.number}
              </p>

              <h3 className="mt-5 text-[12px] font-semibold text-[#F4F1EA] sm:text-[13px]">
                {stat.label}
              </h3>

              <p className="mt-2 text-[10px] leading-6 text-white/45 sm:text-[11px]">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}