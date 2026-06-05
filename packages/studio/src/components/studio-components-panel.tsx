"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { StudioControlGroup } from "@/components/studio-control-group";
import { StudioScrambleDataButton } from "@/components/studio-scramble-data-button";
import { resolveCssColor } from "@/lib/chart-theme-color";
import { resolveStudioComponentTreeIcon } from "@/lib/studio-component-tree-icon";
import {
  isStudioComponentConfigurable,
  isStudioComponentVisible,
  toggleStudioComponentVisibility,
} from "@/lib/studio-component-visibility";
import {
  flattenStudioComponents,
  studioComponentDepth,
} from "@/lib/studio-components";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioComponentDefinition } from "@/lib/types";

function ComponentListMarker({
  component,
  chartSlug,
}: {
  component: StudioComponentDefinition;
  chartSlug: StudioUrlState["chart"];
}) {
  if (component.listMarker === "color-dot") {
    const color = resolveCssColor(component.swatchColor ?? "var(--chart-1)");
    return (
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full ring-1 ring-border"
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <HugeiconsIcon
      className="size-3.5 shrink-0 opacity-70"
      icon={resolveStudioComponentTreeIcon(component, chartSlug)}
      strokeWidth={1.75}
    />
  );
}

export function StudioComponentsPanel({
  components,
  selectedId,
  onSelect,
  state,
  onChange,
  controlsDisabled = false,
  scrambleDisabled = false,
  onScramble,
}: {
  components: StudioComponentDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  controlsDisabled?: boolean;
  scrambleDisabled?: boolean;
  onScramble?: () => void;
}) {
  const ordered = flattenStudioComponents(components);

  if (ordered.length === 0) {
    return null;
  }

  return (
    <StudioControlGroup collapsible defaultOpen title="Components">
      <ul className="flex flex-col gap-0.5">
        {ordered.map((component) => {
          const depth = studioComponentDepth(components, component.id);
          const selected = component.id === selectedId;
          const configurable = isStudioComponentConfigurable(component);
          const visible = isStudioComponentVisible(state, component.id);

          return (
            <li key={component.id}>
              <div
                className={cn(
                  "group flex w-full min-w-0 items-center gap-1 rounded-md pr-1 transition-colors",
                  selected
                    ? "bg-accent/10 text-foreground ring-1 ring-accent/25"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  !configurable && "opacity-45"
                )}
                style={{ paddingLeft: `${8 + depth * 12}px` }}
              >
                <button
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-xs",
                    configurable ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                  disabled={!configurable}
                  onClick={() => {
                    if (configurable) {
                      onSelect(component.id);
                    }
                  }}
                  type="button"
                >
                  <ComponentListMarker
                    chartSlug={state.chart}
                    component={component}
                  />
                  <span className="truncate">{component.label}</span>
                </button>
                <button
                  aria-label={visible ? "Hide layer" : "Show layer"}
                  className={cn(
                    "shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-muted/80 group-hover:opacity-100",
                    !visible && "opacity-100"
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(
                      "hiddenComponents",
                      toggleStudioComponentVisibility(state, component.id)
                    );
                  }}
                  type="button"
                >
                  {visible ? (
                    <EyeIcon className="size-3.5" strokeWidth={1.75} />
                  ) : (
                    <EyeOffIcon
                      className="size-3.5 opacity-60"
                      strokeWidth={1.75}
                    />
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {onScramble ? (
        <div className="pt-2">
          <StudioScrambleDataButton
            disabled={controlsDisabled || scrambleDisabled}
            onScramble={onScramble}
          />
        </div>
      ) : null}
    </StudioControlGroup>
  );
}
