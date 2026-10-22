"use client";

import { Icon } from "@bklitui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  SiteDivider,
  SiteSectionHeader,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BENCH_ADAPTERS } from "./adapters";
import {
  BENCH_BUNDLE_SIZES,
  BENCH_KIND_LABELS,
  BENCH_LIBRARY_COLORS,
  readBenchEnvironment,
} from "./benchmark-format";
import { BenchFrame, BenchPanel } from "./benchmark-frame";
import { BenchmarkMethodology } from "./benchmark-methodology";
import { BenchmarkPreview } from "./benchmark-preview";
import { BenchmarkResults } from "./benchmark-results";
import { runBenchmark } from "./runner";
import {
  BENCH_SIZES,
  type BenchChartKind,
  type BenchLibraryId,
  type BenchProgress,
  type BenchResult,
  type BenchRunConfig,
  resolveInitialAnimationMs,
} from "./types";

const KINDS: BenchChartKind[] = ["line", "area", "bar", "scatter"];
const LIBRARIES: BenchLibraryId[] = ["bklit", "recharts", "tanstack"];
const SERIES_COUNTS = [1, 2, 3] as const;
const ITERATION_OPTIONS = [5, 10, 20] as const;
/** Fixed stage size: every library renders at exactly these pixels. */
const STAGE_WIDTH = 720;
const STAGE_HEIGHT = 320;
const HOVER_MOVES = 40;

interface RunState {
  status: "idle" | "running" | "done" | "cancelled" | "error";
  completedSteps: number;
  totalSteps: number;
  label: string;
  error?: string;
}

const IDLE: RunState = {
  status: "idle",
  completedSteps: 0,
  totalSteps: 0,
  label: "",
};

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}

function BenchOptionControl<T extends string | number>({
  value,
  options,
  onChange,
  format,
  disabled,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  format?: (value: T) => string;
  disabled?: boolean;
  label: string;
}) {
  return (
    <SegmentedControl
      aria-label={label}
      render={
        <RadioGroupPrimitive
          disabled={disabled}
          onValueChange={(next) => onChange(next as T)}
          value={value}
        />
      }
    >
      {options.map((option) => (
        <SegmentedControlItem
          key={option}
          render={<RadioPrimitive.Root value={option} />}
        >
          {format ? format(option) : String(option)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

function progressLabel(event: Extract<BenchProgress, { type: "start" }>) {
  const name = BENCH_ADAPTERS[event.library].name;
  if (event.phase === "warmup") {
    return `${name}: warm-up`;
  }
  if (event.phase === "animation") {
    return `${name}: enter animation (reference)`;
  }
  return `${name}: iteration ${event.iteration}`;
}

export function BenchmarkPageClient() {
  const [kind, setKind] = useState<BenchChartKind>("line");
  const [size, setSize] = useState<number>(BENCH_SIZES.line[1] ?? 1000);
  const [seriesCount, setSeriesCount] = useState<number>(1);
  const [iterations, setIterations] = useState<number>(10);
  const [libraries, setLibraries] = useState<BenchLibraryId[]>(LIBRARIES);
  const [run, setRun] = useState<RunState>(IDLE);
  const [results, setResults] = useState<BenchResult[]>([]);
  const [resultsConfig, setResultsConfig] = useState<BenchRunConfig | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isRunning = run.status === "running";

  useEffect(() => () => abortRef.current?.abort(), []);

  const changeKind = (next: BenchChartKind) => {
    // Keep the same position in the size list when switching chart type.
    const index = BENCH_SIZES[kind].indexOf(size);
    setKind(next);
    setSize(
      BENCH_SIZES[next][Math.max(0, index)] ?? BENCH_SIZES[next][0] ?? 100
    );
  };

  const toggleLibrary = (library: BenchLibraryId, enabled: boolean) => {
    setLibraries((previous) =>
      enabled
        ? LIBRARIES.filter((id) => id === library || previous.includes(id))
        : previous.filter((id) => id !== library)
    );
  };

  const start = useCallback(async () => {
    const stage = stageRef.current;
    const runLibraries = libraries.filter(
      (id) => BENCH_ADAPTERS[id].charts[kind]
    );
    if (!stage || runLibraries.length === 0) {
      return;
    }
    const config: BenchRunConfig = {
      kind,
      size,
      seriesCount,
      libraries: runLibraries,
      iterations,
      hoverMoves: HOVER_MOVES,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    };
    const controller = new AbortController();
    abortRef.current = controller;
    // Commit synchronously so the idle placeholder is unmounted before the
    // runner mounts its first chart.
    flushSync(() => {
      setResults([]);
      setResultsConfig(config);
      setCopied(false);
      setRun({
        status: "running",
        completedSteps: 0,
        // Per library: one warm-up, the measured iterations, one animation pass.
        totalSteps: runLibraries.length * (iterations + 2),
        label: "Starting…",
      });
    });

    try {
      // Off-screen charts may skip paint, which would skew timings.
      stage.scrollIntoView({ behavior: "instant", block: "center" });
      const final = await runBenchmark(
        config,
        stage,
        (event) => {
          if (event.type === "start") {
            setRun((previous) => ({
              ...previous,
              completedSteps: Math.min(
                previous.totalSteps,
                previous.completedSteps + 1
              ),
              label: progressLabel(event),
            }));
          } else if (event.type === "result") {
            setResults((previous) => [
              ...previous.filter((r) => r.library !== event.result.library),
              event.result,
            ]);
          }
        },
        controller.signal
      );
      if (controller.signal.aborted) {
        setRun((previous) => ({
          ...previous,
          status: "cancelled",
          label: "Cancelled",
        }));
        return;
      }
      setResults(final);
      setRun((previous) => ({
        ...previous,
        status: "done",
        completedSteps: previous.totalSteps,
        label: "Done",
      }));
    } catch (error) {
      const isAbort =
        error instanceof DOMException && error.name === "AbortError";
      if (isAbort || controller.signal.aborted) {
        setRun((previous) => ({
          ...previous,
          status: "cancelled",
          label: "Cancelled",
        }));
        return;
      }
      setRun((previous) => ({
        ...previous,
        status: "error",
        label: "Failed",
        error: error instanceof Error ? error.message : String(error),
      }));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [iterations, kind, libraries, seriesCount, size]);

  const cancel = () => abortRef.current?.abort();

  const copyResults = async () => {
    const payload = {
      config: resultsConfig,
      environment: readBenchEnvironment(),
      libraries: Object.fromEntries(
        (resultsConfig?.libraries ?? []).map((id) => [
          id,
          {
            name: BENCH_ADAPTERS[id].name,
            version: BENCH_ADAPTERS[id].version,
            initialAnimationMs: resolveInitialAnimationMs(
              BENCH_ADAPTERS[id],
              resultsConfig?.kind ?? "line"
            ),
          },
        ])
      ),
      bundleSizes: BENCH_BUNDLE_SIZES,
      results,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const percent =
    run.totalSteps > 0
      ? Math.round((run.completedSteps / run.totalSteps) * 100)
      : 0;

  const runAction = isRunning ? (
    <Button onClick={cancel} size="sm" variant="outline">
      Cancel
    </Button>
  ) : (
    <Button disabled={libraries.length === 0} onClick={start} size="sm">
      Run benchmark
    </Button>
  );

  const runFooter =
    run.status === "idle" ? (
      <p>
        Charts mount in the live run area at a fixed {STAGE_WIDTH}×
        {STAGE_HEIGHT}px. Keep this tab visible and the area on screen until the
        run finishes; a quiet machine gives steadier numbers.
      </p>
    ) : (
      <div aria-live="polite" className="flex min-w-0 items-center gap-3">
        <div
          aria-label="Benchmark progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="h-1.5 w-40 shrink-0 overflow-hidden rounded-full bg-muted"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="truncate">
          {run.label}
          {run.error ? `: ${run.error}` : ""}
        </span>
      </div>
    );

  const resultsSummary = resultsConfig
    ? `${BENCH_KIND_LABELS[resultsConfig.kind]} chart · ${resultsConfig.size.toLocaleString("en-US")} ${resultsConfig.kind === "bar" ? "bars" : "points"} · ${resultsConfig.seriesCount} series · ${resultsConfig.iterations} iterations`
    : "";

  return (
    <>
      <section
        className={cn(
          siteContainerClassName,
          "flex flex-col gap-4 py-8 md:py-12 lg:gap-6"
        )}
      >
        <BenchFrame
          action={runAction}
          description="Same seeded data, same pixel size, one library at a time. Enter animations run but are never scored."
          footer={runFooter}
          title="Benchmark setup"
        >
          <BenchPanel variant="ghost">
            <div className="flex flex-wrap gap-x-8 gap-y-5">
              <ControlGroup label="Chart">
                <BenchOptionControl
                  disabled={isRunning}
                  format={(value) => BENCH_KIND_LABELS[value]}
                  label="Chart type"
                  onChange={changeKind}
                  options={KINDS}
                  value={kind}
                />
              </ControlGroup>
              <ControlGroup
                label={kind === "bar" ? "Bars" : "Points per series"}
              >
                <BenchOptionControl
                  disabled={isRunning}
                  format={(value) => value.toLocaleString("en-US")}
                  label="Dataset size"
                  onChange={setSize}
                  options={BENCH_SIZES[kind]}
                  value={size}
                />
              </ControlGroup>
              <ControlGroup label="Series">
                <BenchOptionControl
                  disabled={isRunning}
                  label="Series count"
                  onChange={setSeriesCount}
                  options={SERIES_COUNTS}
                  value={seriesCount}
                />
              </ControlGroup>
              <ControlGroup label="Iterations">
                <BenchOptionControl
                  disabled={isRunning}
                  label="Iterations"
                  onChange={setIterations}
                  options={ITERATION_OPTIONS}
                  value={iterations}
                />
              </ControlGroup>
              <ControlGroup label="Libraries">
                <div className="flex flex-wrap gap-4">
                  {LIBRARIES.map((library) => {
                    const adapter = BENCH_ADAPTERS[library];
                    const id = `bench-library-${library}`;
                    return (
                      <div className="flex items-center gap-2" key={library}>
                        <Switch
                          checked={libraries.includes(library)}
                          disabled={isRunning || !adapter.charts[kind]}
                          id={id}
                          onCheckedChange={(checked) =>
                            toggleLibrary(library, checked)
                          }
                        />
                        <Label
                          className="flex items-center gap-1.5"
                          htmlFor={id}
                        >
                          <span
                            aria-hidden
                            className="size-2.5 rounded-full"
                            style={{
                              background: BENCH_LIBRARY_COLORS[library],
                            }}
                          />
                          {adapter.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </ControlGroup>
            </div>
          </BenchPanel>
          <BenchPanel className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-semibold text-sm">
                <Icon
                  className="size-4 text-muted-foreground"
                  name="IconPlayCircle"
                />
                Live run area
              </p>
              <p className="font-mono text-muted-foreground text-xs">
                {STAGE_WIDTH}×{STAGE_HEIGHT}px
              </p>
            </div>
            {/* Scrolls (never scales) on narrow screens: a CSS transform would
                change what the browser paints and rasterises per frame, which
                skews paint timing. */}
            <div className="overflow-x-auto rounded-lg border border-border border-dashed">
              <div className="flex w-max min-w-full justify-center py-6">
                <div
                  className="relative shrink-0"
                  style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
                >
                  <section
                    aria-label="Benchmark stage"
                    className="absolute inset-0"
                    ref={stageRef}
                  />
                  {/* Idle placeholder: a sibling of the stage, unmounted for
                      the whole run so it adds no DOM, animation or main-thread
                      work to the measurements. */}
                  {isRunning ? null : (
                    <Empty className="pointer-events-none absolute inset-0 py-0 md:py-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Icon name="IconDashboardFast" />
                        </EmptyMedia>
                        <EmptyTitle>
                          {run.status === "idle"
                            ? "Ready to benchmark"
                            : "Run again to remeasure"}
                        </EmptyTitle>
                        <EmptyDescription>
                          Charts mount here one library at a time. Keep this
                          area on screen while the run is in progress.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>
            </div>
          </BenchPanel>
        </BenchFrame>
        {results.length > 0 ? (
          <BenchmarkResults
            action={
              isRunning ? null : (
                <Button onClick={copyResults} size="xs" variant="outline">
                  {copied ? "Copied" : "Copy results as JSON"}
                </Button>
              )
            }
            results={LIBRARIES.flatMap((id) =>
              results.filter((r) => r.library === id)
            )}
            summary={resultsSummary}
          />
        ) : (
          <BenchFrame
            description="Scores appear here once a run finishes, one card per metric."
            title="No results yet"
          >
            <BenchPanel className="py-12 text-center text-muted-foreground text-sm">
              Press Run benchmark above. Results come from your device, so run
              it a few times and compare.
            </BenchPanel>
          </BenchFrame>
        )}
      </section>

      <SiteDivider />

      <section
        className={cn(
          siteContainerClassName,
          "flex flex-col gap-6 py-8 md:py-12"
        )}
      >
        <SiteSectionHeader
          description="The same chart type and data in each library, so you can check they're comparable."
          title="What's being compared"
        />
        <BenchmarkPreview kind={kind} seriesCount={seriesCount} />
      </section>

      <SiteDivider />

      <section
        className={cn(
          siteContainerClassName,
          "flex flex-col gap-6 py-8 md:py-12"
        )}
      >
        <SiteSectionHeader
          description="What each number means, when timing stops, and how each library was set up."
          title="Methodology"
        />
        <BenchmarkMethodology />
      </section>
    </>
  );
}
