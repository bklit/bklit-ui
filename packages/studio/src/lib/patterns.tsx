// biome-ignore-all lint/performance/noBarrelFile: re-export pattern preset ids for parsers and UI
"use client";

import { PatternLines } from "@bklitui/ui/charts";

export {
  PATTERN_PRESET_IDS,
  PATTERN_PRESETS,
  type PatternPresetId,
} from "@/lib/pattern-presets";

import type { PatternPresetId } from "@/lib/pattern-presets";

const STUDIO_PATTERN_ID = "studio-pattern-fill";

export function studioPatternFill(
  statePattern: PatternPresetId
): string | undefined {
  if (statePattern === "none") {
    return undefined;
  }
  return `url(#${STUDIO_PATTERN_ID})`;
}

export function StudioPatternDefs({ preset }: { preset: PatternPresetId }) {
  if (preset === "none") {
    return null;
  }

  const common = {
    id: STUDIO_PATTERN_ID,
    height: 6,
    width: 6,
    strokeWidth: 1,
  };

  switch (preset) {
    case "diagonal":
      return (
        <PatternLines
          {...common}
          orientation={["diagonal"]}
          stroke="var(--chart-1)"
        />
      );
    case "horizontal":
      return (
        <PatternLines
          {...common}
          orientation={["horizontal"]}
          stroke="var(--chart-2)"
        />
      );
    case "vertical":
      return (
        <PatternLines
          {...common}
          orientation={["vertical"]}
          stroke="var(--chart-3)"
        />
      );
    case "cross":
      return (
        <PatternLines
          {...common}
          height={8}
          orientation={["diagonal", "diagonalRightToLeft"]}
          stroke="var(--chart-1)"
          width={8}
        />
      );
    case "dots":
      return (
        <PatternLines
          {...common}
          height={4}
          orientation={["diagonal"]}
          stroke="var(--chart-4)"
          strokeWidth={2}
          width={4}
        />
      );
    case "accent":
      return (
        <PatternLines {...common} orientation={["diagonal"]} stroke="#e879f9" />
      );
    default:
      return null;
  }
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

function choroPatternOrientation(
  preset: PatternPresetId
): ("diagonal" | "horizontal" | "vertical" | "diagonalRightToLeft")[] {
  switch (preset) {
    case "horizontal":
      return ["horizontal"];
    case "vertical":
      return ["vertical"];
    case "cross":
      return ["diagonal", "diagonalRightToLeft"];
    case "dots":
      return ["diagonal"];
    default:
      return ["diagonal"];
  }
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
    <PatternLines
      height={8}
      id="studio-choro-bg"
      orientation={choroPatternOrientation(preset)}
      stroke="var(--chart-5)"
      strokeWidth={1}
      width={8}
    />
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
      {CHOROPLETH_REGIONS.map((region, index) => (
        <PatternLines
          height={6}
          id={`studio-choro-fg-${region}`}
          key={region}
          orientation={choroPatternOrientation(preset)}
          stroke={choroPatternStroke(preset, index)}
          strokeWidth={2}
          width={6}
        />
      ))}
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
  const orientations: Record<PatternPresetId, string> = {
    none: "",
    diagonal: 'orientation={["diagonal"]}',
    horizontal: 'orientation={["horizontal"]}',
    vertical: 'orientation={["vertical"]}',
    cross:
      'orientation={["diagonal", "diagonalRightToLeft"]} height={8} width={8}',
    dots: 'orientation={["diagonal"]} height={4} width={4} strokeWidth={2}',
    accent: 'orientation={["diagonal"]} stroke="#e879f9"',
  };
  let stroke = 'stroke="var(--chart-1)"';
  if (preset === "accent") {
    stroke = 'stroke="#e879f9"';
  } else if (preset === "horizontal") {
    stroke = 'stroke="var(--chart-2)"';
  } else if (preset === "vertical") {
    stroke = 'stroke="var(--chart-3)"';
  } else if (preset === "dots") {
    stroke = 'stroke="var(--chart-4)"';
  }
  return `<PatternLines id="${STUDIO_PATTERN_ID}" height={6} width={6} ${orientations[preset]} ${stroke} strokeWidth={1} />`;
}
