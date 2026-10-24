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
const ANIMATION_OPTIONS = ["off", "on"] as const;
type AnimationOption = (typeof ANIMATION_OPTIONS)[number];
/**
 * Stage size. Width fills the run area up to {@link STAGE_MAX_WIDTH}; height
 * follows it on narrow screens so phones get a landscape-ish chart. Locked
 * for the whole run, so every library renders at exactly the same pixels.
 */
const STAGE_MAX_WIDTH = 720;
const STAGE_MAX_HEIGHT = 320;
const STAGE_MIN_HEIGHT = 220;
const STAGE_ASPECT = 0.75;
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
    <div className="flex min-w-0 flex-col gap-2 max-sm:w-full">
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
      // Phones: full width, options share it evenly instead of overflowing.
      className="max-sm:w-full"
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
          className="max-sm:min-w-0 max-sm:flex-1 max-sm:px-1"
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

function formatRunSummary(config: BenchRunConfig) {
  const unit = config.kind === "bar" ? "bars" : "points";
  return `${BENCH_KIND_LABELS[config.kind]} chart · ${config.size.toLocaleString("en-US")} ${unit} · ${config.seriesCount} series · ${config.iterations} iterations · animation ${config.animate ? "on" : "off"} · ${config.width}×${config.height}px`;
}

interface StageSize {
  width: number;
  height: number;
}

function fitStageSize(availableWidth: number): StageSize {
  const width = Math.max(1, Math.min(STAGE_MAX_WIDTH, availableWidth));
  const height = Math.round(
    Math.min(STAGE_MAX_HEIGHT, Math.max(STAGE_MIN_HEIGHT, width * STAGE_ASPECT))
  );
  return { width, height };
}

/** Stage size that fills the observed run area. */
function useStageFitSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<StageSize>(() =>
    fitStageSize(STAGE_MAX_WIDTH)
  );
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setSize(fitStageSize(Math.floor(entry.contentRect.width)));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export function BenchmarkPageClient() {
  const [kind, setKind] = useState<BenchChartKind>("line");
  const [size, setSize] = useState<number>(BENCH_SIZES.line[1] ?? 1000);
  const [seriesCount, setSeriesCount] = useState<number>(1);
  const [iterations, setIterations] = useState<number>(10);
  // Off by default: the like-for-like comparison. On adds each library's
  // default enter/update animation (TanStack via its motion() renderer).
  const [animation, setAnimation] = useState<AnimationOption>("off");
  const [libraries, setLibraries] = useState<BenchLibraryId[]>(LIBRARIES);
  const [run, setRun] = useState<RunState>(IDLE);
  const [results, setResults] = useState<BenchResult[]>([]);
  const [resultsConfig, setResultsConfig] = useState<BenchRunConfig | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const [stageAreaRef, fitSize] = useStageFitSize();
  const abortRef = useRef<AbortController | null>(null);
  const isRunning = run.status === "running";
  // Freeze the stage at the run's size so a resize mid-run can't change it.
  const stage: StageSize = isRunning && resultsConfig ? resultsConfig : fitSize;

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
      animate: animation === "on",
      width: fitSize.width,
      height: fitSize.height,
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
  }, [animation, fitSize, iterations, kind, libraries, seriesCount, size]);

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
        Charts mount in the live run area at {stage.width}×{stage.height}px
        (fitted to your screen, up to {STAGE_MAX_WIDTH}px wide). Keep this tab
        visible and the area on screen until the run finishes; a quiet machine
        gives steadier numbers.
      </p>
    ) : (
      <div aria-live="polite" className="flex min-w-0 items-center gap-3">
        <div
          aria-label="Benchmark progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted sm:w-40"
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

  const resultsSummary = resultsConfig ? formatRunSummary(resultsConfig) : "";

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
          description="Same seeded data, same pixel size, one chart at a time. Timed to the frame that shows the chart; enter animations are never scored."
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
              <ControlGroup label="Animation">
                <BenchOptionControl
                  disabled={isRunning}
                  format={(value) => (value === "on" ? "On" : "Off")}
                  label="Animation"
                  onChange={setAnimation}
                  options={ANIMATION_OPTIONS}
                  value={animation}
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
                {stage.width}×{stage.height}px
              </p>
            </div>
            {/* Narrow screens get a smaller stage at real pixels (never a CSS
                transform, which would change what the browser paints and
                rasterises per frame and skew paint timing). */}
            <div
              className="flex justify-center overflow-hidden rounded-lg border border-border border-dashed p-3 sm:px-6 sm:py-6"
              ref={stageAreaRef}
            >
              <div
                className="relative shrink-0"
                style={{ width: stage.width, height: stage.height }}
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
                  <Empty className="pointer-events-none absolute inset-0 px-2 py-0 sm:px-6 md:py-0">
                    <EmptyHeader>
                      <EmptyMedia className="mb-4 sm:mb-6" variant="icon">
                        <Icon name="IconDashboardFast" />
                      </EmptyMedia>
                      <EmptyTitle className="text-lg sm:text-xl">
                        {run.status === "idle"
                          ? "Ready to benchmark"
                          : "Run again to remeasure"}
                      </EmptyTitle>
                      <EmptyDescription>
                        Charts mount here one library at a time. Keep this area
                        on screen while the run is in progress.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
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
