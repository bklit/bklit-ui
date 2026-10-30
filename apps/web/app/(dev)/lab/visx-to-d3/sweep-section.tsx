"use client";

import { Fragment, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  combinedVerdict,
  diffCount,
  type ParityStep,
  runHoverParity,
  type StepVerdict,
  settleAndDiff,
} from "./bench/parity";
import { delay, nextFrame } from "./bench/settle";
import {
  allTargets,
  LAB_CHART_SLUGS,
  LAB_FIXTURES,
  type LabChartSlug,
  type LabTarget,
} from "./fixtures";
import { ChoiceControl, Section } from "./lab-controls";
import { DiffTable, StepBadge } from "./parity-panel";
import { ChartPanel } from "./preview-section";

type Scope = "all" | "current";

interface SweepRow {
  chart: LabChartSlug;
  variantId: string;
  variantLabel: string;
  /** `null` until this variant has run. */
  enter: ParityStep | null;
  hover: ParityStep[] | null;
}

interface StageState {
  target: LabTarget;
  /** `null`: frames sized but empty (between variants). */
  runKey: number | null;
}

/** Gap between variants so the previous unmount's work lands outside. */
const COOLDOWN_MS = 80;

export function SweepSection({
  chart,
  onSelect,
}: {
  chart: LabChartSlug;
  onSelect: (chart: LabChartSlug, variant: string) => void;
}) {
  const [scope, setScope] = useState<Scope>("all");
  const [includeHover, setIncludeHover] = useState(true);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [stage, setStage] = useState<StageState | null>(null);
  const [rows, setRows] = useState<SweepRow[]>([]);
  const [cancelled, setCancelled] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [hoverRan, setHoverRan] = useState(false);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    const targets = allTargets(scope === "all" ? LAB_CHART_SLUGS : [chart]);
    const controller = new AbortController();
    const { signal } = controller;
    abortRef.current = controller;
    const t0 = performance.now();
    setCancelled(false);
    setHoverRan(includeHover);
    setRows(
      targets.map((t) => ({
        chart: t.chart,
        variantId: t.variant.id,
        variantLabel: t.variant.label,
        enter: null,
        hover: null,
      }))
    );
    setRunning(true);

    try {
      for (const [i, target] of targets.entries()) {
        if (signal.aborted) {
          break;
        }
        const name = `${target.chartLabel} · ${target.variant.label}`;
        const counter = `${i + 1} / ${targets.length}`;
        setProgress(`${counter} · ${name} · enter`);
        // Size the empty frames for this variant first.
        setStage({ target, runKey: null });
        await nextFrame();
        await nextFrame();
        const before = beforeRef.current;
        const after = afterRef.current;
        if (!(before && after)) {
          throw new Error("Sweep stage is not mounted");
        }

        const enter = await settleAndDiff(
          "enter",
          "Enter",
          before,
          after,
          () => setStage({ target, runKey: i }),
          { signal }
        );
        let hover: ParityStep[] | null = null;
        if (includeHover && !signal.aborted) {
          setProgress(`${counter} · ${name} · hover`);
          hover = await runHoverParity(
            before,
            after,
            target.hoverTargets,
            signal
          );
        }
        if (signal.aborted) {
          break;
        }
        setRows((prev) =>
          prev.map((row, index) =>
            index === i ? { ...row, enter, hover } : row
          )
        );
        setStage({ target, runKey: null });
        await nextFrame();
        await delay(COOLDOWN_MS);
      }
    } finally {
      setCancelled(signal.aborted);
      setDurationMs(performance.now() - t0);
      setStage(null);
      setRunning(false);
      abortRef.current = null;
    }
  };

  const done = rows.filter((row) => row.enter !== null);
  const tally = { identical: 0, diffs: 0, timeout: 0 };
  for (const row of done) {
    tally[rowVerdict(row)] += 1;
  }

  return (
    <Section
      actions={
        <>
          <ChoiceControl
            disabled={running}
            label="Scope"
            onChange={setScope}
            options={[
              { value: "all", label: "All charts" },
              { value: "current", label: `${LAB_FIXTURES[chart].label} only` },
            ]}
            value={scope}
          />
          <Label className="text-muted-foreground text-xs">
            <Switch
              checked={includeHover}
              disabled={running}
              onCheckedChange={setIncludeHover}
            />
            Hover parity
          </Label>
          <Button disabled={running} loading={running} onClick={run} size="sm">
            Check all variants
          </Button>
        </>
      }
      description="Walks every variant in turn: mounts Before + After together, waits for both to settle, diffs geometry, then (optionally) runs the hover-parity steps. Sequential, one variant on screen at a time."
      title="Sweep"
    >
      {running && stage ? (
        <SweepStage
          afterRef={afterRef}
          beforeRef={beforeRef}
          onCancel={() => abortRef.current?.abort()}
          progress={progress}
          stage={stage}
        />
      ) : null}
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sweep yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span className="tabular-nums">
              {done.length} / {rows.length} variants
              {running ? "" : ` · ${(durationMs / 1000).toFixed(1)} s`}
              {hoverRan ? " · with hover parity" : " · enter only"}
            </span>
            <Badge variant="success">{tally.identical} identical</Badge>
            {tally.diffs > 0 ? (
              <Badge variant="error">{tally.diffs} with diffs</Badge>
            ) : null}
            {tally.timeout > 0 ? (
              <Badge variant="warning">{tally.timeout} timed out</Badge>
            ) : null}
            {cancelled ? <Badge variant="warning">Cancelled</Badge> : null}
          </div>
          <SweepMatrix onSelect={onSelect} rows={rows} />
        </div>
      )}
    </Section>
  );
}

function rowVerdict(row: SweepRow): StepVerdict {
  return combinedVerdict([
    ...(row.enter ? [row.enter] : []),
    ...(row.hover ?? []),
  ]);
}

function SweepMatrix({
  rows,
  onSelect,
}: {
  rows: SweepRow[];
  onSelect: (chart: LabChartSlug, variant: string) => void;
}) {
  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-2 py-1.5 font-medium">Chart</th>
            <th className="px-2 py-1.5 font-medium">Variant</th>
            <th className="px-2 py-1.5 font-medium">Enter</th>
            <th className="px-2 py-1.5 font-medium">Hover steps</th>
            <th className="px-2 py-1.5 text-right font-medium">
              Settle before / after
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const firstOfChart = rows[index - 1]?.chart !== row.chart;
            const failing = [
              ...(row.enter ? [row.enter] : []),
              ...(row.hover ?? []),
            ].filter((step) => !step.result.identical || step.note);
            return (
              <Fragment key={`${row.chart}:${row.variantId}`}>
                <tr
                  className={cn(
                    "align-top",
                    firstOfChart ? "border-t-2" : "border-t"
                  )}
                >
                  <td className="px-2 py-1.5 font-medium">
                    {firstOfChart ? LAB_FIXTURES[row.chart].label : ""}
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      className="text-left underline-offset-2 hover:underline"
                      onClick={() => onSelect(row.chart, row.variantId)}
                      type="button"
                    >
                      {row.variantLabel}{" "}
                      <span className="font-mono text-muted-foreground">
                        {row.variantId}
                      </span>
                    </button>
                  </td>
                  <td className="px-2 py-1.5">
                    {row.enter ? (
                      <StepBadge step={row.enter} />
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <HoverCell row={row} />
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {row.enter
                      ? `${Math.round(row.enter.settleMs.before)} / ${Math.round(row.enter.settleMs.after)} ms`
                      : ""}
                  </td>
                </tr>
                {failing.length > 0 ? (
                  <tr>
                    <td className="px-2 pb-2" colSpan={5}>
                      <div className="flex flex-col gap-2">
                        {failing.map((step) => (
                          <div className="flex flex-col gap-1" key={step.id}>
                            <span className="text-muted-foreground">
                              {step.label}
                              {step.note ? ` · ${step.note}` : ""}
                            </span>
                            {step.result.identical ? null : (
                              <DiffTable step={step} />
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HoverCell({ row }: { row: SweepRow }) {
  if (row.enter === null) {
    return null;
  }
  if (row.hover === null) {
    return <span className="text-muted-foreground">skipped</span>;
  }
  const verdict = combinedVerdict(row.hover);
  const count = diffCount(row.hover);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {verdict === "identical" ? (
        <Badge variant="success">Identical</Badge>
      ) : null}
      {verdict === "diffs" ? (
        <Badge variant="error">
          {count > 0 ? `${count} diffs` : "Check note"}
        </Badge>
      ) : null}
      {verdict === "timeout" ? <Badge variant="warning">Timeout</Badge> : null}
      <span className="text-muted-foreground">
        {row.hover
          .map((step) =>
            step.id === "hover-leave" ? "leave" : step.id.replace("hover-", "#")
          )
          .join(" → ")}
      </span>
    </span>
  );
}

/**
 * Full-viewport overlay the sweep mounts each variant into (on screen and
 * composited, like the benchmark stage, so Motion runs at real frame rate).
 */
function SweepStage({
  stage,
  progress,
  beforeRef,
  afterRef,
  onCancel,
}: {
  stage: StageState;
  progress: string;
  beforeRef: React.Ref<HTMLDivElement>;
  afterRef: React.Ref<HTMLDivElement>;
  onCancel: () => void;
}) {
  const { target, runKey } = stage;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-sm">Checking all variants</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {progress}
          </span>
        </div>
        <Button onClick={onCancel} size="sm" variant="outline">
          Cancel
        </Button>
      </div>
      <div className="flex flex-1 flex-wrap items-start gap-6 overflow-auto p-6">
        <ChartPanel
          caption="Before · visx"
          frameRef={beforeRef}
          height={target.height}
          width={target.width}
        >
          {runKey === null ? null : (
            <Fragment key={runKey}>{target.render("before")}</Fragment>
          )}
        </ChartPanel>
        <ChartPanel
          caption="After · d3"
          frameRef={afterRef}
          height={target.height}
          width={target.width}
        >
          {runKey === null ? null : (
            <Fragment key={runKey}>{target.render("after")}</Fragment>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
