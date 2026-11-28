/**
 * Single-series monthly bar chart (pure HTML/CSS, no library).
 * The latest month is highlighted in the accent colour and labelled;
 * every other month shows its value on hover or keyboard focus.
 * A visually-hidden table carries the data for screen readers.
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
    const step =
      [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
    return step * steps;
  })();
  const ticks = Array.from(
    { length: steps + 1 },
    (_, i) => (niceMax / steps) * i,
  );
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const latest = data.at(-1);
  const previous = data.at(-2);
  const change =
    latest && previous && previous.value > 0
      ? Math.round(((latest.value - previous.value) / previous.value) * 100)
      : null;

  return (
    <figure>
      <figcaption className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
            {format(total)}
          </p>
          <p className="text-xs text-slate">Last {data.length} months</p>
        </div>
        {latest ? (
          <div className="text-right">
            <p className="text-xs text-slate">This month ({latest.label})</p>
            <p className="text-sm font-semibold tabular-nums">
              {format(latest.value)}
              {change !== null ? (
                <span className="ml-1.5 font-normal text-slate">
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% vs{" "}
                  {previous?.label}
                </span>
              ) : null}
            </p>
          </div>
        ) : null}
      </figcaption>

      <div className="relative mt-7 h-48 sm:h-52" aria-hidden="true">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute inset-x-0 flex translate-y-1/2 items-center gap-2"
            style={{ bottom: `${(tick / niceMax) * 100}%` }}
          >
            <span className="w-9 shrink-0 text-right text-[0.66rem] tabular-nums text-mist sm:w-11">
              {format(tick)}
            </span>
            <span
              className={`h-px flex-1 ${tick === 0 ? "bg-line-strong" : "border-t border-dashed border-line bg-transparent"}`}
            />
          </div>
        ))}

        <div className="absolute inset-y-0 left-11 right-0 flex items-end sm:left-[3.25rem]">
          {data.map((d, i) => {
            const isLatest = i === data.length - 1;
            const height = (d.value / niceMax) * 100;
            return (
              <div
                key={d.label}
                className="group relative flex h-full flex-1 items-end justify-center px-[3px]"
              >
                {/* Hover track */}
                <span className="absolute inset-x-[3px] inset-y-0 rounded-md bg-paper opacity-0 transition-opacity group-hover:opacity-100" />
                <div
                  className={`relative w-[58%] max-w-10 rounded-t-md transition-[filter] group-hover:brightness-110 ${
                    isLatest
                      ? "bg-gradient-to-t from-accent to-accent-light"
                      : "bg-gradient-to-t from-ink to-[#3a4150]"
                  }`}
                  style={{
                    height: `${height}%`,
                    minHeight: d.value > 0 ? 3 : 0,
                  }}
                >
                  <span
                    className={`absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold tabular-nums transition-opacity ${
                      isLatest && d.value > 0
                        ? "text-accent-deep opacity-100"
                        : "bg-ink text-white opacity-0 shadow group-hover:opacity-100"
                    }`}
                  >
                    {format(d.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ml-11 mt-2.5 flex sm:ml-[3.25rem]" aria-hidden="true">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`flex-1 text-center text-[0.7rem] ${i === data.length - 1 ? "font-semibold text-ink" : "text-slate"}`}
          >
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
