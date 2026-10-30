"use client";

import { Profiler, type ProfilerOnRenderCallback } from "react";
import { Button } from "@/components/ui/button";
import { type LabSide, type LabTarget, renderSide } from "./fixtures";

export interface StageContent {
  variant: LabSide;
  runKey: number;
}

const GAP = 16;
/** Room for the overlay header + padding. */
const CHROME_HEIGHT = 140;
const CHROME_WIDTH = 48;

function columnsFor(copies: number): number {
  if (copies <= 1) {
    return 1;
  }
  return copies <= 8 ? 4 : 6;
}

/** Scale that fits the copy grid inside the viewport (layout size unchanged). */
export function stageScale(target: LabTarget, copies: number): number {
  const cols = columnsFor(copies);
  const rows = Math.ceil(copies / cols);
  const width = cols * target.width + (cols - 1) * GAP;
  const height = rows * target.height + (rows - 1) * GAP;
  return Math.min(
    1,
    (window.innerWidth - CHROME_WIDTH) / width,
    (window.innerHeight - CHROME_HEIGHT) / height
  );
}

/**
 * Full-viewport overlay the benchmark mounts each run into. It is on screen
 * and composited (not `display: none`, not off-viewport), so every run pays
 * for real style, layout, paint and raster, and hit testing works for the
 * hover pass. The grid is CSS-scaled to fit, which changes raster size but not
 * layout or React work. Only one variant is ever mounted at a time.
 */
export function BenchmarkStage({
  target,
  copies,
  scale,
  content,
  progress,
  stageRef,
  onRender,
  onCancel,
}: {
  target: LabTarget;
  copies: number;
  scale: number;
  content: StageContent | null;
  progress: string;
  stageRef: React.Ref<HTMLDivElement>;
  onRender: ProfilerOnRenderCallback;
  onCancel: () => void;
}) {
  const cols = columnsFor(copies);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            Benchmarking {target.chartLabel} · {target.variant.label} · {copies}{" "}
            {copies === 1 ? "copy" : "copies"}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {progress}
          </span>
        </div>
        <Button onClick={onCancel} size="sm" variant="outline">
          Cancel
        </Button>
      </div>
      <div className="flex-1 overflow-hidden p-6">
        <div
          className="grid origin-top-left"
          ref={stageRef}
          style={{
            gap: GAP,
            gridTemplateColumns: `repeat(${cols}, ${target.width}px)`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
          }}
        >
          {content ? (
            <Profiler id="bench" key={content.runKey} onRender={onRender}>
              {Array.from({ length: copies }, (_, i) => (
                <div
                  className="flex items-center justify-center overflow-hidden rounded-lg border"
                  key={i}
                  style={{ width: target.width, height: target.height }}
                >
                  <div className="w-full">
                    {renderSide(target, content.variant)}
                  </div>
                </div>
              ))}
            </Profiler>
          ) : null}
        </div>
      </div>
    </div>
  );
}
