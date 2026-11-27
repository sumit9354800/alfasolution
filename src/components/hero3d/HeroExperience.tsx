"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { HeroScene } from "./scene";

type Props = {
  headline: string;
  subheadline?: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  stats: { value: string; label: string }[];
};

const CHAPTERS = [
  {
    step: "01",
    name: "Design",
    title: "Every screen planned around what your customers need.",
    body: "Research, structure and interface design — reviewed with you on real devices before a line of code is written.",
  },
  {
    step: "02",
    name: "Build",
    title: "Engineered to load fast, rank well and run your business.",
    body: "Websites, web apps and mobile apps with a CMS, payments and the admin tools your team uses every day.",
  },
];

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Scroll position (0–1 through the pinned section) → particle shape (0 cloud, 1 "A", 2 website). */
const shapeFor = (p: number) => smooth(0.12, 0.4, p) + smooth(0.55, 0.82, p);

/** Text opacity for the intro and the two chapters at scroll position p. */
const opacities = (p: number) => [
  1 - smooth(0.08, 0.18, p),
  smooth(0.32, 0.42, p) * (1 - smooth(0.56, 0.64, p)),
  smooth(0.76, 0.86, p),
];

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroExperience({ headline, subheadline, primary, secondary, stats }: Props) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

    let scene: HeroScene | null = null;
    let disposed = false;
    let raf = 0;

    // Scroll → chapter text + scene progress (DOM updated directly, no React re-renders).
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - stage.offsetHeight;
      const p = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
      const ops = opacities(p);
      layerRefs.current.forEach((layer, i) => {
        if (!layer) return;
        const o = ops[i];
        layer.style.opacity = String(o);
        layer.style.transform = `translate3d(0, ${(1 - o) * (i === 0 ? -28 : 28)}px, 0)`;
        layer.inert = o < 0.5;
      });
      if (railRef.current) railRef.current.style.transform = `scaleX(${p})`;
      if (cueRef.current) cueRef.current.style.opacity = String(1 - smooth(0.01, 0.06, p));
      scene?.setProgress(shapeFor(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      scene?.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };

    const resizeObserver = new ResizeObserver(() => {
      scene?.resize(stage.clientWidth, stage.clientHeight);
      onScroll();
    });
    const visibility = new IntersectionObserver(([entry]) => scene?.setActive(entry.isIntersecting && !document.hidden));
    const onVisibility = () => scene?.setActive(!document.hidden);

    // Load three.js only in the browser, after the page is interactive.
    import("./scene")
      .then(({ createHeroScene }) => {
        if (disposed) return;
        try {
          scene = createHeroScene(canvas, { mobile: window.innerWidth < 768 });
          scene.resize(stage.clientWidth, stage.clientHeight);
          canvas.style.opacity = "1";
          update();
        } catch (error) {
          // No WebGL: the gradient background and the scroll-driven text still work.
          console.warn("[hero] 3D scene unavailable", error);
        }
      })
      .catch(() => undefined);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    resizeObserver.observe(stage);
    visibility.observe(section);
    update();

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      resizeObserver.disconnect();
      visibility.disconnect();
      scene?.dispose();
    };
  }, [reduced]);

  const intro = (
    <>
      <h1 className="display-xl max-w-[14ch] text-white">{headline}</h1>
      {subheadline ? <p className="lede mt-6 max-w-xl !text-white/70">{subheadline}</p> : null}
      <div className="mt-9 flex flex-wrap gap-3">
        <Link href={primary.href} className="btn btn-primary">
          {primary.label}
        </Link>
        <Link href={secondary.href} className="btn btn-ghost-light">
          {secondary.label}
        </Link>
      </div>
      {stats.length ? (
        <dl className="mt-12 hidden max-w-lg grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-7 sm:grid sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <dt className="text-[0.8rem] leading-snug text-white/55">{stat.label}</dt>
              <dd className="order-first font-display text-3xl font-semibold tracking-tight text-accent-light">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </>
  );

  // Reduced motion: a calm, static hero with the same content.
  if (reduced) {
    return (
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_75%_40%,rgb(180_118_63/0.35),transparent_70%)]" aria-hidden="true" />
        <div className="container-site relative py-20 sm:py-28">
          {intro}
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {CHAPTERS.map((c) => (
              <div key={c.step} className="border-t border-white/15 pt-6">
                <p className="text-sm text-accent-light">{c.step} {c.name}</p>
                <h2 className="mt-2 text-2xl text-white">{c.title}</h2>
                <p className="mt-2 text-white/65">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-ink text-white" style={{ height: "400vh" }}>
      <div ref={stageRef} className="sticky top-[72px] h-[calc(100svh-72px)] overflow-hidden">
        {/* Warm glow behind the scene; visible even without WebGL */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_65%_at_72%_50%,rgb(180_118_63/0.28),transparent_70%)]" aria-hidden="true" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000" aria-hidden="true" />
        {/* Keeps text readable over the particles on small screens */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/70 via-45% to-transparent to-70% md:bg-gradient-to-r md:via-ink/20 md:via-30% md:to-60%" aria-hidden="true" />

        <div className="container-site relative grid h-full items-end pb-20 md:items-center md:pb-0">
          <div ref={(el) => { layerRefs.current[0] = el; }} className="col-start-1 row-start-1 max-w-2xl will-change-transform">
            {intro}
          </div>
          {CHAPTERS.map((c, i) => (
            <div
              key={c.step}
              ref={(el) => { layerRefs.current[i + 1] = el; }}
              className="col-start-1 row-start-1 max-w-lg opacity-0 will-change-transform"
            >
              <p className="flex items-baseline gap-3 font-display text-accent-light">
                <span className="text-sm">{c.step}</span>
                <span className="text-lg">{c.name}</span>
              </p>
              <h2 className="display-lg mt-4 text-white">{c.title}</h2>
              <p className="lede mt-5 !text-white/70">{c.body}</p>
              {i === CHAPTERS.length - 1 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primary.href} className="btn btn-primary">{primary.label}</Link>
                  <Link href="/work" className="btn btn-ghost-light">See our work</Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Journey progress */}
        <div className="container-site pointer-events-none absolute inset-x-0 bottom-6 flex items-center gap-4 text-xs text-white/50">
          <span>Idea</span>
          <div className="relative h-px flex-1 max-w-56 bg-white/15">
            <div ref={railRef} className="absolute inset-0 origin-left scale-x-0 bg-accent-light" />
          </div>
          <span>Launch</span>
          <div ref={cueRef} className="ml-auto hidden items-center gap-2 pr-16 sm:flex">
            <span>Scroll to explore</span>
            <span className="block h-6 w-px animate-pulse bg-white/40" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
