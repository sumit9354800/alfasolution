/**
 * Single-series monthly bar chart (pure SVG/HTML, no library).
 * One hue, rounded data-ends on the baseline, recessive gridlines,
 * a hover tooltip per bar, and a visually-hidden table for screen readers.
 */
export function BarChart({
  title,
  data,
  format = (n) => String(n),
}: {
  title: string;
  data: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(4, ...data.map((d) => d.value));
  const steps = 4;
  const niceMax = (() => {
    const raw = max / steps;
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
    return step * steps;
  })();
  const ticks = Array.from({ length: steps + 1 }, (_, i) => (niceMax / steps) * i);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <figure>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-slate">6-month total {format(total)}</span>
      </figcaption>
      <div className="relative mt-8 h-44" aria-hidden="true">
        {ticks.map((tick) => (
          <div key={tick} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(tick / niceMax) * 100}%` }}>
            <span className="w-12 shrink-0 -translate-y-1/2 text-right text-[0.68rem] tabular-nums text-mist">{format(tick)}</span>
            <span className={`h-px flex-1 -translate-y-1/2 ${tick === 0 ? "bg-line-strong" : "bg-line"}`} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-14 right-0 flex items-end gap-[2px]">
          {data.map((d) => (
            <div key={d.label} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className="w-[55%] max-w-9 rounded-t-[4px] bg-ink transition-colors group-hover:bg-accent"
                style={{ height: `${(d.value / niceMax) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white shadow group-hover:block">
                {d.label}: {format(d.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-14 mt-2 flex gap-[2px]" aria-hidden="true">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[0.7rem] text-slate">
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
