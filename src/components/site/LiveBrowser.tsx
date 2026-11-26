"use client";

import Image from "next/image";
import { canOptimizeImage } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2, Minimize2, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";

export type PreviewSite = {
  slug: string;
  title: string;
  url: string;
  cover: string | null;
  embeddable: boolean;
};

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTH: Record<Device, number> = { desktop: 1366, tablet: 820, mobile: 390 };
const DEVICE_HEIGHT: Record<Device, number> = { desktop: 854, tablet: 1100, mobile: 780 };

type Props = {
  sites: PreviewSite[];
  initial?: number;
  /** "hero": poster first, iframe loads after idle. "full": iframe loads when visible. */
  variant?: "hero" | "full" | "card";
  showSwitcher?: boolean;
  showDevices?: boolean;
  height?: number;
  /** Responsive height classes for the frame, e.g. "h-[460px] sm:h-[560px]". */
  frameClassName?: string;
  className?: string;
};

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * A real, interactive browser frame showing a live client website.
 * Falls back to the project's screenshot when the site forbids embedding,
 * and always offers "open in new tab".
 */
export function LiveBrowser({ sites, initial = 0, variant = "full", showSwitcher = false, showDevices = true, height, frameClassName = "", className = "" }: Props) {
  const [index, setIndex] = useState(initial);
  const [device, setDevice] = useState<Device>("desktop");
  const [armed, setArmed] = useState(variant !== "hero"); // whether the iframe may load
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(variant !== "card");

  const frameRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const site = sites[index];

  // On phones, a scaled-down desktop site is unreadable — start in mobile view.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 767px)").matches) setDevice("mobile");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Hero: show the screenshot first, then load the live site once the page is idle.
  useEffect(() => {
    if (variant !== "hero") return;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const arm = () => setArmed(true);
    const id = idle ? idle(arm, { timeout: 2500 }) : window.setTimeout(arm, 1500);
    return () => {
      if (!idle) window.clearTimeout(id);
    };
  }, [variant]);

  // Cards: only load iframes that scroll into view.
  useEffect(() => {
    if (variant !== "card" || !frameRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [variant]);

  // Scale the virtual device viewport to fit the frame.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => {
      const width = element.clientWidth;
      const heightAvailable = element.clientHeight;
      const target = DEVICE_WIDTH[device];
      const byWidth = width / target;
      const byHeight = device === "desktop" ? Infinity : heightAvailable / DEVICE_HEIGHT[device];
      setScale(Math.min(1, byWidth, byHeight));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [device, fullscreen]);

  // Reset load state whenever the page in the frame changes.
  const [lastKey, setLastKey] = useState(`${index}-${reloadKey}`);
  if (lastKey !== `${index}-${reloadKey}`) {
    setLastKey(`${index}-${reloadKey}`);
    setLoaded(false);
    setSlow(false);
  }

  useEffect(() => {
    if (loaded || !armed || !visible || !site?.embeddable) return;
    const timer = window.setTimeout(() => setSlow(true), 9000);
    return () => window.clearTimeout(timer);
  }, [loaded, armed, visible, site, index, reloadKey]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = frameRef.current;
    if (!element) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (element.requestFullscreen) await element.requestFullscreen();
      else window.open(site.url, "_blank", "noopener");
    } catch {
      window.open(site.url, "_blank", "noopener");
    }
  }, [site]);

  if (!site) return null;
  const showIframe = site.embeddable && armed && visible;
  const vw = DEVICE_WIDTH[device];
  const vh = device === "desktop" ? undefined : DEVICE_HEIGHT[device];

  return (
    <div className={className}>
      {showSwitcher && sites.length > 1 ? (
        <div role="tablist" aria-label="Choose a live project" className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {sites.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                setIndex(i);
                setArmed(true);
              }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.85rem] transition-colors ${
                i === index ? "border-ink bg-ink text-white" : "border-line bg-white text-slate hover:border-line-strong hover:text-ink"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={frameRef}
        className={`flex flex-col overflow-hidden rounded-[var(--radius-frame)] border border-line bg-white shadow-[0_24px_60px_-28px_rgb(25_29_39/0.35)] ${frameClassName} ${
          fullscreen ? "!rounded-none" : ""
        }`}
        style={{ height: fullscreen ? "100vh" : height }}
      >
        {/* Browser chrome */}
        <div className="flex h-11 shrink-0 items-center gap-3 border-b border-line bg-[#fbfbfc] px-3.5">
          <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-white px-2.5 py-1 text-[0.8rem] text-slate ring-1 ring-line">
            {site.embeddable ? <span className="live-dot shrink-0" aria-hidden="true" /> : null}
            <span className="truncate">{hostOf(site.url)}</span>
            <span className="sr-only">{site.embeddable ? "Live website" : "Screenshot"}</span>
          </div>
          <div className="flex items-center gap-0.5 text-slate">
            {showDevices && site.embeddable ? (
              <div className="mr-1 hidden items-center gap-0.5 md:flex" role="group" aria-label="Preview size">
                {(
                  [
                    ["desktop", Monitor, "Desktop"],
                    ["tablet", Tablet, "Tablet"],
                    ["mobile", Smartphone, "Mobile"],
                  ] as const
                ).map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setDevice(value);
                      setArmed(true);
                    }}
                    aria-pressed={device === value}
                    aria-label={`${label} view`}
                    title={`${label} view`}
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${device === value ? "bg-ink text-white" : "hover:bg-paper hover:text-ink"}`}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            ) : null}
            {site.embeddable ? (
              <button type="button" onClick={() => { setArmed(true); setReloadKey((k) => k + 1); }} aria-label="Reload preview" title="Reload" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-paper hover:text-ink">
                <RotateCw size={15} />
              </button>
            ) : null}
            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Full screen preview"} title="Full screen" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-paper hover:text-ink">
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${site.title} in a new tab`} title="Open in new tab" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-paper hover:text-ink">
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Viewport */}
        <div ref={viewportRef} className={`relative min-h-0 flex-1 overflow-hidden ${device === "desktop" ? "bg-white" : "bg-paper"}`} style={{ minHeight: height || frameClassName ? undefined : 320 }}>
          {/* Poster (screenshot) — shown until the live site has loaded, and as the fallback */}
          {site.cover && (!showIframe || !loaded) ? (
            <Image src={site.cover} alt={`${site.title} — homepage`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover object-top" priority={variant === "hero"} unoptimized={!canOptimizeImage(site.cover)} />
          ) : null}

          {showIframe ? (
            <div
              className="absolute left-1/2 top-0 origin-top"
              style={{
                width: vw,
                height: vh ?? `${100 / scale}%`,
                transform: `translateX(-50%) scale(${scale})`,
                marginTop: device === "desktop" ? 0 : 16,
              }}
            >
              <iframe
                key={`${site.slug}-${reloadKey}`}
                src={site.url}
                title={`Live preview of ${site.title}`}
                className={`h-full w-full border-0 bg-white transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${device !== "desktop" ? "rounded-[18px] shadow-xl ring-1 ring-line" : ""}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                onLoad={() => setLoaded(true)}
              />
            </div>
          ) : null}

          {!site.embeddable ? (
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink/90 px-4 py-3 text-sm text-white backdrop-blur">
              <span>This website doesn’t allow previews inside other pages.</span>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-light underline underline-offset-4">
                Visit the live site
              </a>
            </div>
          ) : slow && !loaded ? (
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink/90 px-4 py-3 text-sm text-white backdrop-blur">
              <span>The live site is taking a while to load.</span>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-light underline underline-offset-4">
                Open it in a new tab
              </a>
            </div>
          ) : null}

          {!site.cover && !showIframe && site.embeddable ? (
            <button type="button" onClick={() => setArmed(true)} className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate">
              Load live preview
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
