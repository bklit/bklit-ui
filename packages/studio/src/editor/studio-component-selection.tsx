"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  defaultStudioComponentId,
  getStudioComponents,
  getStudioDataControlGroups,
} from "@/lib/studio-components";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type {
  StudioChartConfig,
  StudioComponentDefinition,
  StudioControlGroup,
} from "@/lib/types";

interface StudioComponentSelectionContextValue {
  components: StudioComponentDefinition[];
  dataControlGroups: StudioControlGroup[];
  selectedComponentId: string;
  selectedComponent: StudioComponentDefinition | undefined;
  setSelectedComponentId: (id: string) => void;
}

const StudioComponentSelectionContext =
  createContext<StudioComponentSelectionContextValue | null>(null);

export function StudioComponentSelectionProvider({
  config,
  state,
  children,
}: {
  config: StudioChartConfig;
  state: StudioUrlState;
  children: React.ReactNode;
}) {
  const components = useMemo(
    () => getStudioComponents(config, state),
    [config, state]
  );

  const dataControlGroups = useMemo(
    () => getStudioDataControlGroups(config, state),
    [config, state]
  );

  const _componentIds = useMemo(
    () => components.map((component) => component.id).join("|"),
    [components]
  );

  const [selectedComponentId, setSelectedComponentId] = useState(() =>
    defaultStudioComponentId(components)
  );

  useEffect(() => {
    setSelectedComponentId((current) => {
      if (components.some((component) => component.id === current)) {
        return current;
      }
      return defaultStudioComponentId(components);
    });
  }, [components]);

  const selectedComponent = useMemo(
    () => components.find((component) => component.id === selectedComponentId),
    [components, selectedComponentId]
  );

  const value = useMemo(
    (): StudioComponentSelectionContextValue => ({
      components,
      dataControlGroups,
      selectedComponentId,
      selectedComponent,
      setSelectedComponentId,
    }),
    [components, dataControlGroups, selectedComponent, selectedComponentId]
  );

  return (
    <StudioComponentSelectionContext.Provider value={value}>
      {children}
    </StudioComponentSelectionContext.Provider>
  );
}

export function useStudioComponentSelection() {
  const context = useContext(StudioComponentSelectionContext);
  if (!context) {
    throw new Error(
      "useStudioComponentSelection must be used within StudioComponentSelectionProvider"
    );
  }
  return context;
}
