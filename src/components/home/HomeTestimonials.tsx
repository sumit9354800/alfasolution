"use client";

import { useRef } from "react";
import Link from "next/link";

const testimonials = [
  {
    number: "01",
    name: "Sample Client 01",
    role: "Business Owner",
    date: "Sample Review",
    review:
      "The team understood our requirements clearly and transformed our ideas into a professional digital experience. The overall process was smooth and well organised.",
  },
  {
    number: "02",
    name: "Sample Client 02",
    role: "Startup Founder",
    date: "Sample Review",
    review:
      "We wanted a modern website that represented our brand properly. The design approach was thoughtful and the final experience felt clean and easy to use.",
  },
  {
    number: "03",
    name: "Sample Client 03",
    role: "Business Professional",
    date: "Sample Review",
    review:
      "Communication throughout the project was clear. The team paid attention to the details and helped us move from an initial concept to a complete website.",
  },
  {
    number: "04",
    name: "Sample Client 04",
    role: "E-commerce Business",
    date: "Sample Review",
    review:
      "The new digital experience made our business look more professional. We appreciated the focus on usability, design consistency and the overall user journey.",
  },
  {
    number: "05",
    name: "Sample Client 05",
    role: "Entrepreneur",
    date: "Sample Review",
    review:
      "A collaborative experience from beginning to end. Our requirements were understood carefully, and the team worked towards a solution that suited our goals.",
  },
  {
    number: "06",
    name: "Sample Client 06",
    role: "Company Representative",
    date: "Sample Review",
    review:
      "We were looking for a reliable digital partner and appreciated the structured approach. The attention given to both design and functionality stood out.",
  },
];

export default function HomeTestimonials() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "prev" | "next") => {
    if (!carouselRef.current) return;

    const amount = carouselRef.current.clientWidth * 0.85;

    carouselRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-7 border-b border-[#191D27]/10 pb-8 sm:flex-row sm:items-end lg:mb-14">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#B58A62]" />
              <span className="text-[9px] font-semibold uppercase tracking-[2.5px] text-[#8D6749]">
                Client Testimonials
              </span>
            </div>

            <h2 className="font-heading text-[clamp(2.3rem,4.5vw,3.8rem)] font-semibold leading-[1.1] tracking-[-0.055em] text-[#191D27]">
              Words that matter.
              <br />
              <span className="text-[#B58A62]">Experiences that last.</span>
            </h2>
          </div>

          {/* Google Review Identity */}
          <div className="flex items-center gap-4 sm:pb-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#191D27]/10 bg-white shadow-sm">
              <svg
                viewBox="0 0 48 48"
                className="h-7 w-7"
                aria-label="Google"
                role="img"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.9-5.2Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 15.1l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"
                />
              </svg>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#191D27]">
                Google Reviews
              </p>
              <p className="mt-1 text-[10px] text-[#777A80]">
                Customer experiences and feedback
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-[1.8px] text-[#8D6749]">
            What Clients Say
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel("prev")}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center border border-[#191D27]/15 text-[#191D27] transition-all hover:border-[#B58A62] hover:bg-[#191D27] hover:text-white"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scrollCarousel("next")}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center border border-[#191D27]/15 text-[#191D27] transition-all hover:border-[#B58A62] hover:bg-[#191D27] hover:text-white"
            >
              →
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((item) => (
            <article
              key={item.number}
              className="flex min-h-[300px] w-full shrink-0 snap-start flex-col border border-[#191D27]/10 bg-[#F9F8F5] p-6 transition-all duration-300 hover:border-[#B58A62]/50 hover:shadow-[0_15px_40px_rgba(25,29,39,0.06)] sm:w-[calc(50%-10px)] sm:p-7 lg:w-[calc(33.333%-14px)]"
            >
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <span className="font-heading text-[11px] font-semibold text-[#B58A62]">
                  / {item.number}
                </span>

                <span className="text-[9px] font-medium uppercase tracking-[1px] text-[#777A80]">
                  {item.date}
                </span>
              </div>

              {/* Stars - Demo design */}
              <div
                className="mt-8 text-[16px] tracking-[3px] text-[#B58A62]"
                aria-label="Sample five-star rating"
              >
                ★★★★★
              </div>

              {/* Review */}
              <p className="mt-5 flex-1 text-[12px] leading-[2] text-[#62666D]">
                “{item.review}”
              </p>

              {/* Client */}
              <div className="mt-7 flex items-center gap-3 border-t border-[#191D27]/10 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#191D27] font-heading text-[12px] font-semibold text-[#D1AA85]">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-[#191D27]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-[9px] text-[#777A80]">{item.role}</p>
                </div>
                <div className="ml-auto flex items-center justify-center">
                  <svg
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-label="Google"
                    role="img"
                  >
                    <path
                      fill="#4285F4"
                      d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12.8 27.7a12 12 0 0 1 0-7.4v-5.2H5.9a20 20 0 0 0 0 17.8l6.9-5.2Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.9 15.1l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"
                    />
                  </svg>
                </div>
                ƒ
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-7 flex flex-col justify-between gap-4 border-t border-[#191D27]/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-[10px] leading-6 text-[#777A80]">
            Every successful project begins with understanding and trust.
          </p>

          <Link
            href="/contact"
            className="group inline-flex w-fit items-center gap-3 text-[9px] font-semibold uppercase tracking-[1.6px] text-[#191D27] transition-colors hover:text-[#B58A62]"
          >
            Start Your Project
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              ↗
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
