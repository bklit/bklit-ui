"use client";

import { Icon } from "@bklitui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import type { RecipeFacet } from "@/lib/recipes/filter";

export interface RecipeFilterOption {
  /** `chart:<id>` or `category:<id>`. */
  key: string;
  label: string;
  /** See `facetCounts` in lib/recipes/filter.ts. */
  facet: RecipeFacet;
  checked: boolean;
}

export interface RecipeFilterGroup {
  label: string;
  options: RecipeFilterOption[];
}

/**
 * One multi-select dropdown for every filter group. Stays open while you
 * check items. Counts are faceted ("+N" = recipes checking it would add);
 * an unchecked option that would empty the gallery or add nothing is
 * disabled.
 */
export function RecipesFilterMenu({
  groups,
  onToggle,
}: {
  groups: RecipeFilterGroup[];
  onToggle: (key: string) => void;
}) {
  const activeCount = groups
    .flatMap((group) => group.options)
    .filter((option) => option.checked).length;

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            aria-label={
              activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"
            }
            className="shrink-0"
            type="button"
            variant="outline"
          />
        }
      >
        Filters
        {activeCount > 0 ? (
          <span className="rounded-sm bg-primary px-1 font-normal text-[11px] text-primary-foreground tabular-nums leading-4">
            {activeCount}
          </span>
        ) : null}
        <Icon className="size-4" name="IconChevronDownSmall" />
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-60">
        {groups.map((group, index) => (
          <MenuGroup key={group.label}>
            {index > 0 ? <MenuSeparator /> : null}
            <MenuGroupLabel>{group.label}</MenuGroupLabel>
            {group.options.map((option) => (
              <MenuCheckboxItem
                checked={option.checked}
                closeOnClick={false}
                disabled={!option.checked && option.facet.count === 0}
                key={option.key}
                onCheckedChange={() => onToggle(option.key)}
              >
                <span className="flex items-center justify-between gap-4">
                  <span>{option.label}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {option.facet.added ? "+" : ""}
                    {option.facet.count}
                  </span>
                </span>
              </MenuCheckboxItem>
            ))}
          </MenuGroup>
        ))}
      </MenuPopup>
    </Menu>
  );
}

/** Active filters as dismissible pills; "Clear all" once there are two. */
export function RecipesActiveFilters({
  options,
  onRemove,
  onClearAll,
}: {
  options: RecipeFilterOption[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ul aria-label="Active filters" className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <li key={option.key}>
            <Badge className="gap-0.5 pe-0.5" size="lg" variant="outline">
              {option.label}
              <button
                aria-label={`Remove ${option.label} filter`}
                className="inline-flex size-4.5 cursor-pointer items-center justify-center rounded-[.25rem] text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onRemove(option.key)}
                type="button"
              >
                <Icon className="size-3.5" name="IconCrossSmall" />
              </button>
            </Badge>
          </li>
        ))}
      </ul>
      {options.length >= 2 ? (
        <Button onClick={onClearAll} size="xs" type="button" variant="ghost">
          Clear all
        </Button>
      ) : null}
    </div>
  );
}
