// biome-ignore-all lint/performance/noBarrelFile: re-export pattern preset ids for parsers and UI
"use client";

import { PatternLines, renderPatternPreset } from "@bklitui/ui/charts";
import { Fragment } from "react";

export {
  PATTERN_PRESET_IDS,
  PATTERN_PRESETS,
  type PatternPresetId,
} from "@/lib/pattern-presets";

import type { PatternPresetId } from "@/lib/pattern-presets";

const STUDIO_PATTERN_ID = "studio-pattern-fill";

export function studioPatternIdForSeries(seriesIndex: number) {
  return seriesIndex === 0
    ? STUDIO_PATTERN_ID
    : `${STUDIO_PATTERN_ID}-${seriesIndex}`;
}

export function studioPatternFill(
  statePattern: PatternPresetId,
  seriesIndex = 0
): string | undefined {
  if (statePattern === "none") {
    return undefined;
  }
  return `url(#${studioPatternIdForSeries(seriesIndex)})`;
}

function patternNodeForPreset(
  preset: PatternPresetId,
  id: string,
  strokeVar: string
) {
  const node = renderPatternPreset(preset, id, {
    color: preset === "accent" ? "#e879f9" : strokeVar,
    scale: preset === "cross" ? 1.33 : 1,
    strokeWidth: preset === "circles" ? 1 : undefined,
  });
  if (!node) {
    return null;
  }
  return <Fragment key={id}>{node}</Fragment>;
}

export function StudioPatternDefs({
  preset,
  seriesPatterns,
}: {
  preset?: PatternPresetId;
  seriesPatterns?: PatternPresetId[];
}) {
  let entries: PatternPresetId[] = [];
  if (seriesPatterns && seriesPatterns.length > 0) {
    entries = seriesPatterns;
  } else if (preset) {
    entries = [preset];
  }

  const nodes = entries.flatMap((entry, index) => {
    if (entry === "none") {
      return [];
    }
    const strokeVar = `var(${`--chart-${(index % 5) + 1}`})`;
    const id = studioPatternIdForSeries(index);
    const node = patternNodeForPreset(entry, id, strokeVar);
    return node ? [node] : [];
  });

  if (nodes.length === 0) {
    return null;
  }

  return <>{nodes}</>;
}

/** Per-slice line patterns (matches pie chart docs example). */
const PIE_SLICE_LINE_PATTERNS = [
  {
    id: "studio-pie-p0",
    orientation: ["diagonal"] as const,
    stroke: "var(--chart-1)",
    width: 6,
    height: 6,
  },
  {
    id: "studio-pie-p1",
    orientation: ["horizontal"] as const,
    stroke: "var(--chart-2)",
    width: 6,
    height: 6,
  },
  {
    id: "studio-pie-p2",
    orientation: ["vertical"] as const,
    stroke: "var(--chart-3)",
    width: 6,
    height: 6,
  },
  {
    id: "studio-pie-p3",
    orientation: ["diagonalRightToLeft"] as const,
    stroke: "var(--chart-4)",
    width: 8,
    height: 8,
  },
  {
    id: "studio-pie-p4",
    orientation: ["diagonal"] as const,
    stroke: "var(--chart-5)",
    width: 6,
    height: 6,
  },
] as const;

/** Direct PatternLines children for PieChart defs (no wrapper — PieChart only hoists Pattern* nodes). */
export function studioPiePatternDefs(sliceCount: number) {
  return Array.from({ length: sliceCount }, (_, index) => {
    const cfg = PIE_SLICE_LINE_PATTERNS[
      index % PIE_SLICE_LINE_PATTERNS.length
    ] as (typeof PIE_SLICE_LINE_PATTERNS)[number];
    const id = `studio-pie-p${index}`;
    return (
      <PatternLines
        height={cfg.height}
        id={id}
        key={id}
        orientation={[...cfg.orientation]}
        stroke={cfg.stroke}
        strokeWidth={1}
        width={cfg.width}
      />
    );
  });
}

export function studioPieSlicePatternFill(index: number): string {
  return `url(#studio-pie-p${index})`;
}

const CHOROPLETH_REGIONS = [
  "americas",
  "europe",
  "asia",
  "africa",
  "oceania",
] as const;

function choroPatternStroke(
  preset: PatternPresetId,
  regionIndex: number
): string {
  if (preset === "accent") {
    return "#e879f9";
  }
  const chartVars = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  return chartVars[regionIndex % chartVars.length] ?? "var(--chart-1)";
}

export function StudioChoroplethBgPattern({
  preset,
}: {
  preset: PatternPresetId;
}) {
  if (preset === "none") {
    return null;
  }
  return (
    <>
      {renderPatternPreset(preset, "studio-choro-bg", {
        color: "var(--chart-5)",
        scale: preset === "cross" ? 1.33 : 1,
        strokeWidth: 1,
      })}
    </>
  );
}

export function StudioChoroplethFgPatterns({
  preset,
}: {
  preset: PatternPresetId;
}) {
  if (preset === "none") {
    return null;
  }
  return (
    <>
      {CHOROPLETH_REGIONS.map((region, index) => {
        const node = renderPatternPreset(preset, `studio-choro-fg-${region}`, {
          color: choroPatternStroke(preset, index),
          strokeWidth: 2,
        });
        return node ? <Fragment key={region}>{node}</Fragment> : null;
      })}
    </>
  );
}

export function studioChoroplethFgPatternId(
  countryName: string | undefined
): string | null {
  if (!countryName) {
    return null;
  }
  const c = countryName.charAt(0).toUpperCase();
  if ("ABCD".includes(c)) {
    return "studio-choro-fg-americas";
  }
  if ("EFGH".includes(c)) {
    return "studio-choro-fg-europe";
  }
  if ("IJKLM".includes(c)) {
    return "studio-choro-fg-asia";
  }
  if ("NOPQR".includes(c)) {
    return "studio-choro-fg-africa";
  }
  return "studio-choro-fg-oceania";
}

export function patternCodegenBlock(preset: PatternPresetId): string {
  if (preset === "none") {
    return "";
  }
  if (preset === "dots") {
    return `<PatternCircles id="${STUDIO_PATTERN_ID}" height={10} width={10} fill="var(--chart-4)" radius={1.5} />`;
  }
  if (preset === "circles") {
    return `<PatternCircles id="${STUDIO_PATTERN_ID}" height={6} width={6} stroke="var(--chart-1)" strokeWidth={1} radius={2} />`;
  }
  const orientations: Record<PatternPresetId, string> = {
    none: "",
    diagonal: 'orientation={["diagonal"]}',
    horizontal: 'orientation={["horizontal"]}',
    vertical: 'orientation={["vertical"]}',
    cross:
      'orientation={["diagonal", "diagonalRightToLeft"]} height={8} width={8}',
    dots: "",
    circles: "",
    accent: 'orientation={["diagonal"]} stroke="#e879f9"',
  };
  let stroke = 'stroke="var(--chart-1)"';
  if (preset === "accent") {
    stroke = 'stroke="#e879f9"';
  } else if (preset === "horizontal") {
    stroke = 'stroke="var(--chart-2)"';
  } else if (preset === "vertical") {
    stroke = 'stroke="var(--chart-3)"';
  }
  return `<PatternLines id="${STUDIO_PATTERN_ID}" height={6} width={6} ${orientations[preset]} ${stroke} strokeWidth={1} />`;
}
