"use client";

function formatUsd(v: number) {
  return `$${v.toFixed(2)}`;
}

export function CandlestickTooltipDemo({
  point,
}: {
  point: Record<string, unknown>;
  index: number;
}) {
  const date = point.date instanceof Date ? point.date : new Date();
  const open = (point.open as number) ?? 0;
  const high = (point.high as number) ?? 0;
  const low = (point.low as number) ?? 0;
  const close = (point.close as number) ?? 0;

  return (
    <div className="px-3 py-2.5">
      <div className="mb-1.5 font-medium text-chart-tooltip-foreground text-xs opacity-60">
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        <span className="text-chart-tooltip-muted">Open</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {formatUsd(open)}
        </span>
        <span className="text-chart-tooltip-muted">High</span>
        <span className="text-emerald-600 tabular-nums dark:text-emerald-400">
          {formatUsd(high)}
        </span>
        <span className="text-chart-tooltip-muted">Low</span>
        <span className="text-red-600 tabular-nums dark:text-red-400">
          {formatUsd(low)}
        </span>
        <span className="text-chart-tooltip-muted">Close</span>
        <span className="text-chart-tooltip-foreground tabular-nums">
          {formatUsd(close)}
        </span>
      </div>
    </div>
  );
}
