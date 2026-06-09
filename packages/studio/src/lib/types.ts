import type { ReactNode } from "react";
import type { ChartSlug } from "@/chart-slugs";
import type { StudioRenderContext } from "./render-context";
import type { StudioUrlState } from "./studio-parsers";

export type { ChartSlug } from "@/chart-slugs";

export type NumberControlPreview = "ringWidth" | "ringGap" | "ringScale";

export interface StudioControlVisibilityRule {
  key: keyof StudioUrlState;
  equals?: string | readonly string[];
  not?: string | readonly string[];
  /** When set, the state value must be truthy / falsy. */
  truthy?: boolean;
}

export interface StudioControlVisibility {
  /** Show this control only when all rules match. */
  visibleWhen?: StudioControlVisibilityRule | StudioControlVisibilityRule[];
}

interface NumberControlBase {
  key: keyof StudioUrlState;
  label: string;
  min: number;
  max: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  unit?: string;
  /** `number` = typed input; `slider` = drag (default) */
  input?: "slider" | "number";
  /** Live SVG preview while dragging (ring chart controls). */
  preview?: NumberControlPreview;
  /** Disable when the referenced URL state value is truthy. */
  disabledWhen?: keyof StudioUrlState;
}

interface SeriesScopedControl {
  /** When set, read/write a pipe-encoded per-series override for this control. */
  seriesIndex?: number;
}

export type StudioControl = StudioControlVisibility &
  (
    | ({
        type: "boolean";
        key: keyof StudioUrlState;
        label: string;
      } & SeriesScopedControl)
    | {
        type: "color";
        key: keyof StudioUrlState;
        label: string;
        /** Disable when the referenced URL state value is falsy. */
        enabledWhen?: keyof StudioUrlState;
      }
    | ({ type: "number" } & NumberControlBase & SeriesScopedControl)
    | ({
        type: "text";
        key: keyof StudioUrlState;
        label: string;
      } & SeriesScopedControl)
    | {
        type: "select";
        key: keyof StudioUrlState;
        label: string;
        options: { value: string; label: string }[];
      }
    | ({
        type: "curve";
        key: keyof StudioUrlState;
        label: string;
      } & SeriesScopedControl)
    | {
        type: "pattern";
        key: keyof StudioUrlState;
        label: string;
        /** Disable when the referenced URL state value is falsy. */
        enabledWhen?: keyof StudioUrlState;
      }
    | { type: "pieFill"; key: keyof StudioUrlState; label: string }
    | { type: "orientation"; key: keyof StudioUrlState; label: string }
    | { type: "lineCap"; key: "barLineCap"; label: string }
    | { type: "pieHoverEffect"; key: "pieHoverEffect"; label: string }
    | { type: "funnelEdges"; key: "funnelEdges"; label: string }
    | ({
        type: "fadeEdges";
        key: "fadeEdges";
        label: string;
      } & SeriesScopedControl)
    | { type: "graticuleToggle"; key: "showGraticule"; label: string }
    | {
        type: "strokeStyle";
        key: keyof StudioUrlState;
        label: string;
      }
    | {
        type: "crosshairFade";
        key: keyof StudioUrlState;
        label: string;
      }
    | { type: "legendPosition"; key: "legendPlacement"; label: string }
    | ({
        type: "innerRadius";
        key: keyof StudioUrlState;
        label: string;
      } & Pick<NumberControlBase, "min" | "max" | "step">)
    | ({
        type: "angle";
        key: keyof StudioUrlState;
        label: string;
        variant?: "gauge" | "pieStart" | "pieEnd";
      } & Pick<NumberControlBase, "min" | "max">)
    | ({
        type: "opacity";
        key: keyof StudioUrlState;
        label: string;
        color: string;
        secondaryColor?: string;
      } & Pick<NumberControlBase, "min" | "max" | "step">)
    | {
        type: "lineSeriesYAxis";
        key: "lineSeriesYAxes";
        label: string;
        seriesIndex: number;
      }
    | {
        type: "lineYAxisNumTicks";
        key: "lineYAxisNumTicks";
        label: string;
        axis: "left" | "right";
      }
    | {
        type: "lineYAxisFormatLarge";
        key: "lineYAxisFormatLarge";
        label: string;
        axis: "left" | "right";
      }
  );

export interface StudioControlGroup {
  title: string;
  controls: StudioControl[];
}

export type StudioComponentKind =
  | "chart"
  | "data"
  | "series"
  | "text"
  | "geometry"
  | "line";

/** Optional icon override in the components tree (matches chart JSX where useful). */
export type StudioComponentTreeIcon =
  | "pie-chart"
  | "funnel"
  | "line-chart"
  | "area-chart"
  | "layers";

export interface StudioComponentDesign {
  /** Which series index this fill/pattern applies to (default 0). */
  seriesIndex?: number;
  supportsPattern?: boolean;
  /** Show global palette presets (default: seriesIndex 0 or unset). */
  showPalette?: boolean;
  /** When set, FillPicker reads/writes this URL key instead of series colors. */
  accentKey?: keyof StudioUrlState;
  /** FillPicker label when `accentKey` is used. Default: "Fill". */
  colorLabel?: string;
}

export interface StudioComponentDefinition {
  id: string;
  label: string;
  parentId?: string;
  kind?: StudioComponentKind;
  /** Lucide-style tree icon; falls back to `kind` when omitted. */
  treeIcon?: StudioComponentTreeIcon;
  /** Render a color swatch instead of an icon (segment rows). */
  listMarker?: "icon" | "color-dot";
  /** CSS color for `listMarker="color-dot"` (resolved when the tree is built). */
  swatchColor?: string;
  controlGroups: StudioControlGroup[];
  design?: StudioComponentDesign;
}

export interface StudioChartConfig {
  slug: ChartSlug;
  label: string;
  /** Flat list — used when `controlGroups` is omitted */
  controls: StudioControl[];
  /** Grouped sidebar sections (takes precedence over `controls` in the studio UI) */
  controlGroups?: StudioControlGroup[];
  /** Dynamic control groups based on current studio state (e.g. line chart mode). */
  resolveControlGroups?: (state: StudioUrlState) => StudioControlGroup[];
  /** Layer tree for the components panel; falls back to one component per control group. */
  resolveComponents?: (state: StudioUrlState) => StudioComponentDefinition[];
  /** When true, sidebar shows the motion spline editor at the top. */
  motionPanel?: boolean;
  /** Show stagger scale slider in Motion (gauge, radar, funnel). */
  motionStagger?: boolean;
  /** Show scramble-data button in the components panel. Default true. */
  scrambleData?: boolean;
  supportsPatterns?: boolean;
  supportsCurves?: boolean;
  render: (state: StudioUrlState, ctx: StudioRenderContext) => ReactNode;
  generateCode: (state: StudioUrlState) => { code: string; data?: string };
}

export const chartLabels = {
  "area-chart": "Area Chart",
  "bar-chart": "Bar Chart",
  "candlestick-chart": "Candlestick Chart",
  "choropleth-chart": "Choropleth Chart",
  "composed-chart": "Composed Chart",
  "funnel-chart": "Funnel Chart",
  "gauge-chart": "Gauge",
  "line-chart": "Line Chart",
  "profit-loss-line": "Profit/Loss Line",
  "live-line-chart": "Live Line Chart",
  "pie-chart": "Pie Chart",
  "radar-chart": "Radar Chart",
  "ring-chart": "Ring Chart",
  "scatter-chart": "Scatter Chart",
  "sankey-chart": "Sankey Chart",
} satisfies Record<ChartSlug, string>;

export const ASPECT_RATIO_OPTIONS = [
  { value: "2 / 1", label: "2∶1" },
  { value: "16 / 9", label: "16∶9" },
  { value: "4 / 1", label: "4∶1" },
  { value: "1 / 1", label: "1∶1" },
] as const;
