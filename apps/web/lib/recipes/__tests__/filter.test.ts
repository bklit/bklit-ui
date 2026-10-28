import assert from "node:assert/strict";
import test from "node:test";
import { createRecipeSearch, normalizeWord, paginate } from "../filter";
import type { Recipe, RecipeCategory } from "../types";

function recipe(
  id: string,
  title: string,
  category: RecipeCategory,
  charts: string[]
): Recipe {
  return {
    id,
    title,
    description: "",
    look: "",
    category,
    charts: charts.map((chart) => ({
      id: chart,
      label: chart.charAt(0).toUpperCase() + chart.slice(1),
      rootComponent: "",
      Preview: () => null,
      code: "",
      install: [],
      steps: [],
    })),
  };
}

const search = createRecipeSearch(
  [
    recipe("hatched", "Hatched backdrop", "backgrounds", ["line", "bar"]),
    recipe("squircle", "Squircle bars", "color-shape", ["bar"]),
    recipe("sunset", "Sunset sky", "skies", ["line"]),
    recipe("legend", "Linked legend", "pie-ring", ["donut", "ring"]),
  ],
  [
    { id: "backgrounds", title: "Backgrounds" },
    { id: "skies", title: "Skies" },
    { id: "color-shape", title: "Colour & shape" },
    { id: "pie-ring", title: "Pie & ring" },
  ]
);

const ids = (
  query: string,
  charts: string[] = [],
  categories: RecipeCategory[] = []
) => search.filterRecipes({ query, charts, categories }).map((r) => r.id);

test("normalizeWord folds case, plurals and joined 'chart'", () => {
  assert.equal(normalizeWord("Bars"), "bar");
  assert.equal(normalizeWord("Skies"), "sky");
  assert.equal(normalizeWord("barcharts"), "bar");
  assert.equal(normalizeWord("Colour"), "color");
});

test("'bar', 'bar chart' and 'Bar Charts' match the same recipes", () => {
  const expected = ["hatched", "squircle"];
  assert.deepEqual(ids("bar"), expected);
  assert.deepEqual(ids("bar chart"), expected);
  assert.deepEqual(ids("Bar Charts"), expected);
  // Half-typed "chart" keeps the results instead of emptying them.
  assert.deepEqual(ids("bar cha"), expected);
});

test("a whole word matches exactly; a partial word prefix-matches", () => {
  assert.deepEqual(ids("line"), ["hatched", "sunset"]);
  assert.deepEqual(ids("lin"), ["hatched", "sunset", "legend"]);
});

test("query matches category titles", () => {
  assert.deepEqual(ids("sky"), ["sunset"]);
  assert.deepEqual(ids("color"), ["squircle"]);
});

test("charts OR together; charts and categories AND", () => {
  assert.deepEqual(ids("", ["bar", "ring"]), ["hatched", "squircle", "legend"]);
  assert.deepEqual(ids("", ["bar"], ["color-shape", "skies"]), ["squircle"]);
  assert.deepEqual(ids("sunset", ["bar"]), []);
});

test("suggest groups chart types, categories and recipe titles", () => {
  const suggestions = search.suggest({
    query: "bar charts",
    charts: [],
    categories: [],
  });
  assert.deepEqual(
    suggestions.charts.map((c) => c.id),
    ["bar"]
  );
  assert.deepEqual(
    suggestions.recipes.map((r) => r.id),
    ["squircle"]
  );
  assert.deepEqual(
    search
      .suggest({ query: "squi", charts: [], categories: [] })
      .recipes.map((r) => r.id),
    ["squircle"]
  );
});

test("paginate clamps out-of-range pages", () => {
  const items = Array.from({ length: 21 }, (_, index) => index);
  assert.deepEqual(paginate(items, 2).items, [15, 16, 17, 18, 19, 20]);
  assert.equal(paginate(items, 9).page, 2);
  assert.equal(paginate(items, 0).page, 1);
  assert.deepEqual(paginate([], 3), { items: [], page: 1, pageCount: 1 });
});
