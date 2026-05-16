import type { ReactNode } from "react";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import type { StudioRenderContext } from "./render-context";
import type { StudioUrlState } from "./studio-parsers";

export type { ChartSlug } from "@/components/charts/chart-slugs";

interface NumberControlBase {
  key: keyof StudioUrlState;
  label: string;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  /** `number` = typed input; `slider` = drag (default) */
  input?: "slider" | "number";
}

export type StudioControl =
  | { type: "boolean"; key: keyof StudioUrlState; label: string }
  | ({ type: "number" } & NumberControlBase)
  | { type: "text"; key: keyof StudioUrlState; label: string }
  | {
      type: "select";
      key: keyof StudioUrlState;
      label: string;
      options: { value: string; label: string }[];
    }
  | { type: "curve"; key: keyof StudioUrlState; label: string }
  | { type: "pattern"; key: keyof StudioUrlState; label: string }
  | { type: "pieFill"; key: keyof StudioUrlState; label: string }
  | { type: "orientation"; key: keyof StudioUrlState; label: string }
  | { type: "lineCap"; key: "barLineCap"; label: string }
  | { type: "pieHoverEffect"; key: "pieHoverEffect"; label: string }
  | { type: "funnelEdges"; key: "funnelEdges"; label: string }
  | { type: "graticuleToggle"; key: "showGraticule"; label: string }
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
    } & Pick<NumberControlBase, "min" | "max" | "step">);

export interface StudioChartConfig {
  slug: ChartSlug;
  label: string;
  controls: StudioControl[];
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
  "live-line-chart": "Live Line Chart",
  "pie-chart": "Pie Chart",
  "radar-chart": "Radar Chart",
  "ring-chart": "Ring Chart",
  "sankey-chart": "Sankey Chart",
} satisfies Record<ChartSlug, string>;

export const ASPECT_RATIO_OPTIONS = [
  { value: "2 / 1", label: "2∶1" },
  { value: "16 / 9", label: "16∶9" },
  { value: "4 / 1", label: "4∶1" },
  { value: "1 / 1", label: "1∶1" },
] as const;
