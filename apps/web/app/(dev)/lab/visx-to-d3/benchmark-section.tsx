"use client";

import {
  type ProfilerOnRenderCallback,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type BenchStageDriver,
  type ProfilerCommit,
  type RunRecord,
  runBenchmark,
} from "./bench/run-benchmark";
import { delay, nextFrame } from "./bench/settle";
import { summarize } from "./bench/summary";
import { BenchmarkResults } from "./benchmark-results";
import {
  BenchmarkStage,
  type StageContent,
  stageScale,
} from "./benchmark-stage";
import type { LabChartSlug, LabTarget } from "./fixtures";
import { ChoiceControl, Section } from "./lab-controls";

const COPY_OPTIONS = [
  { value: "1", label: "1 copy" },
  { value: "8", label: "8 copies" },
  { value: "24", label: "24 copies" },
] as const;

type CopiesValue = (typeof COPY_OPTIONS)[number]["value"];

export interface BenchmarkConfig {
  chart: LabChartSlug;
  variant: string;
  iterations: number;
  copies: number;
  hover: boolean;
}

export interface BenchmarkOutcome {
  config: BenchmarkConfig;
  records: RunRecord[];
  startedAt: string;
  durationMs: number;
  cancelled: boolean;
}

export function BenchmarkSection({ target }: { target: LabTarget }) {
  const [iterations, setIterations] = useState(10);
  const [copies, setCopies] = useState<CopiesValue>("1");
  const [hover, setHover] = useState(false);
  const [running, setRunning] = useState(false);
  const [scale, setScale] = useState(1);
  const [progress, setProgress] = useState("");
  const [content, setContent] = useState<StageContent | null>(null);
  const [outcome, setOutcome] = useState<BenchmarkOutcome | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const commitsRef = useRef<ProfilerCommit[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const onRender = useCallback<ProfilerOnRenderCallback>(
    (_id, phase, actualDuration, _base, _start, commitTime) => {
      commitsRef.current.push({ phase, actualDuration, commitTime });
    },
    []
  );

  const driver = useMemo<BenchStageDriver>(
    () => ({
      mount: (variant, runKey) => setContent({ variant, runKey }),
      unmount: () => setContent(null),
      element: () => stageRef.current,
      takeCommits: () => {
        const commits = commitsRef.current;
        commitsRef.current = [];
        return commits;
      },
    }),
    []
  );

  const run = async () => {
    const copyCount = Number(copies);
    const config: BenchmarkConfig = {
      chart: target.chart,
      variant: target.variant.id,
      iterations,
      copies: copyCount,
      hover,
    };
    const controller = new AbortController();
    abortRef.current = controller;
    setScale(stageScale(target, copyCount));
    setRunning(true);
    setProgress("Preparing…");
    // Let the overlay mount and the page go idle before the first run.
    await nextFrame();
    await nextFrame();
    await delay(300);

    const startedAt = new Date().toISOString();
    const t0 = performance.now();
    let records: RunRecord[] = [];
    try {
      records = await runBenchmark({
        driver,
        iterations,
        hover,
        signal: controller.signal,
        onProgress: (done, total, variant) => {
          setProgress(
            done < total
              ? `Run ${done + 1} / ${total} · ${variant}${done < 2 ? " (warm-up)" : ""}`
              : "Done"
          );
        },
      });
    } finally {
      setContent(null);
      setRunning(false);
      abortRef.current = null;
    }
    setOutcome({
      config,
      records,
      startedAt,
      durationMs: performance.now() - t0,
      cancelled: controller.signal.aborted,
    });
  };

  const summary = useMemo(
    () => (outcome ? summarize(outcome.records) : null),
    [outcome]
  );

  return (
    <Section
      actions={
        <>
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground text-xs" htmlFor="iters">
              Iterations
            </Label>
            <Input
              className="w-20"
              disabled={running}
              id="iters"
              max={100}
              min={1}
              nativeInput
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                if (Number.isFinite(next)) {
                  setIterations(Math.min(100, Math.max(1, Math.round(next))));
                }
              }}
              size="sm"
              type="number"
              value={iterations}
            />
          </div>
          <ChoiceControl
            disabled={running}
            label="Copies"
            onChange={setCopies}
            options={COPY_OPTIONS}
            value={copies}
          />
          <Label className="text-muted-foreground text-xs">
            <Switch
              checked={hover}
              disabled={running}
              onCheckedChange={setHover}
            />
            Hover pass
          </Label>
          <Button disabled={running} loading={running} onClick={run} size="sm">
            Run benchmark
          </Button>
        </>
      }
      description={
        <>
          Mounts Before and After alternately, one at a time, in a full-screen
          stage. One warm-up pair is discarded, then {iterations} measured runs
          per side ({2 * (iterations + 1)} mounts).
        </>
      }
      title="Benchmark"
    >
      {running ? (
        <BenchmarkStage
          content={content}
          copies={Number(copies)}
          onCancel={() => abortRef.current?.abort()}
          onRender={onRender}
          progress={progress}
          scale={scale}
          stageRef={stageRef}
          target={target}
        />
      ) : null}
      {outcome && summary ? (
        <BenchmarkResults outcome={outcome} summary={summary} />
      ) : (
        <p className="text-muted-foreground text-sm">
          No results yet. Close other tabs and keep this one focused while it
          runs.
        </p>
      )}
    </Section>
  );
}
