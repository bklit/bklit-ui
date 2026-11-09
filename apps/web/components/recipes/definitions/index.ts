import type { Recipe, RecipeCategory } from "@/lib/recipes/types";
import {
  choroplethPointerPinMap,
  choroplethTiltedDotMap,
  choroplethVisitorMap,
} from "./choropleth-recipes";
import {
  contextBars,
  forecastHandoff,
  priceVolume,
  signalNoise,
} from "./composed-recipes";
import { customIndicators } from "./custom-indicators";
import { diamondMarkers } from "./diamond-markers";
import { dotMatrix } from "./dot-matrix";
import { eventMarkers } from "./event-markers";
import {
  gaugeConicKpi,
  gaugeDashboardDial,
  gaugeFanDuty,
  gaugeLiveLoad,
  gaugeSpeedometer,
  gaugeUptimeDots,
} from "./gauge-recipes";
import { gradientGlow } from "./gradient-glow";
import { hatchedBackdrop } from "./hatched-backdrop";
import { heatmapDotCalendar, heatmapWorkweek } from "./heatmaps";
import { kpiSparklines } from "./kpi-sparklines";
import { monochrome } from "./monochrome";
import { linkedLegend, patternedSlices, tickRing } from "./pie-recipes";
import { projectionLine } from "./projection-line";
import { quietSparkline } from "./quiet-sparkline";
import {
  activityClockCard,
  seasonalTemperatureCard,
  storageUsageCard,
} from "./radial-recipes";
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
  forecastHandoff,
  priceVolume,
  signalNoise,
  contextBars,
  heatmapDotCalendar,
  heatmapWorkweek,
  patternedSlices,
  linkedLegend,
  tickRing,
  activityClockCard,
  storageUsageCard,
  seasonalTemperatureCard,
  gaugeDashboardDial,
  gaugeSpeedometer,
  gaugeConicKpi,
  gaugeFanDuty,
  gaugeUptimeDots,
  gaugeLiveLoad,
  choroplethVisitorMap,
  choroplethTiltedDotMap,
  choroplethPointerPinMap,
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
    id: "combos",
    title: "Combos",
    description:
      "Composed charts that mix bars, lines, candles, points and bands on one time axis.",
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
  {
    id: "radial",
    title: "Radial cards",
    description:
      "Dashboard cards built on RadialChart — clocks, gauges and yearly loops.",
  },
  {
    id: "gauges",
    title: "Gauges",
    description:
      "Dials built on Gauge — rulers, needles, zones, sectors, progress rings and dots.",
  },
  {
    id: "maps",
    title: "Maps",
    description:
      "Choropleth maps — dot grids, markers and a 3D camera that flies to what you click.",
  },
];
