"use client";

import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ParityStep, runHoverParity, settleAndDiff } from "./bench/parity";
import type { LabTarget } from "./fixtures";
import { ChoiceControl, Section } from "./lab-controls";
import { type HoverParityState, ParityPanel } from "./parity-panel";

type CompareMode = "side" | "overlay" | "difference";

const MODE_OPTIONS = [
  { value: "side", label: "Side by side" },
  { value: "overlay", label: "Overlay 50%" },
  { value: "difference", label: "Difference" },
] as const satisfies readonly { value: CompareMode; label: string }[];

const MODE_HINTS: Record<CompareMode, string | null> = {
  side: null,
  overlay: "After drawn at 50% opacity on top of Before.",
  difference:
    "After blended with mix-blend-mode: difference. Matching geometry collapses into one image (opaque overlaps go black); drift shows as doubled or coloured edges.",
};

export function PreviewSection({ target }: { target: LabTarget }) {
  const [replayKey, setReplayKey] = useState(0);
  const [checkKey, setCheckKey] = useState(0);
  const [mode, setMode] = useState<CompareMode>("side");
  const [enter, setEnter] = useState<ParityStep | null>(null);
  const [hover, setHover] = useState<HoverParityState>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const hoverAbortRef = useRef<AbortController | null>(null);
  const overlaid = mode !== "side";

  // Layout effect: runs right after the (re)mount commit, before Motion's
  // first animation frame, so the observers see every enter mutation.
  useLayoutEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!(before && after)) {
      return;
    }
    const controller = new AbortController();
    hoverAbortRef.current?.abort();
    setEnter(null);
    setHover(null);
    settleAndDiff("enter", "Enter", before, after, undefined, {
      signal: controller.signal,
    }).then((step) => {
      if (!controller.signal.aborted) {
        setEnter(step);
      }
    });
    return () => controller.abort();
  }, [replayKey, checkKey]);

  const replay = useCallback(() => setReplayKey((k) => k + 1), []);

  const runHover = useCallback(async () => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!(before && after)) {
      return;
    }
    const controller = new AbortController();
    hoverAbortRef.current = controller;
    setHover("running");
    const steps = await runHoverParity(
      before,
      after,
      target.hoverTargets,
      controller.signal
    );
    if (!controller.signal.aborted) {
      setHover(steps);
    }
  }, [target]);

  return (
    <Section
      actions={
        <>
          <ChoiceControl
            label="Compare"
            onChange={setMode}
            options={MODE_OPTIONS}
            value={mode}
          />
          <Button onClick={replay} size="sm">
            Replay both
          </Button>
        </>
      }
      description={
        MODE_HINTS[mode] ??
        "Replay remounts both sides in the same commit (shared key), so enter animations start together."
      }
      title="Preview"
    >
      <p className="text-muted-foreground text-xs">
        <span className="font-medium text-foreground">
          {target.chartLabel} · {target.variant.label}
        </span>{" "}
        — {target.variant.exercises}. Source:{" "}
        <code>{target.variant.source}</code>
      </p>
      <div
        className={cn(
          overlaid ? "relative isolate self-start" : "flex flex-wrap gap-6"
        )}
        style={
          overlaid ? { width: target.width, height: target.height } : undefined
        }
      >
        <ChartPanel
          caption="Before · visx"
          className={overlaid ? "absolute inset-0" : undefined}
          frameRef={beforeRef}
          height={target.height}
          hideCaption={overlaid}
          width={target.width}
        >
          <Fragment key={replayKey}>{target.render("before")}</Fragment>
        </ChartPanel>
        <ChartPanel
          caption="After · d3"
          className={cn(
            overlaid && "absolute inset-0",
            mode === "overlay" && "opacity-50",
            mode === "difference" && "mix-blend-difference"
          )}
          frameClassName={overlaid ? "border-transparent" : undefined}
          frameRef={afterRef}
          height={target.height}
          hideCaption={overlaid}
          transparent={overlaid}
          width={target.width}
        >
          <Fragment key={replayKey}>{target.render("after")}</Fragment>
        </ChartPanel>
      </div>
      <ParityPanel
        enter={enter}
        hover={hover}
        onHoverParity={runHover}
        onRecheck={() => setCheckKey((k) => k + 1)}
      />
    </Section>
  );
}

export function ChartPanel({
  caption,
  hideCaption,
  width,
  height,
  frameRef,
  className,
  frameClassName,
  transparent,
  children,
}: {
  caption: string;
  hideCaption?: boolean;
  width: number;
  height: number;
  frameRef: React.Ref<HTMLDivElement>;
  className?: string;
  frameClassName?: string;
  transparent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <figcaption
        className={cn(
          "font-medium text-muted-foreground text-xs",
          hideCaption && "hidden"
        )}
      >
        {caption}
      </figcaption>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-lg border",
          transparent ? "bg-transparent" : "bg-background",
          frameClassName
        )}
        ref={frameRef}
        style={{ width, height }}
      >
        <div className="w-full">{children}</div>
      </div>
    </figure>
  );
}
