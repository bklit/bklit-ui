import {
  DEFAULT_ANIMATION_EASING,
  DEFAULT_SPARKLINE_ANIMATION_DURATION_MS,
} from "@bklitui/ui/charts";
import {
  motionSliceFromState,
  studioAnimationDurationMs,
  studioAnimationEasingCss,
} from "./chart-animation";
import { getSparklineKpiData } from "./demo-data";
import { isStudioComponentVisible } from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";
import { getSeriesColorOverride } from "./studio-series-design";

const SPARKLINE_COMPONENTS = {
  line: "LineSparkline",
  area: "AreaSparkline",
  bar: "BarSparkline",
} as const;

/** Package defaults — only props that differ are emitted. */
const SPARKLINE_DEFAULTS = {
  height: 32,
  curve: "monotone",
  strokeWidth: 1.5,
  fill: "gradient",
  fillOpacity: 0.3,
  barGap: 2,
  barRadius: 1,
  inactiveOpacity: 0.4,
  crosshair: "dashed",
  springDamping: 30,
} as const;

type PropEntry = readonly [include: boolean, prop: string];

function pickProps(entries: readonly PropEntry[]): string[] {
  return entries.filter(([include]) => include).map(([, prop]) => prop);
}

function seriesProps(state: StudioUrlState): string[] {
  const variant = state.sparklineVariant;
  if (variant === "bar") {
    return pickProps([
      [
        state.sparklineBarGap !== SPARKLINE_DEFAULTS.barGap,
        `barGap={${state.sparklineBarGap}}`,
      ],
      [
        state.sparklineBarRadius !== SPARKLINE_DEFAULTS.barRadius,
        `barRadius={${state.sparklineBarRadius}}`,
      ],
      [
        state.sparklineInactiveOpacity !== SPARKLINE_DEFAULTS.inactiveOpacity,
        `inactiveOpacity={${state.sparklineInactiveOpacity}}`,
      ],
    ]);
  }
  const isArea = variant === "area";
  return pickProps([
    [
      state.sparklineCurve !== SPARKLINE_DEFAULTS.curve,
      `curve="${state.sparklineCurve}"`,
    ],
    [
      state.sparklineStrokeWidth !== SPARKLINE_DEFAULTS.strokeWidth,
      `strokeWidth={${state.sparklineStrokeWidth}}`,
    ],
    [
      isArea && state.sparklineFill !== SPARKLINE_DEFAULTS.fill,
      `fill="${state.sparklineFill}"`,
    ],
    [
      isArea && state.sparklineFillOpacity !== SPARKLINE_DEFAULTS.fillOpacity,
      `fillOpacity={${state.sparklineFillOpacity}}`,
    ],
    [state.sparklineEndDot, "endDot"],
  ]);
}

function interactionProps(state: StudioUrlState): string[] {
  const crosshairVisible = isStudioComponentVisible(
    state,
    "sparkline.crosshair"
  );
  return pickProps([
    [!crosshairVisible, "crosshair={false}"],
    [
      crosshairVisible &&
        state.sparklineCrosshair !== SPARKLINE_DEFAULTS.crosshair,
      `crosshair="${state.sparklineCrosshair}"`,
    ],
    [!isStudioComponentVisible(state, "sparkline.dot"), "dot={false}"],
    [!state.sparklineHoverSpring, "hoverTransition={false}"],
    [
      state.sparklineHoverSpring &&
        state.sparklineSpringDamping !== SPARKLINE_DEFAULTS.springDamping,
      `springConfig={{ damping: ${state.sparklineSpringDamping} }}`,
    ],
  ]);
}

function motionProps(state: StudioUrlState): string[] {
  if (!state.sparklineAnimate) {
    return ["animate={false}"];
  }
  const duration = studioAnimationDurationMs(state);
  const easing = studioAnimationEasingCss(motionSliceFromState(state));
  return pickProps([
    [
      duration !== DEFAULT_SPARKLINE_ANIMATION_DURATION_MS,
      `animationDuration={${duration}}`,
    ],
    [easing !== DEFAULT_ANIMATION_EASING, `animationEasing="${easing}"`],
  ]);
}

function sparklineProps(state: StudioUrlState): string[] {
  const color = getSeriesColorOverride(state, 0);
  return [
    "data={data}",
    'dataKey="value"',
    ...pickProps([
      [
        state.sparklineHeight !== SPARKLINE_DEFAULTS.height,
        `height={${state.sparklineHeight}}`,
      ],
      [color.length > 0, `color="${color}"`],
    ]),
    ...seriesProps(state),
    ...interactionProps(state),
    ...motionProps(state),
  ];
}

export function sparklineCodegen(state: StudioUrlState): {
  code: string;
  data: string;
} {
  const component = SPARKLINE_COMPONENTS[state.sparklineVariant];
  const props = sparklineProps(state);
  const jsx =
    props.length <= 3
      ? `<${component} ${props.join(" ")} />`
      : `<${component}\n  ${props.join("\n  ")}\n/>`;

  const rows = getSparklineKpiData(state.sparklinePoints)[1]?.data ?? [];
  const data = `const data = [\n${rows
    .map((row) => `  { value: ${row.value} },`)
    .join("\n")}\n];`;

  return {
    code: `import { ${component} } from "@bklitui/ui/charts";\n\n${jsx}`,
    data,
  };
}
