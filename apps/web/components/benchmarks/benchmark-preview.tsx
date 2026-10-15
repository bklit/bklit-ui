"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BENCH_ADAPTERS } from "./adapters";
import {
  BENCH_KIND_LABELS,
  BENCH_LIBRARY_COLORS,
  BENCH_LIBRARY_TAGLINES,
  formatMs,
} from "./benchmark-format";
import { BenchFrame, BenchPanel } from "./benchmark-frame";
import { generateBenchDataset } from "./data";
import type { BenchChartKind, BenchLibraryId } from "./types";
import { BENCH_SIZES, resolveInitialAnimationMs } from "./types";

const PREVIEW_HEIGHT = 200;
const PREVIEW_SEED = 7;
const LIBRARY_ORDER: BenchLibraryId[] = ["bklit", "recharts", "tanstack"];

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function PreviewCell({
  library,
  kind,
  seriesCount,
}: {
  library: BenchLibraryId;
  kind: BenchChartKind;
  seriesCount: number;
}) {
  const adapter = BENCH_ADAPTERS[library];
  const Chart = adapter.charts[kind];
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const data = useMemo(
    () =>
      generateBenchDataset(
        kind,
        BENCH_SIZES[kind][0] ?? 12,
        seriesCount,
        PREVIEW_SEED
      ).rows,
    [kind, seriesCount]
  );

  const enterMs = resolveInitialAnimationMs(adapter, kind);

  return (
    <BenchFrame
      description={BENCH_LIBRARY_TAGLINES[library]}
      footer={
        enterMs == null
          ? "No enter animation by default."
          : `Default enter animation: ${formatMs(enterMs)} (${BENCH_KIND_LABELS[kind].toLowerCase()} chart).`
      }
      title={
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ background: BENCH_LIBRARY_COLORS[library] }}
          />
          {adapter.name}
          <span className="font-mono font-normal text-muted-foreground text-xs">
            v{adapter.version}
          </span>
        </span>
      }
    >
      <BenchPanel className="p-3 sm:p-4">
        <div ref={ref} style={{ height: PREVIEW_HEIGHT }}>
          {Chart && width > 0 ? (
            <Chart
              animate
              data={data}
              height={PREVIEW_HEIGHT}
              key={`${kind}-${seriesCount}`}
              seriesCount={seriesCount}
              width={width}
            />
          ) : null}
          {Chart ? null : (
            <p className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No {BENCH_KIND_LABELS[kind].toLowerCase()} chart for this library.
            </p>
          )}
        </div>
      </BenchPanel>
    </BenchFrame>
  );
}

/** Side-by-side previews so readers can see the charts being compared match. */
export function BenchmarkPreview({
  kind,
  seriesCount,
}: {
  kind: BenchChartKind;
  seriesCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {LIBRARY_ORDER.map((library) => (
        <PreviewCell
          key={library}
          kind={kind}
          library={library}
          seriesCount={seriesCount}
        />
      ))}
    </div>
  );
}
