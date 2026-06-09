"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

export interface SpringConfig {
  stiffness: number;
  damping: number;
}

export interface ChartConfigValue {
  /** Crosshair indicator, tooltip dot, date pill. */
  tooltipSpring: SpringConfig;
  /** Floating tooltip panel. */
  tooltipBoxSpring: SpringConfig;
  /** Line/area hover-highlight band (x + width). */
  highlightSpring: SpringConfig;
}

export const DEFAULT_CHART_CONFIG: ChartConfigValue = {
  tooltipSpring: { stiffness: 300, damping: 30 },
  tooltipBoxSpring: { stiffness: 100, damping: 20 },
  highlightSpring: { stiffness: 180, damping: 28 },
};

const ChartConfigContext = createContext<ChartConfigValue | null>(null);

export interface ChartConfigProviderProps {
  value?: Partial<ChartConfigValue>;
  children: ReactNode;
}

export function ChartConfigProvider({
  value,
  children,
}: ChartConfigProviderProps) {
  const merged = useMemo<ChartConfigValue>(
    () => ({
      ...DEFAULT_CHART_CONFIG,
      ...value,
    }),
    [value]
  );

  return (
    <ChartConfigContext.Provider value={merged}>
      {children}
    </ChartConfigContext.Provider>
  );
}

export function useChartConfig(): ChartConfigValue {
  return useContext(ChartConfigContext) ?? DEFAULT_CHART_CONFIG;
}

const DEFAULT_TOOLTIP_DAMPING = DEFAULT_CHART_CONFIG.tooltipSpring.damping;

/** Maps a damping slider to crosshair/dot/date-pill spring motion. `0` = instant. */
export function resolveTooltipMotion(damping?: number): {
  animate: boolean;
  springConfig: SpringConfig;
} {
  if (damping === 0) {
    return {
      animate: false,
      springConfig: DEFAULT_CHART_CONFIG.tooltipSpring,
    };
  }

  const effectiveDamping = damping ?? DEFAULT_TOOLTIP_DAMPING;
  let stiffness = DEFAULT_CHART_CONFIG.tooltipSpring.stiffness;

  if (effectiveDamping < DEFAULT_TOOLTIP_DAMPING) {
    const t =
      (DEFAULT_TOOLTIP_DAMPING - effectiveDamping) / DEFAULT_TOOLTIP_DAMPING;
    stiffness += t * 500;
  } else if (effectiveDamping > DEFAULT_TOOLTIP_DAMPING) {
    const t =
      (effectiveDamping - DEFAULT_TOOLTIP_DAMPING) /
      (100 - DEFAULT_TOOLTIP_DAMPING);
    stiffness -= t * 240;
  }

  return {
    animate: true,
    springConfig: {
      stiffness: Math.max(40, Math.round(stiffness)),
      damping: effectiveDamping,
    },
  };
}
