"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildBaselineFile,
  fetchBaseline,
  saveBaseline,
} from "./baseline-client";
import { BaselineWireframe } from "./baseline-wireframe";
import {
  type BaselineFile,
  captureHoverSteps,
  captureInteractionSteps,
  compareToBaseline,
  type LiveStep,
  selectSteps,
  settleAndSnapshot,
  unpackSteps,
} from "./bench/baseline";
import type { ParityStep } from "./bench/parity";
import { LabProbe, LabProbeProvider } from "./bench/probe";
import { nextFrame } from "./bench/settle";
import type { LabTarget } from "./fixtures";
import { ChartPanel, ChoiceControl, Section } from "./lab-controls";
import { StepRow } from "./parity-panel";

const LABELS = ["Baseline", "Live"] as const;

type BaselineState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; file: BaselineFile };

/**
 * The live chart next to a wireframe of its recorded
 * baseline geometry, with the enter step diffed on every (re)mount and the
 * hover steps on demand. Also records this one variant.
 */
export function BaselinePreview({ target }: { target: LabTarget }) {
  const [replayKey, setReplayKey] = useState(0);
  const [baseline, setBaseline] = useState<BaselineState>({
    status: "loading",
  });
  const [liveEnter, setLiveEnter] = useState<LiveStep | null>(null);
  const [hover, setHover] = useState<ParityStep[] | "running" | null>(null);
  const [interactions, setInteractions] = useState<
    ParityStep[] | "running" | null
  >(null);
  const probeRef = useRef(new LabProbe());
  const [recording, setRecording] = useState<string | null>(null);
  const [shownStep, setShownStep] = useState("enter");
  const frameRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<Promise<LiveStep> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { chart } = target;
  const variantId = target.variant.id;

  const loadBaseline = useCallback(async () => {
    try {
      const file = await fetchBaseline(chart, variantId);
      setBaseline(file ? { status: "ready", file } : { status: "missing" });
    } catch (caught) {
      setBaseline({
        status: "error",
        message: caught instanceof Error ? caught.message : String(caught),
      });
    }
  }, [chart, variantId]);

  useEffect(() => {
    loadBaseline();
  }, [loadBaseline]);

  // Layout effect: attach the settle observer before Motion's first frame.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLiveEnter(null);
    setHover(null);
    probeRef.current.reset();
    const promise = settleAndSnapshot(
      "enter",
      "Enter",
      frame,
      undefined,
      controller.signal,
      probeRef.current
    );
    enterRef.current = promise;
    promise.then((step) => {
      if (!controller.signal.aborted) {
        setLiveEnter(step);
      }
    });
    return () => controller.abort();
  }, [replayKey]);

  const file = baseline.status === "ready" ? baseline.file : null;

  const enterComparison = useMemo(() => {
    if (!(file && liveEnter)) {
      return null;
    }
    return (
      compareToBaseline(
        { ...file, steps: file.steps.slice(0, 1) },
        { steps: [liveEnter], hoverTargetCount: 0 }
      )[0] ?? null
    );
  }, [file, liveEnter]);

  const storedSteps = useMemo(
    () => (file ? unpackSteps(file.steps) : []),
    [file]
  );
  const wireframeNodes =
    storedSteps.find((step) => step.id === shownStep)?.nodes ??
    storedSteps[0]?.nodes ??
    [];

  const runHover = async () => {
    const frame = frameRef.current;
    if (!(frame && file && liveEnter)) {
      return;
    }
    const signal = abortRef.current?.signal;
    setHover("running");
    const live = await captureHoverSteps(
      frame,
      target.hoverTargets,
      signal,
      probeRef.current
    );
    if (signal?.aborted) {
      return;
    }
    setHover(
      compareToBaseline(
        selectSteps(file, { hover: true, interactions: false }),
        {
          steps: [liveEnter, ...live.steps],
          hoverTargetCount: live.hoverTargetCount,
        }
      ).slice(1)
    );
  };

  /**
   * Remounts (fresh state) and waits for enter. Scrolls the frame into view
   * first: interaction steps hit-test with `elementFromPoint`.
   */
  const freshEnter = async (): Promise<LiveStep | null> => {
    frameRef.current?.scrollIntoView({ block: "center" });
    setReplayKey((k) => k + 1);
    await nextFrame();
    await nextFrame();
    return (await enterRef.current) ?? null;
  };

  const runInteractions = async () => {
    const frame = frameRef.current;
    const script = target.interactions;
    if (!(frame && file && script)) {
      return;
    }
    setInteractions("running");
    await document.fonts.ready;
    const enter = await freshEnter();
    const signal = abortRef.current?.signal;
    if (!enter || signal?.aborted) {
      setInteractions(null);
      return;
    }
    const steps = await captureInteractionSteps(
      frame,
      script,
      signal,
      probeRef.current
    );
    if (signal?.aborted) {
      setInteractions(null);
      return;
    }
    setInteractions(
      compareToBaseline(
        selectSteps(file, { hover: false, interactions: true }),
        { steps: [enter, ...steps], hoverTargetCount: 0 }
      ).slice(1)
    );
  };

  const record = async () => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    setRecording("Replaying…");
    await document.fonts.ready;
    const enter = await freshEnter();
    if (!enter) {
      setRecording(null);
      return;
    }
    const signal = abortRef.current?.signal;
    let steps = [enter];
    let hoverTargetCount = 0;
    if (target.hover) {
      setRecording("Hover steps…");
      const live = await captureHoverSteps(
        frame,
        target.hoverTargets,
        signal,
        probeRef.current
      );
      steps = [enter, ...live.steps];
      hoverTargetCount = live.hoverTargetCount;
    }
    if (target.interactions) {
      if (target.hover) {
        setRecording("Remounting for interactions…");
        await freshEnter();
      }
      setRecording("Interaction steps…");
      steps.push(
        ...(await captureInteractionSteps(
          frame,
          target.interactions,
          abortRef.current?.signal,
          probeRef.current
        ))
      );
    }
    try {
      await saveBaseline(
        buildBaselineFile(target, { steps, hoverTargetCount })
      );
      await loadBaseline();
      setRecording(
        steps.some((step) => step.status === "timeout")
          ? "Recorded, but a step timed out (mid-motion)"
          : "Recorded"
      );
    } catch (caught) {
      setRecording(caught instanceof Error ? caught.message : String(caught));
    }
    setHover(null);
    setInteractions(null);
  };

  const busy =
    liveEnter === null || hover === "running" || interactions === "running";
  const stepOptions = storedSteps.map((step) => ({
    value: step.id,
    label: stepOptionLabel(step.id),
  }));

  return (
    <Section
      actions={
        <Button onClick={() => setReplayKey((k) => k + 1)} size="sm">
          Replay
        </Button>
      }
      description="The live chart is diffed against its golden baseline: SVG geometry, HTML text and callback output after enter, after each hover step and after each scripted interaction step, recorded on the pre-migration visx code."
      title="Preview"
    >
      <p className="text-muted-foreground text-xs">
        <span className="font-medium text-foreground">
          {target.chartLabel} · {target.variant.label}
        </span>{" "}
        — {target.variant.exercises}. Source:{" "}
        <code>{target.variant.source}</code>
      </p>
      {target.previewOnly ? (
        <Badge className="self-start" variant="outline">
          Preview only, never recorded: {target.previewOnly}
        </Badge>
      ) : null}
      <div className="flex flex-wrap gap-6">
        <ChartPanel
          caption="Live"
          frameRef={frameRef}
          height={target.height}
          width={target.width}
        >
          <LabProbeProvider probe={probeRef.current}>
            <Fragment key={replayKey}>{target.variant.render()}</Fragment>
          </LabProbeProvider>
        </ChartPanel>
        {file ? (
          <figure className="flex flex-col gap-2">
            <figcaption className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
              Baseline wireframe
              {stepOptions.length > 1 ? (
                <ChoiceControl
                  label="Step"
                  onChange={setShownStep}
                  options={stepOptions}
                  value={shownStep}
                />
              ) : null}
            </figcaption>
            <div
              className="flex items-center justify-center overflow-hidden rounded-lg border border-dashed"
              style={{ width: file.frame.width, height: file.frame.height }}
            >
              <BaselineWireframe nodes={wireframeNodes} />
            </div>
          </figure>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium text-sm">Baseline comparison</span>
          <div className="flex flex-wrap items-center gap-2">
            {recording ? (
              <span className="text-muted-foreground text-xs">{recording}</span>
            ) : null}
            <Button
              disabled={busy || target.previewOnly !== null}
              onClick={record}
              size="xs"
              variant="outline"
            >
              Record this variant
            </Button>
            <Button
              disabled={busy || !file || !target.hover}
              loading={hover === "running"}
              onClick={runHover}
              size="xs"
              variant="outline"
            >
              Hover steps vs baseline
            </Button>
            <Button
              disabled={busy || !file || !target.interactions}
              loading={interactions === "running"}
              onClick={runInteractions}
              size="xs"
              variant="outline"
            >
              Interaction steps vs baseline
            </Button>
          </div>
        </div>
        <BaselineStatus baseline={baseline} />
        {enterComparison ? (
          <StepRow labels={LABELS} step={enterComparison} />
        ) : null}
        {file && liveEnter === null ? (
          <Badge className="self-start" variant="outline">
            Waiting for the live chart to settle…
          </Badge>
        ) : null}
        {Array.isArray(hover)
          ? hover.map((step) => (
              <StepRow key={step.id} labels={LABELS} step={step} />
            ))
          : null}
        {Array.isArray(interactions)
          ? interactions.map((step) => (
              <StepRow key={step.id} labels={LABELS} step={step} />
            ))
          : null}
      </div>
    </Section>
  );
}

function stepOptionLabel(id: string): string {
  if (id === "hover-leave") {
    return "leave";
  }
  return id.startsWith("ix-") ? id.slice(3) : id.replace("hover-", "#");
}

function BaselineStatus({ baseline }: { baseline: BaselineState }) {
  switch (baseline.status) {
    case "loading":
      return <p className="text-muted-foreground text-xs">Loading baseline…</p>;
    case "missing":
      return (
        <p className="text-muted-foreground text-xs">
          No baseline recorded for this variant yet.
        </p>
      );
    case "error":
      return (
        <p className="text-muted-foreground text-xs">
          Baselines unavailable ({baseline.message}). They are read and written
          through a dev-only route: run <code>next dev</code>.
        </p>
      );
    default:
      return (
        <p className="text-muted-foreground text-xs">
          Baseline recorded {baseline.file.recordedAt} on{" "}
          {baseline.file.machine} · {baseline.file.steps.length} steps · SVG
          numbers within 1e-4, HTML text exact with boxes within 0.5 px,
          callback output exact.
        </p>
      );
  }
}
