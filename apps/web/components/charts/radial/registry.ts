import { radialDotBarVariant } from "@/components/charts/radial/dot-bar-example";
import { radialForecastDotBarVariant } from "@/components/charts/radial/forecast-dot-bar-example";
import { radialPopulationStackedBarVariant } from "@/components/charts/radial/population-stacked-bar-example";
import { radialLineVariant } from "@/components/charts/radial/radial-line-example";
import { radialStorageSemicircleVariant } from "@/components/charts/radial/storage-semicircle-example";
import { radialTemperatureAreaVariant } from "@/components/charts/radial/temperature-area-example";
import type { RadialGalleryVariant } from "@/components/charts/radial/types";

/**
 * Radial chart gallery variants, in page order — one per distinct layer /
 * layout (dot bars, patterned dots + forecast, line, area bands, band-axis
 * stacked bars, angular ring bars on a partial arc). Add a variant: create
 * `radial/<variant>-example.tsx` exporting a `RadialGalleryVariant`, then
 * append it here. Product-card compositions live in /recipes instead.
 */
export const radialChartVariants: RadialGalleryVariant[] = [
  radialDotBarVariant,
  radialForecastDotBarVariant,
  radialLineVariant,
  radialTemperatureAreaVariant,
  radialPopulationStackedBarVariant,
  radialStorageSemicircleVariant,
];
