"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

interface StudioLegendHoverContextValue {
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
}

const StudioLegendHoverContext =
  createContext<StudioLegendHoverContextValue | null>(null);

export function StudioLegendHoverProvider({
  hoveredIndex,
  onHoverChange,
  children,
}: {
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ hoveredIndex, setHoveredIndex: onHoverChange }),
    [hoveredIndex, onHoverChange]
  );

  return (
    <StudioLegendHoverContext.Provider value={value}>
      {children}
    </StudioLegendHoverContext.Provider>
  );
}

export function useStudioLegendHover() {
  const context = useContext(StudioLegendHoverContext);
  return (
    context ?? {
      hoveredIndex: null,
      setHoveredIndex: () => {
        /* noop outside StudioChartShell */
      },
    }
  );
}
