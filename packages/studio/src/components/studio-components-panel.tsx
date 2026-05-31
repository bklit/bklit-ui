"use client";

import { cn } from "@bklitui/ui/lib/utils";
import {
  BarChart3Icon,
  CircleDotIcon,
  DatabaseIcon,
  LayersIcon,
  LineChartIcon,
  TypeIcon,
} from "lucide-react";
import { StudioControlGroup } from "@/components/studio-control-group";
import {
  flattenStudioComponents,
  studioComponentDepth,
} from "@/lib/studio-components";
import type {
  StudioComponentDefinition,
  StudioComponentKind,
} from "@/lib/types";

function componentIcon(kind: StudioComponentKind | undefined) {
  switch (kind) {
    case "data":
      return DatabaseIcon;
    case "series":
      return BarChart3Icon;
    case "line":
      return LineChartIcon;
    case "text":
      return TypeIcon;
    case "geometry":
      return CircleDotIcon;
    default:
      return LayersIcon;
  }
}

export function StudioComponentsPanel({
  components,
  selectedId,
  onSelect,
}: {
  components: StudioComponentDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const ordered = flattenStudioComponents(components);

  if (ordered.length === 0) {
    return null;
  }

  return (
    <StudioControlGroup collapsible defaultOpen title="Components">
      <ul className="flex flex-col gap-0.5">
        {ordered.map((component) => {
          const Icon = componentIcon(component.kind);
          const depth = studioComponentDepth(components, component.id);
          const selected = component.id === selectedId;

          return (
            <li key={component.id}>
              <button
                className={cn(
                  "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  selected
                    ? "bg-accent/10 text-foreground ring-1 ring-accent/25"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                onClick={() => onSelect(component.id)}
                style={{ paddingLeft: `${8 + depth * 12}px` }}
                type="button"
              >
                <Icon
                  className="size-3.5 shrink-0 opacity-70"
                  strokeWidth={1.75}
                />
                <span className="truncate">{component.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </StudioControlGroup>
  );
}
