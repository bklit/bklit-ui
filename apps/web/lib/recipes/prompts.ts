import { SITE_URL } from "@/lib/site-url";
import type { Recipe, RecipeChart } from "./types";

export type RecipePromptScope = "chart" | "all";

const SHARED_RULES = [
  "Edit my existing charts in place. Keep their data, `dataKey`s, `xDataKey`, sizing, tooltips and any overlays not mentioned here.",
  "Read the installed source in `components/charts/` before editing to confirm prop names and defaults; prefer it over memory.",
  "Import from the installed files with the project alias (e.g. `@/components/charts/background`), never from `@bklitui/ui/charts`.",
  "Use theme tokens (`var(--chart-*)`, `chartCssVars`, or shadcn tokens such as `var(--foreground)`) rather than hex values, and check the result in light and dark mode.",
  "If a pattern or gradient `id` is used, make it unique per chart instance with `useId()` so two charts on one page don't share it.",
];

function recipeUrl(recipe: Recipe): string {
  return `${SITE_URL}/recipes#${recipe.id}`;
}

function installLine(items: string[]): string | null {
  const unique = [...new Set(items)];
  if (unique.length === 0) {
    return null;
  }
  return `Install anything missing (skip items already in \`components/charts/\`): \`npx shadcn@latest add ${unique
    .map((item) => `@bklit/${item}`)
    .join(" ")}\``;
}

function numbered(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
}

function bulleted(lines: string[]): string {
  return lines.map((line) => `- ${line}`).join("\n");
}

function intro(recipe: Recipe): string {
  return [
    `Use the bklit-ui skill (and bklit-ui-design for styling vocabulary) to restyle the Bklit UI charts already in this project with the "${recipe.title}" recipe: ${recipeUrl(recipe)}`,
    "",
    `The look: ${recipe.look}`,
  ].join("\n");
}

function chartSteps(chart: RecipeChart): string[] {
  const install = installLine(chart.install);
  return install ? [install, ...chart.steps] : chart.steps;
}

function referenceBlock(chart: RecipeChart): string {
  return ["```tsx", chart.code.trim(), "```"].join("\n");
}

/** Prompt that converts one chart type (the one selected in the viewer). */
export function buildChartPrompt(recipe: Recipe, chart: RecipeChart): string {
  return [
    intro(recipe),
    "",
    `Apply it to every \`${chart.rootComponent}\` (${chart.label.toLowerCase()} chart) in the project, or only the one I point you at.`,
    "",
    "Steps:",
    numbered(chartSteps(chart)),
    "",
    "Rules:",
    bulleted(SHARED_RULES),
    "",
    "Reference result (adapt names and data to my code):",
    referenceBlock(chart),
  ].join("\n");
}

/** Prompt that converts every chart type the recipe covers. */
export function buildRecipePrompt(recipe: Recipe): string {
  const sections = recipe.charts.map((chart) =>
    [
      `## ${chart.label} charts (\`${chart.rootComponent}\`)`,
      "",
      numbered(chart.steps),
      "",
      "Reference:",
      referenceBlock(chart),
    ].join("\n")
  );

  const install = installLine(recipe.charts.flatMap((chart) => chart.install));

  return [
    intro(recipe),
    "",
    `Apply it to every ${recipe.charts
      .map((chart) => `\`${chart.rootComponent}\``)
      .join(
        ", "
      )} in the project so they share one look. Skip chart types the project doesn't use.`,
    ...(install ? ["", install] : []),
    "",
    "Rules:",
    bulleted(SHARED_RULES),
    "",
    sections.join("\n\n"),
  ].join("\n");
}

export function buildPrompt(
  recipe: Recipe,
  chart: RecipeChart,
  scope: RecipePromptScope
): string {
  return scope === "all"
    ? buildRecipePrompt(recipe)
    : buildChartPrompt(recipe, chart);
}
