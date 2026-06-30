"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useMemo, useState } from "react";
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
  studioComponentAncestorIds,
  studioComponentDepth,
  studioComponentHasChildren,
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

function ComponentTreeExpandToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={expanded ? "Collapse nested items" : "Expand nested items"}
      className="flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      type="button"
    >
      <Icon
        className={cn(
          "size-3.5 transition-transform",
          !expanded && "-rotate-90"
        )}
        name="IconChevronDownSmall"
      />
    </button>
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
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    const ancestors = studioComponentAncestorIds(components, selectedId);
    if (ancestors.length === 0) {
      return;
    }
    setCollapsedIds((current) => {
      let changed = false;
      const next = new Set(current);
      for (const id of ancestors) {
        if (next.delete(id)) {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [components, selectedId]);

  const ordered = useMemo(
    () => flattenStudioComponents(components, { collapsedIds }),
    [collapsedIds, components]
  );

  if (ordered.length === 0) {
    return null;
  }

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <StudioControlGroup collapsible defaultOpen title="Components">
      <ul className="flex flex-col gap-0.5">
        {ordered.map((component) => {
          const depth = studioComponentDepth(components, component.id);
          const selected = component.id === selectedId;
          const configurable = isStudioComponentConfigurable(component);
          const visible = isStudioComponentVisible(state, component.id);
          const hasChildren = studioComponentHasChildren(
            components,
            component.id
          );
          const expanded = !collapsedIds.has(component.id);

          return (
            <li key={component.id}>
              <ContextMenu>
                <ContextMenuTrigger
                  className={cn(
                    "group flex w-full min-w-0 items-center gap-0.5 rounded-md pr-1 transition-colors",
                    selected
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    !configurable && "opacity-45"
                  )}
                  style={{ paddingLeft: `${8 + depth * 12}px` }}
                >
                  {hasChildren ? (
                    <ComponentTreeExpandToggle
                      expanded={expanded}
                      onToggle={() => toggleCollapsed(component.id)}
                    />
                  ) : (
                    <span aria-hidden className="size-4 shrink-0" />
                  )}
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
