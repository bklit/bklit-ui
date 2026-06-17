import type { StudioUrlState } from "@/lib/studio-parsers";

/** Applied when switching to the progress bar chart in Studio. */
export const progressBarChartDefaults: Partial<StudioUrlState> = {
  value: 72,
  totalNotches: 72,
  spacing: 0,
  notchCornerRadius: 3,
  notchLengthPercent: 38,
  progressBarHeight: 24,
  useGradient: true,
  inactiveFillOpacity: 0.4,
};
