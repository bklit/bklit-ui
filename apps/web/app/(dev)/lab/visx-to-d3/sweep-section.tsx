"use client";

import { Fragment, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  type BaselineIndex,
  buildBaselineFile,
  fetchBaseline,
  fetchBaselineIndex,
  hasBaseline,
  saveBaseline,
} from "./baseline-client";
import {
  captureLive,
  compareToBaseline,
  type LiveStep,
} from "./bench/baseline";
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
  LAB_FIXTURES,
  type LabChartSlug,
  type LabTarget,
  populatedCharts,
  renderSide,
} from "./fixtures";
import { ChoiceControl, Section } from "./lab-controls";
import { DiffTable, StepBadge } from "./parity-panel";
import { ChartPanel } from "./preview-section";

type Scope = "all" | "current";

/** pairs: legacy Before vs After; record / compare: live vs baseline. */
type SweepMode = "pairs" | "record" | "compare";

type RowKind =
  | "pending"
  | "compared"
  | "recorded"
  | "missing"
  | "preview-only"
  | "error";

interface SweepRow {
  chart: LabChartSlug;
  variantId: string;
  variantLabel: string;
  kind: RowKind;
  enter: ParityStep | null;
  hover: ParityStep[] | null;
  /** Record mode: what was written. */
  recorded: LiveStep[] | null;
  note?: string;
}

interface StageState {
  target: LabTarget;
  /** `null`: frames sized but empty (between variants). */
  runKey: number | null;
  /** Mount Before + After (pairs) or the live chart alone. */
  pair: boolean;
}

/** Gap between variants so the previous unmount's work lands outside. */
const COOLDOWN_MS = 80;

const MODE_TITLES: Record<SweepMode, string> = {
  pairs: "Checking legacy pairs",
  record: "Recording baselines",
  compare: "Comparing to baselines",
};

const SIDE_LABELS: Record<SweepMode, readonly [string, string]> = {
  pairs: ["Before", "After"],
  record: ["Baseline", "Live"],
  compare: ["Baseline", "Live"],
};

const ENTER_SUFFIX = /enter$/;

/** Row before the run: skipped variants are final from the start. */
function initialRow(
  target: LabTarget,
  mode: SweepMode,
  index: BaselineIndex | null
): SweepRow {
  if (mode !== "pairs" && target.previewOnly) {
    return { ...emptyRow(target, "preview-only"), note: target.previewOnly };
  }
  if (
    mode === "compare" &&
    !hasBaseline(index, target.chart, target.variant.id)
  ) {
    return emptyRow(target, "missing");
  }
  return emptyRow(target);
}

function emptyRow(target: LabTarget, kind: RowKind = "pending"): SweepRow {
  return {
    chart: target.chart,
    variantId: target.variant.id,
    variantLabel: target.variant.label,
    kind,
    enter: null,
    hover: null,
    recorded: null,
  };
}

export function SweepSection({
  chart,
  onSelect,
}: {
  chart: LabChartSlug;
  onSelect: (chart: LabChartSlug, variant: string) => void;
}) {
  const [scope, setScope] = useState<Scope>("all");
  const [includeHover, setIncludeHover] = useState(true);
  const [running, setRunning] = useState<SweepMode | null>(null);
  const [mode, setMode] = useState<SweepMode>("pairs");
  const [progress, setProgress] = useState("");
  const [stage, setStage] = useState<StageState | null>(null);
  const [rows, setRows] = useState<SweepRow[]>([]);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [hoverRan, setHoverRan] = useState(false);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const charts = scope === "all" ? populatedCharts() : [chart];

  /** Sizes the empty stage for `target`, returns its frame(s). */
  const prepare = async (target: LabTarget, pair: boolean) => {
    setStage({ target, runKey: null, pair });
    await nextFrame();
    await nextFrame();
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!after || (pair && !before)) {
      throw new Error("Sweep stage is not mounted");
    }
    return { before, after };
  };

  const cooldown = async (target: LabTarget, pair: boolean) => {
    setStage({ target, runKey: null, pair });
    await nextFrame();
    await delay(COOLDOWN_MS);
  };

  const updateRow = (index: number, patch: Partial<SweepRow>) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );

  const runPair = async (
    target: LabTarget,
    index: number,
    signal: AbortSignal
  ) => {
    const { before, after } = await prepare(target, true);
    if (!before) {
      return;
    }
    const enter = await settleAndDiff(
      "enter",
      "Enter",
      before,
      after,
      () => setStage({ target, runKey: index, pair: true }),
      { signal }
    );
    let hover: ParityStep[] | null = null;
    if (includeHover && target.hover && !signal.aborted) {
      setProgress((p) => p.replace(ENTER_SUFFIX, "hover"));
      hover = await runHoverParity(before, after, target.hoverTargets, signal);
    }
    if (!signal.aborted) {
      updateRow(index, { kind: "compared", enter, hover });
    }
    await cooldown(target, true);
  };

  const capture = async (
    target: LabTarget,
    index: number,
    signal: AbortSignal,
    hover: boolean
  ) => {
    const { after } = await prepare(target, false);
    return captureLive(after, {
      signal,
      hover,
      hoverTargets: target.hoverTargets,
      mount: () => setStage({ target, runKey: index, pair: false }),
    });
  };

  const runRecord = async (
    target: LabTarget,
    index: number,
    signal: AbortSignal
  ) => {
    const live = await capture(target, index, signal, target.hover);
    if (signal.aborted) {
      return;
    }
    await saveBaseline(buildBaselineFile(target, live));
    const timeouts = live.steps.filter((step) => step.status === "timeout");
    updateRow(index, {
      kind: "recorded",
      recorded: live.steps,
      ...(timeouts.length > 0
        ? {
            note: `Recorded mid-motion: ${timeouts.map((s) => s.label).join(", ")}`,
          }
        : {}),
    });
    await cooldown(target, false);
  };

  const runCompare = async (
    target: LabTarget,
    index: number,
    signal: AbortSignal
  ) => {
    const baseline = await fetchBaseline(target.chart, target.variant.id);
    if (!baseline) {
      updateRow(index, { kind: "missing" });
      return;
    }
    const live = await capture(
      target,
      index,
      signal,
      includeHover && baseline.hover
    );
    if (signal.aborted) {
      return;
    }
    const [enter, ...hover] = compareToBaseline(
      includeHover
        ? baseline
        : { ...baseline, steps: baseline.steps.slice(0, 1) },
      live
    );
    updateRow(index, {
      kind: "compared",
      enter: enter ?? null,
      hover: baseline.hover && includeHover ? hover : null,
    });
    await cooldown(target, false);
  };

  const runners = {
    pairs: runPair,
    record: runRecord,
    compare: runCompare,
  } satisfies Record<SweepMode, unknown>;

  const runAll = async (
    nextMode: SweepMode,
    targets: LabTarget[],
    initial: SweepRow[],
    signal: AbortSignal
  ) => {
    for (const [i, target] of targets.entries()) {
      if (signal.aborted) {
        break;
      }
      if (initial[i]?.kind !== "pending") {
        continue;
      }
      setProgress(
        `${i + 1} / ${targets.length} · ${target.chartLabel} · ${target.variant.label} · enter`
      );
      try {
        await runners[nextMode](target, i, signal);
      } catch (caught) {
        updateRow(i, {
          kind: "error",
          note: caught instanceof Error ? caught.message : String(caught),
        });
      }
    }
  };

  const run = async (nextMode: SweepMode) => {
    const all = allTargets(charts);
    const targets =
      nextMode === "pairs"
        ? all.filter((t) => t.variant.kind !== "single")
        : all;
    const controller = new AbortController();
    const { signal } = controller;
    abortRef.current = controller;
    const t0 = performance.now();
    setMode(nextMode);
    setCancelled(false);
    setError(null);
    setHoverRan(includeHover);
    setRunning(nextMode);

    try {
      const index = nextMode === "compare" ? await fetchBaselineIndex() : null;
      if (nextMode !== "pairs") {
        // Text layout depends on web fonts: never record before they load.
        await document.fonts.ready;
      }
      const initial = targets.map((t) => initialRow(t, nextMode, index));
      setRows(initial);
      await runAll(nextMode, targets, initial, signal);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCancelled(signal.aborted);
      setDurationMs(performance.now() - t0);
      setStage(null);
      setRunning(null);
      abortRef.current = null;
    }
  };

  const doneCount = rows.filter((row) => row.kind !== "pending").length;

  return (
    <Section
      actions={
        <>
          <ChoiceControl
            disabled={running !== null}
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
              disabled={running !== null}
              onCheckedChange={setIncludeHover}
            />
            Hover steps
          </Label>
          <Button
            disabled={running !== null}
            loading={running === "pairs"}
            onClick={() => run("pairs")}
            size="sm"
            variant="outline"
          >
            Check legacy pairs
          </Button>
          <Button
            disabled={running !== null}
            loading={running === "record"}
            onClick={() => run("record")}
            size="sm"
            variant="outline"
          >
            Record baselines
          </Button>
          <Button
            disabled={running !== null}
            loading={running === "compare"}
            onClick={() => run("compare")}
            size="sm"
          >
            Compare to baseline
          </Button>
        </>
      }
      description={
        <>
          Walks every variant in turn, one on screen at a time. Legacy pairs:
          mounts Before + After together and diffs them. Record: settles the
          live chart, snapshots enter + hover steps and writes{" "}
          <code>_baselines/&lt;chart&gt;/&lt;variant&gt;.json</code> (dev only).
          Compare: replays the same steps on the live chart and diffs them
          against the stored baseline.
        </>
      }
      title="Sweep"
    >
      {running && stage ? (
        <SweepStage
          afterRef={afterRef}
          beforeRef={beforeRef}
          onCancel={() => abortRef.current?.abort()}
          progress={progress}
          stage={stage}
          title={MODE_TITLES[running]}
        />
      ) : null}
      {error ? <Badge variant="error">{error}</Badge> : null}
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sweep yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
            <span className="tabular-nums">
              {MODE_TITLES[mode]} · {doneCount} / {rows.length} variants
              {running ? "" : ` · ${(durationMs / 1000).toFixed(1)} s`}
              {hoverRan ? " · with hover steps" : " · enter only"}
            </span>
            <TallyBadges rows={rows} />
            {cancelled ? <Badge variant="warning">Cancelled</Badge> : null}
          </div>
          <SweepMatrix
            labels={SIDE_LABELS[mode]}
            onSelect={onSelect}
            rows={rows}
          />
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

function TallyBadges({ rows }: { rows: readonly SweepRow[] }) {
  const tally = tallyRows(rows);
  return (
    <>
      {tally.identical > 0 ? (
        <Badge variant="success">{tally.identical} identical</Badge>
      ) : null}
      {tally.recorded > 0 ? (
        <Badge variant="success">{tally.recorded} recorded</Badge>
      ) : null}
      {tally.diffs > 0 ? (
        <Badge variant="error">{tally.diffs} with diffs</Badge>
      ) : null}
      {tally.timeout > 0 ? (
        <Badge variant="warning">{tally.timeout} timed out</Badge>
      ) : null}
      {tally.missing > 0 ? (
        <Badge variant="warning">{tally.missing} missing baseline</Badge>
      ) : null}
      {tally.error > 0 ? (
        <Badge variant="error">{tally.error} errors</Badge>
      ) : null}
      {tally.previewOnly > 0 ? (
        <Badge variant="outline">{tally.previewOnly} preview only</Badge>
      ) : null}
    </>
  );
}

function tallyRows(rows: readonly SweepRow[]) {
  const tally = {
    identical: 0,
    diffs: 0,
    timeout: 0,
    recorded: 0,
    missing: 0,
    previewOnly: 0,
    error: 0,
  };
  for (const row of rows) {
    if (row.kind === "compared") {
      tally[rowVerdict(row)] += 1;
    } else if (row.kind === "recorded") {
      if (row.note) {
        tally.timeout += 1;
      } else {
        tally.recorded += 1;
      }
    } else if (row.kind === "missing") {
      tally.missing += 1;
    } else if (row.kind === "preview-only") {
      tally.previewOnly += 1;
    } else if (row.kind === "error") {
      tally.error += 1;
    }
  }
  return tally;
}

function SweepMatrix({
  rows,
  labels,
  onSelect,
}: {
  rows: SweepRow[];
  labels: readonly [string, string];
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
              Settle {labels[0].toLowerCase()} / {labels[1].toLowerCase()}
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
            const showNote =
              row.note && (row.kind === "error" || row.kind === "recorded");
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
                    <EnterCell row={row} />
                  </td>
                  <td className="px-2 py-1.5">
                    <HoverCell row={row} />
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    <SettleCell row={row} />
                  </td>
                </tr>
                {failing.length > 0 || showNote ? (
                  <tr>
                    <td className="px-2 pb-2" colSpan={5}>
                      <div className="flex flex-col gap-2">
                        {showNote ? (
                          <span
                            className={
                              row.kind === "error"
                                ? "text-red-600 dark:text-red-400"
                                : "text-amber-600 dark:text-amber-400"
                            }
                          >
                            {row.note}
                          </span>
                        ) : null}
                        {failing.map((step) => (
                          <div className="flex flex-col gap-1" key={step.id}>
                            <span className="text-muted-foreground">
                              {step.label}
                              {step.note ? ` · ${step.note}` : ""}
                            </span>
                            {step.result.identical ? null : (
                              <DiffTable labels={labels} step={step} />
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

function EnterCell({ row }: { row: SweepRow }) {
  switch (row.kind) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "missing":
      return <Badge variant="warning">Missing baseline</Badge>;
    case "preview-only":
      return (
        <span title={row.note}>
          <Badge variant="outline">Preview only</Badge>
        </span>
      );
    case "error":
      return <Badge variant="error">Error</Badge>;
    case "recorded": {
      const enter = row.recorded?.[0];
      return enter?.status === "timeout" ? (
        <Badge variant="warning">Recorded mid-motion</Badge>
      ) : (
        <Badge variant="success">Recorded</Badge>
      );
    }
    default:
      return row.enter ? <StepBadge step={row.enter} /> : null;
  }
}

function SettleCell({ row }: { row: SweepRow }) {
  if (row.kind === "recorded") {
    const enter = row.recorded?.[0];
    return enter ? `${Math.round(enter.settleMs)} ms` : "";
  }
  if (row.enter) {
    return `${Math.round(row.enter.settleMs.before)} / ${Math.round(row.enter.settleMs.after)} ms`;
  }
  return "";
}

function stepIds(ids: readonly string[]): string {
  return ids
    .map((id) => (id === "hover-leave" ? "leave" : id.replace("hover-", "#")))
    .join(" → ");
}

function HoverCell({ row }: { row: SweepRow }) {
  if (row.kind === "recorded") {
    const hover = row.recorded?.slice(1) ?? [];
    if (hover.length === 0) {
      return <span className="text-muted-foreground">none</span>;
    }
    const timeouts = hover.filter((step) => step.status === "timeout").length;
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        {timeouts > 0 ? (
          <Badge variant="warning">{timeouts} mid-motion</Badge>
        ) : (
          <Badge variant="success">{hover.length} steps</Badge>
        )}
        <span className="text-muted-foreground">
          {stepIds(hover.map((step) => step.id))}
        </span>
      </span>
    );
  }
  if (row.kind !== "compared") {
    return null;
  }
  if (row.hover === null || row.hover.length === 0) {
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
        {stepIds(row.hover.map((step) => step.id))}
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
  title,
  progress,
  beforeRef,
  afterRef,
  onCancel,
}: {
  stage: StageState;
  title: string;
  progress: string;
  beforeRef: React.Ref<HTMLDivElement>;
  afterRef: React.Ref<HTMLDivElement>;
  onCancel: () => void;
}) {
  const { target, runKey, pair } = stage;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-sm">{title}</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {progress}
          </span>
        </div>
        <Button onClick={onCancel} size="sm" variant="outline">
          Cancel
        </Button>
      </div>
      <div className="flex flex-1 flex-wrap items-start gap-6 overflow-auto p-6">
        {pair ? (
          <ChartPanel
            caption="Before · visx"
            frameRef={beforeRef}
            height={target.height}
            width={target.width}
          >
            {runKey === null ? null : (
              <Fragment key={runKey}>{renderSide(target, "before")}</Fragment>
            )}
          </ChartPanel>
        ) : null}
        <ChartPanel
          caption={pair ? "After · d3" : "Live"}
          frameRef={afterRef}
          height={target.height}
          width={target.width}
        >
          {runKey === null ? null : (
            <Fragment key={runKey}>{renderSide(target, "after")}</Fragment>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
