import { FaStar } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import type { Testimonial } from "@/server/repos/content";

function Stars({ rating }: { rating: number }) {
  const value = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar key={n} size={16} aria-hidden="true" className={n <= value ? "text-[#FBBC04]" : "text-line-strong"} />
      ))}
    </div>
  );
}

/** Client testimonials. Google branding appears only on reviews whose source is Google. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-white">
      <div className="container-site py-20 sm:py-24">
        <h2 className="display-md">What clients say</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((item) => {
            const fromGoogle = item.source === "google";
            return (
              <figure key={item.id} className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-paper p-7">
                <div>
                  <div className="flex min-h-[22px] items-center justify-between gap-3">
                    {item.rating ? <Stars rating={Number(item.rating)} /> : <span />}
                    {fromGoogle ? <FcGoogle size={22} aria-label="Google review" title="Google review" /> : null}
                  </div>
                  <blockquote className="mt-4 text-[1.05rem] leading-relaxed text-ink">“{item.quote}”</blockquote>
                </div>
                <figcaption className="mt-6 flex items-end justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{item.author_name}</span>
                    <span className="block text-slate">{[item.author_role, item.company].filter(Boolean).join(", ")}</span>
                  </span>
                  {fromGoogle && item.source_url ? (
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-slate underline-offset-4 hover:text-ink hover:underline">
                      View on Google
                    </a>
                  ) : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}