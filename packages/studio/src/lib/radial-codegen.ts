import {
  fallbackPullRequestDayData,
  PULL_REQUEST_FALLBACK_NOW_INDEX,
  PULL_REQUEST_SPIKE_INDEX,
  pullRequestBinEndLabel,
  pullRequestSeries,
} from "./radial-demo-data";
import { isStudioComponentVisible } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";
import {
  getEffectiveSeriesColor,
  getSeriesPattern,
} from "./studio-series-design";

/** Package defaults — only props that differ are emitted. */
const RADIAL_DEFAULTS = {
  rows: 14,
  dotSize: 0.44,
  dotLayout: "grid",
  fadedOpacity: 0.2,
  scrubberVariant: "solid",
} as const;

type PropEntry = readonly [include: boolean, prop: string];

function pickProps(entries: readonly PropEntry[]): string {
  const props = entries.filter(([include]) => include).map(([, p]) => p);
  return props.length > 0 ? ` ${props.join(" ")}` : "";
}

function seriesCode(state: StudioUrlState): string {
  const rows = pullRequestSeries
    .map((s, index) => {
      if (!isStudioComponentVisible(state, `radial.series.${index}`)) {
        return null;
      }
      const extras = [
        s.rampFrom === undefined ? "" : `, rampFrom: ${s.rampFrom}`,
        s.emphasize ? ", emphasize: true" : "",
      ].join("");
      return `  { dataKey: "${s.dataKey}", label: "${s.label}", color: "${getEffectiveSeriesColor(state, index)}"${extras} },`;
    })
    .filter((row) => row !== null);
  return `const series = [\n${rows.join("\n")}\n];`;
}

function patternsProp(state: StudioUrlState): string | null {
  const entries = pullRequestSeries.flatMap((s, index) => {
    const preset = getSeriesPattern(state, index);
    return preset === "none" ? [] : [`${s.dataKey}: "${preset}"`];
  });
  return entries.length > 0 ? `patterns={{ ${entries.join(", ")} }}` : null;
}

const CENTER_CODE = `  <RadialCenter>
    {({ datum, isFuture, totals, values, label }) => {
      // Today vs yesterday over the same bins: a count, not a rate
      let merged = totals.merged;
      let delta = merged - yesterdayMergedSoFar;
      let caption = "merged by ${pullRequestBinEndLabel(PULL_REQUEST_FALLBACK_NOW_INDEX)}";
      if (datum) {
        merged = isFuture ? datum.yesterdayMerged : values.merged;
        delta = isFuture ? null : merged - datum.yesterdayMerged;
        caption = isFuture ? \`merged at \${label} yesterday\` : \`merged at \${label}\`;
      }
      return (
        <>
          <ChartStatFlow value={merged} label={caption} />
          {delta !== null && (
            <span style={{ color: delta < 0 ? "var(--chart-negative)" : "var(--chart-positive)" }}>
              {delta < 0 ? "−" : "+"}
              {Math.abs(delta).toLocaleString()} vs yesterday
            </span>
          )}
        </>
      );
    }}
  </RadialCenter>`;

export function radialCodegen(state: StudioUrlState): {
  code: string;
  data: string;
} {
  const visible = (id: string) => isStudioComponentVisible(state, id);
  const showAxis = visible("radial.axis");
  const showDotBar = visible("radial.dotBar");
  const showScrubber = visible("radial.scrubber");
  const showCenter = visible("radial.center");
  const showLegend = state.showLegend && visible("radial.legend");
  const draftColor = getEffectiveSeriesColor(state, 2);

  const imports = [
    showCenter ? "ChartStatFlow" : null,
    showAxis ? "RadialAxis" : null,
    showCenter ? "RadialCenter" : null,
    "RadialChart",
    showDotBar ? "RadialDotBar" : null,
    showLegend ? "RadialLegend" : null,
    showScrubber ? "RadialScrubber" : null,
  ].filter((name) => name !== null);

  const axisProps = pickProps([
    [state.radialCenterGradient, "centerGradient"],
    [!state.radialAxisCircle, "showCircle={false}"],
  ]);
  const dotBarProps = pickProps([
    [state.radialGhost, 'ghostDataKey="yesterday"'],
    [
      state.radialAnnotations,
      `annotations={[{ index: ${PULL_REQUEST_SPIKE_INDEX}, label: "02:14", color: "${draftColor}" }]}`,
    ],
    [state.radialRows !== RADIAL_DEFAULTS.rows, `rows={${state.radialRows}}`],
    [
      state.radialDotSize !== RADIAL_DEFAULTS.dotSize,
      `dotSize={${state.radialDotSize}}`,
    ],
    [
      state.radialDotLayout !== RADIAL_DEFAULTS.dotLayout,
      `layout="${state.radialDotLayout}"`,
    ],
    [
      state.radialFadedOpacity !== RADIAL_DEFAULTS.fadedOpacity,
      `fadedOpacity={${state.radialFadedOpacity}}`,
    ],
    [patternsProp(state) !== null, patternsProp(state) ?? ""],
  ]);
  const scrubberProps = pickProps([
    [
      state.radialScrubberVariant !== RADIAL_DEFAULTS.scrubberVariant,
      `variant="${state.radialScrubberVariant}"`,
    ],
  ]);
  const legendProps = pickProps([
    [!state.radialLegendValues, "showValues={false}"],
  ]);

  const children = [
    showAxis ? `  <RadialAxis${axisProps} />` : null,
    showDotBar ? `  <RadialDotBar${dotBarProps} />` : null,
    showScrubber ? `  <RadialScrubber${scrubberProps} />` : null,
    showCenter ? CENTER_CODE : null,
    showLegend ? `  <RadialLegend${legendProps} />` : null,
  ].filter((line) => line !== null);

  const code = `import { ${imports.join(", ")} } from "@bklitui/ui/charts";

${seriesCode(state)}

<RadialChart data={chartData} xDataKey="time" series={series}>
${children.join("\n")}
</RadialChart>`;

  // A fixed 14:15 snapshot (not the preview's live local time) so the
  // generated code is deterministic and copy-pasteable.
  const rows = fallbackPullRequestDayData.map((d) => `  ${JSON.stringify(d)},`);
  const data = `// 96 × 15-minute bins, clockwise from 00:00, as of 14:15. Bins after "now"
// have null counts and are drawn as ghost dots from \`yesterday\`.
const chartData = [
${rows.join("\n")}
];

// Yesterday's merged PRs over the bins that have data today
const yesterdayMergedSoFar = chartData
  .filter((d) => d.merged !== null)
  .reduce((total, d) => total + d.yesterdayMerged, 0);`;

  return { code, data };
}
