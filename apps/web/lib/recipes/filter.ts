import type { Recipe, RecipeCategory } from "./types";

/** Recipes shown per page on /recipes. */
export const RECIPES_PER_PAGE = 15;

export interface RecipeCategoryInfo {
  id: RecipeCategory;
  title: string;
}

/** A chart type at least one recipe has a version for (e.g. `bar`). */
export interface RecipeChartType {
  id: string;
  label: string;
}

/**
 * Gallery filters. Values inside one list OR together (Line or Bar); the
 * query, chart list and category list AND together.
 */
export interface RecipeFilters {
  query: string;
  charts: readonly string[];
  categories: readonly RecipeCategory[];
}

/** See `facetCounts`. */
export interface RecipeFacet {
  count: number;
  /** `count` is the number of extra recipes checking this would add. */
  added: boolean;
}

export interface RecipeFacetCounts {
  charts: Map<string, RecipeFacet>;
  categories: Map<RecipeCategory, RecipeFacet>;
}

export interface RecipeSuggestions {
  charts: RecipeChartType[];
  categories: RecipeCategoryInfo[];
  recipes: Recipe[];
}

/** Words every recipe implies, so "bar charts" searches like "bar". */
const STOP_WORDS = new Set([
  "and",
  "chart",
  "for",
  "graph",
  "of",
  "recipe",
  "the",
  "with",
]);

const SPELLINGS: Record<string, string> = { colour: "color", grey: "gray" };

const CHART_SUFFIX = /charts?$/;
const WORD_SEPARATOR = /[^a-z0-9]+/i;

/** Lowercase, singular, US-spelt form of one word ("Charts" → "chart"). */
export function normalizeWord(word: string): string {
  let value = word.toLowerCase();
  // "barchart" / "linecharts" typed without a space.
  const stem = value.replace(CHART_SUFFIX, "");
  if (stem && stem !== value) {
    value = stem;
  }
  if (value.length > 4 && value.endsWith("ies")) {
    value = `${value.slice(0, -3)}y`;
  } else if (value.length > 3 && value.endsWith("s") && !value.endsWith("ss")) {
    value = value.slice(0, -1);
  }
  return SPELLINGS[value] ?? value;
}

/** Normalised search terms in `text`, minus stop words. */
export function tokenize(text: string): string[] {
  return text
    .split(WORD_SEPARATOR)
    .filter(Boolean)
    .map(normalizeWord)
    .filter((word) => !STOP_WORDS.has(word));
}

function isStopWordPrefix(term: string): boolean {
  for (const word of STOP_WORDS) {
    if (word.startsWith(term)) {
      return true;
    }
  }
  return false;
}

/** Chart types across `recipes`, in first-seen order. */
export function listChartTypes(recipes: readonly Recipe[]): RecipeChartType[] {
  const types = new Map<string, RecipeChartType>();
  for (const recipe of recipes) {
    for (const chart of recipe.charts) {
      if (!types.has(chart.id)) {
        types.set(chart.id, { id: chart.id, label: chart.label });
      }
    }
  }
  return [...types.values()];
}

/**
 * Search + filter over a fixed recipe list. Each query term must match a
 * recipe's title, category title or chart labels. A term that is already a
 * whole known word ("line") matches exactly; anything else is treated as a
 * word being typed and prefix-matches ("squi" → "squircle"), so "line" never
 * pulls in "Linked legend".
 */
export function createRecipeSearch(
  recipes: readonly Recipe[],
  categories: readonly RecipeCategoryInfo[]
) {
  const categoryTitles = new Map(categories.map((c) => [c.id, c.title]));
  const chartTypes = listChartTypes(recipes);
  const entries = recipes.map((recipe) => ({
    recipe,
    titleTerms: tokenize(recipe.title),
    terms: tokenize(
      [
        recipe.title,
        categoryTitles.get(recipe.category) ?? "",
        ...recipe.charts.map((chart) => chart.label),
      ].join(" ")
    ),
  }));
  const vocabulary = new Set(entries.flatMap((entry) => entry.terms));

  const matchesTerms = (queryTerms: string[], terms: string[]) =>
    queryTerms.every((queryTerm, index) => {
      if (vocabulary.has(queryTerm)) {
        return terms.includes(queryTerm);
      }
      // Half-typed "bar cha…" shouldn't empty the results before "chart".
      if (index > 0 && isStopWordPrefix(queryTerm)) {
        return true;
      }
      return terms.some((term) => term.startsWith(queryTerm));
    });

  const matchesFacets = (
    recipe: Recipe,
    { charts, categories: activeCategories }: RecipeFilters
  ) =>
    (charts.length === 0 ||
      recipe.charts.some((chart) => charts.includes(chart.id))) &&
    (activeCategories.length === 0 ||
      activeCategories.includes(recipe.category));

  function filterRecipes(filters: RecipeFilters): Recipe[] {
    const queryTerms = tokenize(filters.query);
    return entries
      .filter(
        (entry) =>
          matchesFacets(entry.recipe, filters) &&
          matchesTerms(queryTerms, entry.terms)
      )
      .map((entry) => entry.recipe);
  }

  /** Autocomplete options for `filters.query`; recipes respect active filters. */
  function suggest(filters: RecipeFilters, limit = 6): RecipeSuggestions {
    const queryTerms = tokenize(filters.query);
    if (queryTerms.length === 0) {
      return { charts: [], categories: [], recipes: [] };
    }
    return {
      charts: chartTypes.filter((type) =>
        matchesTerms(queryTerms, tokenize(type.label))
      ),
      categories: categories.filter((category) =>
        matchesTerms(queryTerms, tokenize(category.title))
      ),
      recipes: entries
        .filter(
          (entry) =>
            matchesFacets(entry.recipe, filters) &&
            matchesTerms(queryTerms, entry.titleTerms)
        )
        .slice(0, limit)
        .map((entry) => entry.recipe),
    };
  }

  /**
   * Faceted counts under the current query and filters. Groups OR inside and
   * AND across, so each option reports what checking it would do:
   * - its group has no selection → `count` is the results you'd get;
   * - its group already has a selection → `added` is true and `count` is how
   *   many *more* recipes it would add (shown as "+N");
   * - it is selected → `count` is how many current results it matches.
   * An unselected option with count 0 would empty the gallery or change
   * nothing, so the UI disables it.
   */
  function facetCounts(filters: RecipeFilters): RecipeFacetCounts {
    const total = filterRecipes(filters).length;
    const facet = (
      selected: readonly string[],
      id: string,
      results: (selection: string[]) => number
    ): RecipeFacet => {
      if (selected.length === 0 || selected.includes(id)) {
        return { count: results([id]), added: false };
      }
      return { count: results([...selected, id]) - total, added: true };
    };
    return {
      charts: new Map(
        chartTypes.map(({ id }) => [
          id,
          facet(
            filters.charts,
            id,
            (charts) => filterRecipes({ ...filters, charts }).length
          ),
        ])
      ),
      categories: new Map(
        categories.map(({ id }) => [
          id,
          facet(
            filters.categories,
            id,
            (selection) =>
              filterRecipes({
                ...filters,
                categories: selection as RecipeCategory[],
              }).length
          ),
        ])
      ),
    };
  }

  return { chartTypes, facetCounts, filterRecipes, suggest };
}

export interface RecipePage<T> {
  items: T[];
  /** `requested` clamped to `1…pageCount`. */
  page: number;
  pageCount: number;
}

/** One page of `items`; out-of-range or non-integer pages are clamped. */
export function paginate<T>(
  items: readonly T[],
  requested: number,
  perPage = RECIPES_PER_PAGE
): RecipePage<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const page = Math.min(Math.max(1, Math.trunc(requested) || 1), pageCount);
  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    page,
    pageCount,
  };
}
