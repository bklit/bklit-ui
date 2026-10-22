/**
 * Writes the chart gallery's variation count (each chart type's hero plus its
 * example cards) for the homepage "Browse n charts" button. The gallery module
 * is client-only, so the count is generated rather than imported at render.
 *
 * Runs as part of `pnpm build` (apps/web). Manual run:
 *   node --conditions=import --import tsx scripts/count-chart-variations.tsx
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chartExampleVariationCount } from "../components/charts/chart-examples";

const outFile = join(
  dirname(fileURLToPath(import.meta.url)),
  "../components/charts/chart-variation-count.json"
);

const next = `${JSON.stringify({ count: chartExampleVariationCount() }, null, 2)}\n`;
let previous = "";
try {
  previous = readFileSync(outFile, "utf8");
} catch {
  // First run: no file yet.
}

if (next === previous) {
  console.log("Chart variation count unchanged.");
} else {
  writeFileSync(outFile, next);
  console.log(`Wrote ${outFile}: ${next.trim()}`);
}
