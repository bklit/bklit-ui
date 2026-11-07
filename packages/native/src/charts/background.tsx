import { Group } from "@shopify/react-native-skia";
import { useChart } from "./chart-context";
import { EdgeFade, useEnterOpacity, usePlotRect } from "./fade-mask";
import { PatternFill, type PatternPreset } from "./patterns";

export interface BackgroundProps {
  /** Default: "dots" (homepage). */
  pattern?: PatternPreset;
  /** Default: theme grid. */
  color?: string;
  opacity?: number;
  scale?: number;
  strokeWidth?: number;
  /** Left/right fade, % of plot width per edge. Default: 10. */
  fadeHorizontalLength?: number;
  /** Top/bottom fade, % of plot height per edge. Default: 10. */
  fadeVerticalLength?: number;
}

/** Patterned plot backdrop that fades at the edges (web `Background`). */
export function Background({
  pattern = "dots",
  color,
  opacity = 1,
  scale = 1,
  strokeWidth = 1,
  fadeHorizontalLength = 10,
  fadeVerticalLength = 10,
}: BackgroundProps) {
  const { theme } = useChart();
  const rect = usePlotRect();
  const enter = useEnterOpacity();
  return (
    <Group opacity={enter}>
      <EdgeFade
        bottom={fadeVerticalLength}
        left={fadeHorizontalLength}
        rect={rect}
        right={fadeHorizontalLength}
        top={fadeVerticalLength}
      >
        <PatternFill
          color={color ?? theme.grid}
          opacity={opacity}
          preset={pattern}
          rect={rect}
          scale={scale}
          strokeWidth={strokeWidth}
        />
      </EdgeFade>
    </Group>
  );
}
