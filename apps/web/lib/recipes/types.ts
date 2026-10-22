import type { ComponentType } from "react";

/** One chart a recipe can be applied to (e.g. the line-chart version). */
export interface RecipeChart {
  /** Stable id, unique within the recipe (`"line"`, `"area"`, `"bar"`). */
  id: string;
  /** Switcher label, e.g. "Line". */
  label: string;
  /** Root component the prompt targets, e.g. `LineChart`. */
  rootComponent: string;
  /** Live preview rendered with the real chart primitives. */
  Preview: ComponentType;
  /** Reference snippet shown in the Code tab (installed-project imports). */
  code: string;
  /** `@bklit/<item>` registry items this version needs. */
  install: string[];
  /** Concrete edits that turn an existing chart into this recipe. */
  steps: string[];
}

/** Gallery section a recipe is listed under on /recipes. */
export type RecipeCategory =
  | "backgrounds"
  | "color-shape"
  | "hover-annotations"
  | "forecasts-ranges"
  | "heatmaps"
  | "pie-ring";

/** A visual style treatment that can be applied to several chart types. */
export interface Recipe {
  /** URL-safe id, also used as the section anchor on /recipes. */
  id: string;
  title: string;
  /** One-line description shown above the viewer. */
  description: string;
  /** What the finished chart should look like — used in prompts. */
  look: string;
  category: RecipeCategory;
  charts: RecipeChart[];
}
