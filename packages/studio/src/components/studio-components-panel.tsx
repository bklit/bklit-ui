"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { StudioControlGroup } from "@/components/studio-control-group";
import {
  buildAddProjectionLineUpdate,
  buildHideComponentUpdate,
  buildRemoveProjectionUpdate,
  canAddProjectionLine,
  parseLineProjectionIndex,
  parseLineSeriesIndex,
} from "@/lib/studio-component-context-actions";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/ui/context-menu";

function ComponentListMarker({
  component,
  chartSlug,
}: {
  component: StudioComponentDefinition;
  chartSlug: StudioUrlState["chart"];
}) {
  if (component.listMarker === "color-dot") {
    return (
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{
          backgroundColor: component.swatchColor ?? "var(--chart-1)",
        }}
      />
    );
  }

  return (
    <Icon
      className="size-3.5 shrink-0 opacity-70"
      name={resolveStudioComponentTreeIcon(component, chartSlug)}
    />
  );
}

function ComponentContextMenuContent({
  component,
  state,
  visible,
  onBatchChange,
  onChange,
}: {
  component: StudioComponentDefinition;
  state: StudioUrlState;
  visible: boolean;
  onBatchChange: (updates: Partial<StudioUrlState>) => void;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  const lineSeriesIndex = parseLineSeriesIndex(component.id);
  const projectionIndex = parseLineProjectionIndex(component.id);
  const showLineSeriesMenu =
    lineSeriesIndex != null &&
    state.chart === "line-chart" &&
    state.lineChartMode === "standard";

  const toggleVisibility = () => {
    onChange(
      "hiddenComponents",
      toggleStudioComponentVisibility(state, component.id)
    );
  };

  if (showLineSeriesMenu) {
    const canAdd = canAddProjectionLine(state);

    return (
      <ContextMenuContent>
        <ContextMenuItem
          disabled={!canAdd}
          onClick={() => {
            const updates = buildAddProjectionLineUpdate(
              state,
              lineSeriesIndex
            );
            if (updates) {
              onBatchChange(updates);
            }
          }}
        >
          Add projection line
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => {
            onBatchChange(buildHideComponentUpdate(state, component.id));
          }}
          variant="destructive"
        >
          Remove
        </ContextMenuItem>
        <ContextMenuItem onClick={toggleVisibility}>
          {visible ? "Hide" : "Show"}
        </ContextMenuItem>
      </ContextMenuContent>
    );
  }

  if (projectionIndex != null) {
    return (
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => {
            const updates = buildRemoveProjectionUpdate(state, projectionIndex);
            if (updates) {
              onBatchChange(updates);
            }
          }}
          variant="destructive"
        >
          Remove
        </ContextMenuItem>
        <ContextMenuItem onClick={toggleVisibility}>
          {visible ? "Hide" : "Show"}
        </ContextMenuItem>
      </ContextMenuContent>
    );
  }

  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={toggleVisibility}>
        {visible ? "Hide" : "Show"}
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

export function StudioComponentsPanel({
  components,
  selectedId,
  onSelect,
  state,
  onChange,
  onBatchChange,
}: {
  components: StudioComponentDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  state: StudioUrlState;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onBatchChange: (updates: Partial<StudioUrlState>) => void;
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
              <ContextMenu>
                <ContextMenuTrigger
                  className={cn(
                    "group flex w-full min-w-0 items-center gap-1 rounded-md pr-1 transition-colors",
                    selected
                      ? "bg-accent text-foreground"
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
                      "shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-transparent hover:text-foreground group-hover:opacity-100",
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
                      <Icon className="size-3.5" name="IconEyeOpen" />
                    ) : (
                      <Icon
                        className="size-3.5 opacity-60"
                        name="IconEyeSlash"
                      />
                    )}
                  </button>
                </ContextMenuTrigger>
                <ComponentContextMenuContent
                  component={component}
                  onBatchChange={onBatchChange}
                  onChange={onChange}
                  state={state}
                  visible={visible}
                />
              </ContextMenu>
            </li>
          );
        })}
      </ul>
    </StudioControlGroup>
  );
}
