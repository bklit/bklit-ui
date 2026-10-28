import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { listChartTypes } from "@/lib/recipes/filter";
import { recipeCategories, recipes } from "./definitions";

const chartIds = listChartTypes(recipes).map((type) => type.id);
const categoryIds = recipeCategories.map((category) => category.id);

/**
 * /recipes URL state: `?q=bar&chart=line,bar&category=skies&page=2`.
 * Defaults are cleared from the URL (no `?page=1`); unknown ids are dropped.
 */
export const recipesSearchParams = {
  q: parseAsString.withDefault(""),
  chart: parseAsArrayOf(parseAsStringLiteral(chartIds)).withDefault([]),
  category: parseAsArrayOf(parseAsStringLiteral(categoryIds)).withDefault([]),
  page: parseAsInteger.withDefault(1),
};
