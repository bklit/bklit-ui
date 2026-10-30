"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ParityStep, stepVerdict } from "./bench/parity";

const MAX_ROWS = 200;
const MAX_VALUE_CHARS = 72;

function truncate(value: string | null): string {
  if (value === null) {
    return "(missing)";
  }
  return value.length > MAX_VALUE_CHARS
    ? `${value.slice(0, MAX_VALUE_CHARS)}…`
    : value;
}

function formatDelta(delta: number | null): string {
  if (delta === null) {
    return "shape";
  }
  return delta < 0.001 ? delta.toExponential(1) : delta.toFixed(3);
}

export function StepBadge({ step }: { step: ParityStep }) {
  const verdict = stepVerdict(step);
  const count = step.result.diffs.length;
  if (verdict === "timeout") {
    return (
      <Badge variant="warning">
        Timeout{count > 0 ? ` · ${count} diff${count === 1 ? "" : "s"}` : ""}
      </Badge>
    );
  }
  if (verdict === "identical") {
    return <Badge variant="success">Identical</Badge>;
  }
  if (count === 0) {
    return <Badge variant="error">Check note</Badge>;
  }
  return (
    <Badge variant="error">
      {count} difference{count === 1 ? "" : "s"}
    </Badge>
  );
}

export type HoverParityState = ParityStep[] | "running" | null;

export function ParityPanel({
  enter,
  hover,
  onRecheck,
  onHoverParity,
}: {
  /** `null` while waiting for both sides to settle after (re)mount. */
  enter: ParityStep | null;
  hover: HoverParityState;
  onRecheck: () => void;
  onHoverParity: () => void;
}) {
  const busy = enter === null || hover === "running";
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium text-sm">Geometry parity</span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={busy}
            onClick={onRecheck}
            size="xs"
            variant="outline"
          >
            Re-check now
          </Button>
          <Button
            disabled={busy}
            loading={hover === "running"}
            onClick={onHoverParity}
            size="xs"
            variant="outline"
          >
            Hover parity
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        Compares d, transform, cx/cy/r, x/y/width/height, x1–y2, points and
        inline transform of every SVG element (class names, ids and fills
        ignored; numbers within 1e-4).
      </p>
      {enter ? (
        <StepRow step={enter} />
      ) : (
        <div className="flex items-center gap-3">
          <span className="w-40 text-muted-foreground text-xs">Enter</span>
          <Badge variant="outline">Waiting for both to settle…</Badge>
        </div>
      )}
      {Array.isArray(hover)
        ? hover.map((step) => <StepRow key={step.id} step={step} />)
        : null}
      {hover === null ? (
        <p className="text-muted-foreground text-xs">
          Hover parity dispatches the same pointer events onto the first, middle
          and last hover target (slice / ring / area / link → node) of both
          sides, waits for both to settle after each step, then leaves.
        </p>
      ) : null}
    </div>
  );
}

export function StepRow({
  step,
  labels,
}: {
  step: ParityStep;
  labels?: readonly [string, string];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-40 text-muted-foreground text-xs">{step.label}</span>
        <StepBadge step={step} />
        <span className="text-muted-foreground text-xs tabular-nums">
          {step.result.beforeCount} / {step.result.afterCount} SVG elements,{" "}
          {step.result.comparedAttributes} attributes · settled{" "}
          {Math.round(step.settleMs.before)} / {Math.round(step.settleMs.after)}{" "}
          ms
        </span>
        {step.note ? <Badge variant="warning">{step.note}</Badge> : null}
      </div>
      {step.result.identical ? null : <DiffTable labels={labels} step={step} />}
    </div>
  );
}

export function DiffTable({
  step,
  labels = ["Before", "After"],
}: {
  step: ParityStep;
  /** Column headings for the two compared sides. */
  labels?: readonly [string, string];
}) {
  const rows = step.result.diffs.slice(0, MAX_ROWS);
  return (
    <div className="max-h-96 overflow-auto rounded-md border">
      <table className="w-full text-left font-mono text-xs">
        <thead className="sticky top-0 bg-muted text-muted-foreground">
          <tr>
            <th className="px-2 py-1.5 font-medium">Element</th>
            <th className="px-2 py-1.5 font-medium">Attribute</th>
            <th className="px-2 py-1.5 font-medium">{labels[0]}</th>
            <th className="px-2 py-1.5 font-medium">{labels[1]}</th>
            <th className="px-2 py-1.5 text-right font-medium">Max Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((diff) => (
            <tr
              className="border-t align-top"
              key={`${diff.path}:${diff.attribute}`}
            >
              <td className="px-2 py-1.5">{diff.path}</td>
              <td className="px-2 py-1.5">{diff.attribute}</td>
              <td className="break-all px-2 py-1.5" title={diff.before ?? ""}>
                {truncate(diff.before)}
              </td>
              <td className="break-all px-2 py-1.5" title={diff.after ?? ""}>
                {truncate(diff.after)}
              </td>
              <td className="px-2 py-1.5 text-right">
                {formatDelta(diff.maxDelta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {step.result.diffs.length > MAX_ROWS ? (
        <p className="border-t px-2 py-1.5 text-muted-foreground text-xs">
          Showing the first {MAX_ROWS} of {step.result.diffs.length}.
        </p>
      ) : null}
    </div>
  );
}
