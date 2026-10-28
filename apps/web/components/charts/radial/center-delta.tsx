const countFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Signed count with a true minus sign: "+128", "−1,204", "±0". */
export function formatCountDelta(delta: number): string {
  const rounded = Math.round(delta);
  if (rounded === 0) {
    return "±0";
  }
  return `${rounded < 0 ? "−" : "+"}${countFormat.format(Math.abs(rounded))}`;
}

/** Positive / negative chart tokens; muted when flat. */
export function deltaColor(delta: number): string {
  const rounded = Math.round(delta);
  if (rounded > 0) {
    return "var(--chart-positive)";
  }
  if (rounded < 0) {
    return "var(--chart-negative)";
  }
  return "var(--muted-foreground)";
}

/**
 * Center sub-line "<±count> <comparison>", e.g. "−1,204 vs yesterday". The
 * count is colored by sign; `delta === null` keeps the line's height but
 * hides it, so the stack doesn't jump between bins.
 */
export function CenterCountDelta({
  delta,
  comparison,
}: {
  delta: number | null;
  comparison: string;
}) {
  return (
    <span
      className="mt-[2cqw] text-[clamp(0.5625rem,6.5cqw,1.125rem)] text-muted-foreground tabular-nums"
      style={{ visibility: delta === null ? "hidden" : undefined }}
    >
      <span className="font-semibold" style={{ color: deltaColor(delta ?? 0) }}>
        {formatCountDelta(delta ?? 0)}
      </span>{" "}
      {comparison}
    </span>
  );
}
