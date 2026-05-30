"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  getStudioRecordingMarkers,
  getStudioRecordingRulerTicks,
  getStudioRecordingSegment,
  type StudioRecordingTimeline as StudioRecordingTimelineSpec,
} from "@/lib/studio-recording";
import { Button } from "@/ui/button";

function KeyframeDot({
  position,
  active,
}: {
  position: number;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all",
        active
          ? "border-background bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.55)]"
          : "border-muted-foreground/50 bg-card"
      )}
      style={{ left: `${position * 100}%` }}
    />
  );
}

function TimelineTrack({
  label,
  keyframePositions,
  activeKeyframe,
  segmentClassName,
}: {
  label: string;
  keyframePositions: number[];
  activeKeyframe: number | null;
  segmentClassName?: string;
}) {
  const sorted = [...keyframePositions].sort((a, b) => a - b);
  const segmentStart = sorted.length >= 2 ? sorted[0] : null;
  const segmentEnd = sorted.length >= 2 ? sorted.at(-1) : null;

  return (
    <motion.div className="grid grid-cols-[72px_1fr] items-center gap-3">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <motion.div className="relative h-7">
        <motion.div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-border/80" />
        {segmentStart != null &&
        segmentEnd != null &&
        segmentEnd > segmentStart &&
        segmentClassName ? (
          <motion.div
            className={cn(
              "absolute top-1/2 h-0.5 -translate-y-1/2",
              segmentClassName
            )}
            style={{
              left: `${segmentStart * 100}%`,
              width: `${(segmentEnd - segmentStart) * 100}%`,
            }}
          />
        ) : null}
        {keyframePositions.map((pos) => (
          <KeyframeDot
            active={
              activeKeyframe !== null && Math.abs(activeKeyframe - pos) < 0.025
            }
            key={`${label}-${pos}`}
            position={pos}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function activeKeyframeForSegment(
  segment: ReturnType<typeof getStudioRecordingSegment>,
  markers: ReturnType<typeof getStudioRecordingMarkers>
): number {
  switch (segment) {
    case "intro":
      return markers.start;
    case "animation":
      return markers.replay;
    case "interaction":
      return markers.animationEnd;
    default:
      return markers.interactionEnd;
  }
}

export function StudioRecordingTimeline({
  timeline,
  elapsedMs,
  phase,
  isPaused = false,
  onPause,
  onResume,
}: {
  timeline: StudioRecordingTimelineSpec;
  elapsedMs: number;
  phase: "capturing" | "encoding";
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}) {
  const progress = Math.min(1, elapsedMs / timeline.totalMs);
  const markers = useMemo(
    () => getStudioRecordingMarkers(timeline),
    [timeline]
  );
  const rulerTicks = useMemo(
    () => getStudioRecordingRulerTicks(timeline),
    [timeline]
  );
  const segment = getStudioRecordingSegment(elapsedMs, timeline);

  const tracks = useMemo(() => {
    const list: {
      label: string;
      positions: number[];
      segmentClassName?: string;
    }[] = [{ label: "delay", positions: [markers.start] }];

    list.push({
      label: "animation",
      positions: [markers.replay, markers.animationEnd],
      segmentClassName: "bg-purple-500",
    });

    if (timeline.interactionMs > 0) {
      list.push({
        label: "interaction",
        positions: [markers.animationEnd, markers.interactionEnd],
        segmentClassName: "bg-green-500",
      });
    }

    list.push({
      label: "hold",
      positions: [markers.interactionEnd, markers.end],
      segmentClassName: "bg-red-500",
    });

    return list;
  }, [markers, timeline.interactionMs]);

  const activeKeyframe = activeKeyframeForSegment(segment, markers);
  const canPause = phase === "capturing" && onPause && onResume;
  let statusLabel = "Recording";
  if (phase === "encoding") {
    statusLabel = "Encoding";
  } else if (isPaused) {
    statusLabel = "Paused";
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full shrink-0"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div className="w-full overflow-hidden rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <motion.div className="mb-3 flex items-center justify-between gap-3">
          <motion.div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-xs tracking-wide">
              {statusLabel}
            </span>
            {isPaused ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-[10px] text-amber-400">
                Timeline frozen
              </span>
            ) : null}
          </motion.div>
          <motion.div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {(elapsedMs / 1000).toFixed(1)}s /{" "}
              {(timeline.totalMs / 1000).toFixed(1)}s
            </span>
            {canPause ? (
              <Button
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
                className="size-7"
                onClick={isPaused ? onResume : onPause}
                size="icon"
                title={isPaused ? "Resume recording" : "Pause recording"}
                type="button"
                variant="outline"
              >
                {isPaused ? (
                  <PlayIcon aria-hidden className="size-3.5" />
                ) : (
                  <PauseIcon aria-hidden className="size-3.5" />
                )}
              </Button>
            ) : null}
          </motion.div>
        </motion.div>

        <motion.div className="relative mb-1 grid grid-cols-[72px_1fr] gap-3">
          <span className="text-[10px] text-muted-foreground/60"> </span>
          <motion.div className="relative h-5">
            {rulerTicks.map((tick) => (
              <span
                className={cn(
                  "absolute -translate-x-1/2 font-mono text-[9px] tabular-nums",
                  Math.abs(progress - tick.position) < 0.04
                    ? "text-foreground"
                    : "text-muted-foreground/70"
                )}
                key={`${tick.label}-${tick.position}`}
                style={{ left: `${tick.position * 100}%` }}
              >
                {tick.label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="relative space-y-1.5">
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-foreground/85"
            style={{ left: `${progress * 100}%` }}
          />

          {tracks.map((track) => (
            <TimelineTrack
              activeKeyframe={activeKeyframe}
              key={track.label}
              keyframePositions={track.positions}
              label={track.label}
              segmentClassName={track.segmentClassName}
            />
          ))}
        </motion.div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full bg-foreground/80"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
