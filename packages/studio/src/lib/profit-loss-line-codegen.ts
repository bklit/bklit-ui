import { fadeEdgesCodegen } from "@/components/controls/fade-edges-picker";
import { motionSliceFromState } from "./chart-animation";
import { curveImportName } from "./curves";
import { STUDIO_PROFIT_LOSS_DATA_KEY } from "./demo-data";
import { cssRevealAnimationCodegen } from "./motion-codegen";
import type { StudioUrlState } from "./studio-parsers";

export function profitLossLineDataSnippet(state: StudioUrlState) {
  const points = state.dataPoints;
  return `const chartData = Array.from({ length: ${points} }, (_, index) => {
  const pnl = Math.round(
    Math.sin(index / 2.5) * 800 +
      Math.cos(index / 6) * 400 +
      (index - 12) * 15
  );
  return {
    date: new Date(2024, 0, index + 1),
    ${STUDIO_PROFIT_LOSS_DATA_KEY}: pnl,
  };
});`;
}

export function profitLossLineCodegen(state: StudioUrlState) {
  const anim = `\n  ${cssRevealAnimationCodegen(state.animationDuration, motionSliceFromState(state))}`;
  const zeroDash =
    state.zeroLineStyle === "dashed"
      ? ' highlightRowStrokeDasharray="4,4"'
      : "";
  const curveName = curveImportName(state.curve);
  const fadeEdges = fadeEdgesCodegen(state.fadeEdges);

  return {
    code: `import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  ProfitLossLine,
  profitLossColor,
  resolveProfitLossTooltipLabel,
  XAxis,
} from "@bklitui/ui/charts";
import { ${curveName} } from "@visx/curve";
import { useState } from "react";

export function ProfitLossChart({ data }: { data: Record<string, unknown>[] }) {
  const [legendHoveredIndex, setLegendHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <LineChart data={data}${anim}>
        <Grid
          highlightRowStroke="${state.zeroLineStroke}"
          highlightRowStrokeWidth={${state.zeroLineStrokeWidth}}${zeroDash}
          highlightRowValues={${state.showZeroLine ? "[0]" : "undefined"}}
          horizontal
        />
        <Line
          curve={${curveName}}
          dataKey="pnl"
          ${fadeEdges}
          showHighlight={false}
          stroke="transparent"
          strokeWidth={0}
        />
        <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
          <ProfitLossLine
            curve={${curveName}}
            dataKey="pnl"
            ${fadeEdges}
            strokeWidth={${state.strokeWidth}}
          />
        </ProfitLossLegendHoverProvider>
        <XAxis />
        <ChartTooltip
          indicatorColor={(point) => profitLossColor((point.pnl as number) ?? 0)}
          rows={(point) => {
            const value = (point.pnl as number) ?? 0;
            return [{
              color: profitLossColor(value),
              label: resolveProfitLossTooltipLabel("${state.tooltipLabel}"),
              value,
            }];
          }}
          showCrosshair={${state.showCrosshair}}
          showDatePill={${state.showTooltipDatePill}}
          showDots={${state.showTooltipDots}}
        />
      </LineChart>
      {${state.showLegend} ? (
        <ProfitLossLegend
          align="${state.legendAlign}"
          hoveredIndex={legendHoveredIndex}
          onHoverChange={setLegendHoveredIndex}
        />
      ) : null}
    </div>
  );
}`,
    data: profitLossLineDataSnippet(state),
  };
}
