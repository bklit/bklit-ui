"use client";

import { createContext, type ReactNode, useContext } from "react";

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
  return (
    <StudioLegendHoverContext.Provider
      value={{ hoveredIndex, setHoveredIndex: onHoverChange }}
    >
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
