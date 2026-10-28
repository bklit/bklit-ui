"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Icon } from "@bklitui/icons";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { RecipeCategory } from "@/lib/recipes/types";

export type RecipeSuggestion =
  | { kind: "chart"; id: string; label: string; detail: string }
  | { kind: "category"; id: RecipeCategory; label: string; detail: string }
  | { kind: "recipe"; id: string; label: string; detail: string };

export interface RecipeSuggestionGroup {
  value: string;
  items: RecipeSuggestion[];
}

/**
 * Search box with grouped suggestions. Typing updates `query` (which filters
 * the gallery live); picking a suggestion calls `onSelect` instead.
 */
export function RecipesSearch({
  query,
  groups,
  onQueryChange,
  onSelect,
}: {
  query: string;
  groups: RecipeSuggestionGroup[];
  onQueryChange: (query: string) => void;
  onSelect: (suggestion: RecipeSuggestion) => void;
}) {
  return (
    <Autocomplete.Root
      filter={null}
      items={groups}
      itemToStringValue={(item: RecipeSuggestion) => item.label}
      onValueChange={(value, details) => {
        // Picks are handled by the item's onClick (Enter clicks it too).
        if (details.reason !== "item-press") {
          onQueryChange(value);
        }
      }}
      value={query}
    >
      <Autocomplete.InputGroup render={<InputGroup className="w-full" />}>
        <InputGroupAddon>
          <Icon className="size-4" name="IconMagnifyingGlass" />
        </InputGroupAddon>
        <Autocomplete.Input
          aria-label="Search recipes"
          placeholder="Search recipes or chart types…"
          render={<InputGroupInput nativeInput type="search" />}
        />
        {query ? (
          <InputGroupAddon align="inline-end">
            <Autocomplete.Clear
              aria-label="Clear search"
              render={<Button size="icon-xs" variant="ghost" />}
            >
              <Icon name="IconCrossSmall" />
            </Autocomplete.Clear>
          </InputGroupAddon>
        ) : null}
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner align="start" className="z-50" sideOffset={4}>
          <Autocomplete.Popup className="relative w-(--anchor-width) origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-empty:hidden dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
            <Autocomplete.List className="max-h-[min(var(--available-height),22rem)] overflow-y-auto p-1">
              {(group: RecipeSuggestionGroup) => (
                <Autocomplete.Group items={group.items} key={group.value}>
                  <Autocomplete.GroupLabel className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                    {group.value}
                  </Autocomplete.GroupLabel>
                  <Autocomplete.Collection>
                    {(item: RecipeSuggestion) => (
                      <Autocomplete.Item
                        className="flex min-h-8 cursor-default select-none items-center justify-between gap-3 rounded-sm px-2 py-1 text-base text-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground sm:min-h-7 sm:text-sm"
                        key={`${item.kind}-${item.id}`}
                        onClick={() => onSelect(item)}
                        value={item}
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                          {item.detail}
                        </span>
                      </Autocomplete.Item>
                    )}
                  </Autocomplete.Collection>
                </Autocomplete.Group>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
