import type { Recipe, RecipeCategory } from "@/lib/recipes/types";
import { customIndicators } from "./custom-indicators";
import { diamondMarkers } from "./diamond-markers";
import { dotMatrix } from "./dot-matrix";
import { eventMarkers } from "./event-markers";
import { gradientGlow } from "./gradient-glow";
import { hatchedBackdrop } from "./hatched-backdrop";
import { heatmapDotCalendar, heatmapWorkweek } from "./heatmaps";
import { kpiSparklines } from "./kpi-sparklines";
import { monochrome } from "./monochrome";
import { linkedLegend, patternedSlices } from "./pie-recipes";
import { projectionLine } from "./projection-line";
import { quietSparkline } from "./quiet-sparkline";
import { rangeBand } from "./range-band";
import { skyAurora, skySunset } from "./sky-glow";
import { squircleBars } from "./squircle-bars";
import { trendLine } from "./trend-line";
import { valueLabels } from "./value-labels";
import { weekendStripes } from "./weekend-stripes";

/** Every recipe on /recipes, in display order. Add new recipes here. */
export const recipes: Recipe[] = [
  hatchedBackdrop,
  weekendStripes,
  dotMatrix,
  skySunset,
  skyAurora,
  gradientGlow,
  monochrome,
  squircleBars,
  quietSparkline,
  customIndicators,
  eventMarkers,
  diamondMarkers,
  valueLabels,
  kpiSparklines,
  projectionLine,
  trendLine,
  rangeBand,
  heatmapDotCalendar,
  heatmapWorkweek,
  patternedSlices,
  linkedLegend,
];

/** Gallery sections, in display order. */
export const recipeCategories: {
  id: RecipeCategory;
  title: string;
  description: string;
}[] = [
  {
    id: "backgrounds",
    title: "Backgrounds",
    description: "Textures that replace grid lines behind the series.",
  },
  {
    id: "skies",
    title: "Skies",
    description: "Atmospheric glows clipped to the sky above the line.",
  },
  {
    id: "color-shape",
    title: "Colour & shape",
    description: "Fills, palettes, bar shapes and chrome.",
  },
  {
    id: "hover-annotations",
    title: "Hover & annotations",
    description: "Custom indicators, event markers and value labels.",
  },
  {
    id: "forecasts-ranges",
    title: "Forecasts & ranges",
    description: "Projections, trend lines and range bands.",
  },
  {
    id: "heatmaps",
    title: "Heatmaps",
    description: "Contribution-calendar looks.",
  },
  {
    id: "pie-ring",
    title: "Pie & ring",
    description: "Donuts, rings and linked legends.",
  },
];
