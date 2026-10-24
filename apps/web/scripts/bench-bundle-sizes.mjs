/**
 * Measures the minified + gzipped size of a minimal line chart per library for
 * the /benchmarks page. React and react-dom are external (every app already
 * ships them); everything else each library pulls in is counted.
 *
 * Run from the repo root:
 *   node apps/web/scripts/bench-bundle-sizes.mjs
 *
 * Writes apps/web/components/benchmarks/bundle-sizes.json.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(webRoot, "components/benchmarks/bundle-sizes.json");

/**
 * One minimal line chart entry per library: the same pieces the adapters use.
 * `animated` is what a run with animation on ships; `static` (only where it
 * differs) what a run with animation off ships.
 */
const ENTRIES = {
  bklit: {
    animated: `export { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";`,
  },
  recharts: {
    animated: `export { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";`,
  },
  // Line chart as benchmarked: tooltip + crosshair, monotone curve and time
  // scale. Animated runs use the opt-in motion() renderer host; static runs
  // the default Chart, without motion.
  tanstack: {
    animated: `export { crosshair, defineChart, lineY } from "@tanstack/charts";
export { d3Curve } from "@tanstack/charts/d3/shape";
export { motion } from "@tanstack/charts/motion";
export { Chart as RendererChart } from "@tanstack/charts/react/core";
export { scaleLinear } from "@tanstack/charts/scales/linear";
export { tooltip } from "@tanstack/charts/tooltip";
export { scaleTime } from "d3-scale";
export { curveMonotoneX } from "d3-shape";`,
    static: `export { crosshair, defineChart, lineY } from "@tanstack/charts";
export { d3Curve } from "@tanstack/charts/d3/shape";
export { Chart } from "@tanstack/charts/react";
export { scaleLinear } from "@tanstack/charts/scales/linear";
export { tooltip } from "@tanstack/charts/tooltip";
export { scaleTime } from "d3-scale";
export { curveMonotoneX } from "d3-shape";`,
  },
};

const EXTERNAL = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-dom/client",
];

async function measure(library, contents) {
  const result = await build({
    bundle: true,
    // `@import`ed CSS is not part of the JS cost we compare.
    loader: { ".css": "empty" },
    external: EXTERNAL,
    format: "esm",
    logLevel: "silent",
    minify: true,
    platform: "browser",
    // Turbopack/Next resolves package "exports" with these conditions.
    conditions: ["browser", "import", "module", "default"],
    stdin: {
      contents,
      loader: "ts",
      // Resolve packages exactly as apps/web does; esbuild applies each
      // package's own tsconfig `paths` (e.g. `@/lib/utils` in packages/ui).
      resolveDir: webRoot,
      sourcefile: `${library}-line-entry.ts`,
    },
    target: "es2022",
    treeShaking: true,
    write: false,
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const code = result.outputFiles[0].contents;
  return {
    entry: contents.replaceAll("\n", " "),
    minBytes: code.byteLength,
    gzipBytes: gzipSync(code, { level: 9 }).byteLength,
  };
}

function log(label, { minBytes, gzipBytes }) {
  console.log(
    `${label.padEnd(18)} ${(minBytes / 1024).toFixed(1).padStart(7)} KB min  ${(gzipBytes / 1024).toFixed(1).padStart(6)} KB gzip`
  );
}

const sizes = {};
for (const [library, entries] of Object.entries(ENTRIES)) {
  sizes[library] = await measure(library, entries.animated);
  log(library, sizes[library]);
  if (entries.static) {
    sizes[library].static = await measure(`${library}-static`, entries.static);
    log(`${library} (static)`, sizes[library].static);
  }
}

writeFileSync(outFile, `${JSON.stringify(sizes, null, 2)}\n`);
console.log(`Wrote ${outFile}`);
