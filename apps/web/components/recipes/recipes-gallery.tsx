"use client";

import { Icon } from "@bklitui/icons";
import { useQueryStates } from "nuqs";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  createRecipeSearch,
  paginate,
  RECIPES_PER_PAGE,
  type RecipeFacet,
  type RecipeFacetCounts,
  type RecipeSuggestions,
} from "@/lib/recipes/filter";
import type { Recipe, RecipeCategory } from "@/lib/recipes/types";
import { recipeCategories, recipes } from "./definitions";
import { RecipeViewer } from "./recipe-viewer";
import {
  type RecipeFilterGroup,
  RecipesActiveFilters,
  RecipesFilterMenu,
} from "./recipes-filters";
import {
  type RecipeSuggestion,
  type RecipeSuggestionGroup,
  RecipesSearch,
} from "./recipes-search";
import { recipesSearchParams } from "./recipes-search-params";

const categoryOrder = new Map(
  recipeCategories.map((category, index) => [category.id, index])
);

/** Every recipe in section order, so pages break between whole sections. */
const orderedRecipes = [...recipes].sort(
  (a, b) =>
    (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0)
);

const search = createRecipeSearch(orderedRecipes, recipeCategories);

interface GalleryState {
  q: string;
  chart: string[];
  category: RecipeCategory[];
  page: number;
}

/** `null` clears a key back to its default (and out of the URL). */
type GalleryUpdate = { [K in keyof GalleryState]?: GalleryState[K] | null };

const DEFAULT_STATE: GalleryState = { q: "", chart: [], category: [], page: 1 };

const noop = () => undefined;

function pageParam(page: number): number | null {
  return page === 1 ? null : page;
}

function pageOfIndex(index: number): number | null {
  return pageParam(Math.floor(index / RECIPES_PER_PAGE) + 1);
}

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function plural(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

const EMPTY_FACET: RecipeFacet = { count: 0, added: false };

function facetLabel({ count, added }: RecipeFacet = EMPTY_FACET): string {
  return added ? `+${plural(count, "recipe")}` : plural(count, "recipe");
}

/**
 * `counts` are facets for the filters a pick would leave (picking a chart or
 * category clears the search text).
 */
function suggestionGroups(
  { charts, categories, recipes: matches }: RecipeSuggestions,
  counts: RecipeFacetCounts
): RecipeSuggestionGroup[] {
  const groups: RecipeSuggestionGroup[] = [
    {
      value: "Charts",
      items: charts.map((type) => ({
        kind: "chart",
        id: type.id,
        label: `${type.label} charts`,
        detail: facetLabel(counts.charts.get(type.id)),
      })),
    },
    {
      value: "Categories",
      items: categories.map((category) => ({
        kind: "category",
        id: category.id,
        label: category.title,
        detail: facetLabel(counts.categories.get(category.id)),
      })),
    },
    {
      value: "Recipes",
      items: matches.map((recipe) => ({
        kind: "recipe",
        id: recipe.id,
        label: recipe.title,
        detail:
          recipeCategories.find((category) => category.id === recipe.category)
            ?.title ?? "",
      })),
    },
  ];
  return groups.filter((group) => group.items.length > 0);
}

export function RecipesGallery() {
  return (
    // nuqs reads search params, which opts the subtree out of static
    // rendering. The fallback is the unfiltered first page, so the
    // prerendered HTML still lists recipes.
    <Suspense
      fallback={<RecipesGalleryView onChange={noop} state={DEFAULT_STATE} />}
    >
      <RecipesGalleryWithUrlState />
    </Suspense>
  );
}

function RecipesGalleryWithUrlState() {
  const [state, setState] = useQueryStates(recipesSearchParams);
  return <RecipesGalleryView onChange={setState} state={state} />;
}

function RecipesGalleryView({
  state,
  onChange,
}: {
  state: GalleryState;
  onChange: (update: GalleryUpdate) => unknown;
}) {
  const { q: query, chart: charts, category: categories } = state;
  const filtered = useMemo(
    () => search.filterRecipes({ query, charts, categories }),
    [query, charts, categories]
  );
  const suggestions = useMemo(
    () =>
      suggestionGroups(
        search.suggest({ query, charts, categories }),
        search.facetCounts({ query: "", charts, categories })
      ),
    [query, charts, categories]
  );
  const filterGroups = useMemo<RecipeFilterGroup[]>(() => {
    const counts = search.facetCounts({ query, charts, categories });
    return [
      {
        label: "Chart types",
        options: search.chartTypes.map((type) => ({
          key: `chart:${type.id}`,
          label: type.label,
          facet: counts.charts.get(type.id) ?? EMPTY_FACET,
          checked: charts.includes(type.id),
        })),
      },
      {
        label: "Categories",
        options: recipeCategories.map((category) => ({
          key: `category:${category.id}`,
          label: category.title,
          facet: counts.categories.get(category.id) ?? EMPTY_FACET,
          checked: categories.includes(category.id),
        })),
      },
    ];
  }, [query, charts, categories]);
  const activeFilters = filterGroups
    .flatMap((group) => group.options)
    .filter((option) => option.checked);
  const { items, page, pageCount } = paginate(filtered, state.page);
  const sections = recipeCategories
    .map((category) => ({
      ...category,
      recipes: items.filter((recipe) => recipe.category === category.id),
    }))
    .filter((section) => section.recipes.length > 0);
  const filtering =
    query.trim() !== "" || charts.length > 0 || categories.length > 0;

  // Any search or filter change starts again from page 1.
  const updateFilters = (update: GalleryUpdate) =>
    onChange({ ...update, page: null });

  const clearFilters = () =>
    onChange({ q: null, chart: null, category: null, page: null });

  /** Toggle a `chart:<id>` / `category:<id>` filter key. */
  const toggleFilter = (key: string) => {
    const [group, id] = key.split(":") as [string, string];
    if (group === "chart") {
      updateFilters({ chart: toggle(charts, id) });
    } else {
      updateFilters({ category: toggle(categories, id as RecipeCategory) });
    }
  };

  const selectSuggestion = (suggestion: RecipeSuggestion) => {
    if (suggestion.kind === "chart") {
      updateFilters({
        q: null,
        chart: charts.includes(suggestion.id)
          ? charts
          : [...charts, suggestion.id],
      });
    } else if (suggestion.kind === "category") {
      updateFilters({
        q: null,
        category: categories.includes(suggestion.id)
          ? categories
          : [...categories, suggestion.id],
      });
    } else {
      updateFilters({ q: suggestion.label });
    }
  };

  const goToPage = (next: number) => {
    onChange({ page: pageParam(next) });
    document
      .getElementById("recipes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Rewrite an out-of-range `?page=` to the page actually shown.
  useEffect(() => {
    if (state.page !== page) {
      onChange({ page: pageParam(page) });
    }
  }, [state.page, page, onChange]);

  // `/recipes#<recipe-id>` links (prompts, titles) must still land when the
  // recipe is on another page or hidden by the current filters.
  const latest = useRef({ filtered, onChange });
  const pendingScroll = useRef<string | null>(null);
  useEffect(() => {
    latest.current = { filtered, onChange };
  });
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        return;
      }
      // Already rendered: still scroll, since the Suspense swap on load
      // replaces the element the browser would have jumped to.
      const rendered = document.getElementById(id);
      if (rendered) {
        rendered.scrollIntoView({ block: "start" });
        return;
      }
      const matches = (recipe: Recipe) =>
        recipe.id === id || `section-${recipe.category}` === id;
      const index = latest.current.filtered.findIndex(matches);
      const fullIndex = orderedRecipes.findIndex(matches);
      if (index >= 0) {
        pendingScroll.current = id;
        latest.current.onChange({ page: pageOfIndex(index) });
      } else if (fullIndex >= 0) {
        pendingScroll.current = id;
        latest.current.onChange({
          q: null,
          chart: null,
          category: null,
          page: pageOfIndex(fullIndex),
        });
      }
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  useEffect(() => {
    const target = pendingScroll.current
      ? document.getElementById(pendingScroll.current)
      : null;
    if (target) {
      pendingScroll.current = null;
      target.scrollIntoView({ block: "start" });
    }
  });

  return (
    <div className="flex w-full flex-col gap-10 md:gap-14">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-2 sm:max-w-md">
            <div className="min-w-0 flex-1">
              <RecipesSearch
                groups={suggestions}
                onQueryChange={(value) => updateFilters({ q: value || null })}
                onSelect={selectSuggestion}
                query={query}
              />
            </div>
            <RecipesFilterMenu groups={filterGroups} onToggle={toggleFilter} />
          </div>
          <p
            aria-live="polite"
            className="text-muted-foreground text-sm sm:ms-auto"
          >
            {filtering
              ? `${plural(filtered.length, "recipe")} found`
              : plural(orderedRecipes.length, "recipe")}
          </p>
        </div>
        <RecipesActiveFilters
          onClearAll={() => updateFilters({ chart: null, category: null })}
          onRemove={toggleFilter}
          options={activeFilters}
        />
      </div>

      {sections.length === 0 ? (
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon name="IconQuickSearch" />
            </EmptyMedia>
            <EmptyTitle>No recipes match</EmptyTitle>
            <EmptyDescription>
              {query.trim()
                ? `Nothing matches “${query.trim()}” with the selected filters.`
                : "No recipe fits every selected filter."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={clearFilters} size="sm" variant="outline">
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {sections.map((section) => (
        <section
          aria-labelledby={`section-${section.id}-title`}
          className="flex scroll-mt-[calc(var(--site-header-height)+1rem)] flex-col gap-8 md:gap-10"
          data-recipe-section={section.id}
          id={`section-${section.id}`}
          key={section.id}
        >
          <header className="flex flex-col gap-1 border-border border-b px-1 pb-3">
            <h2
              className="font-heading font-semibold text-2xl text-foreground tracking-tight"
              id={`section-${section.id}-title`}
            >
              {section.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {section.description}
            </p>
          </header>
          <div className="flex flex-col gap-12 md:gap-16">
            {section.recipes.map((recipe) => (
              <RecipeViewer key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      ))}

      <RecipesPagination
        onPageChange={goToPage}
        page={page}
        pageCount={pageCount}
      />
    </div>
  );
}

function RecipesPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Recipe pages"
      className="flex items-center justify-between gap-4 border-border/64 border-t pt-8"
    >
      <Button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        size="sm"
        variant="ghost"
      >
        <Icon className="size-4" name="IconChevronLeft" />
        Previous
      </Button>
      <ul className="flex items-center gap-1">
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (number) => (
            <li key={number}>
              <Button
                aria-current={number === page ? "page" : undefined}
                aria-label={`Page ${number}`}
                className="tabular-nums"
                onClick={() => onPageChange(number)}
                size="icon-sm"
                variant={number === page ? "outline" : "ghost"}
              >
                {number}
              </Button>
            </li>
          )
        )}
      </ul>
      <Button
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        size="sm"
        variant="ghost"
      >
        Next
        <Icon className="size-4" name="IconChevronRight" />
      </Button>
    </nav>
  );
}
