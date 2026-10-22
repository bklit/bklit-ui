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

/** One minimal line chart entry per library: the same pieces the adapters use. */
const ENTRIES = {
  bklit: `export { ChartTooltip, Grid, Line, LineChart, XAxis } from "@bklitui/ui/charts";`,
  recharts: `export { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";`,
  // Line chart as benchmarked: tooltip + crosshair, monotone curve, time
  // scale, and the motion() renderer used when animation is on.
  tanstack: `export { crosshair, defineChart, lineY } from "@tanstack/charts";
export { d3Curve } from "@tanstack/charts/d3/shape";
export { motion } from "@tanstack/charts/motion";
export { Chart } from "@tanstack/charts/react";
export { Chart as RendererChart } from "@tanstack/charts/react/core";
export { scaleLinear } from "@tanstack/charts/scales/linear";
export { tooltip } from "@tanstack/charts/tooltip";
export { scaleTime } from "d3-scale";
export { curveMonotoneX } from "d3-shape";`,
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

const sizes = {};
for (const [library, contents] of Object.entries(ENTRIES)) {
  sizes[library] = await measure(library, contents);
  const { minBytes, gzipBytes } = sizes[library];
  console.log(
    `${library.padEnd(9)} ${(minBytes / 1024).toFixed(1).padStart(7)} KB min  ${(gzipBytes / 1024).toFixed(1).padStart(6)} KB gzip`
  );
}

writeFileSync(outFile, `${JSON.stringify(sizes, null, 2)}\n`);
console.log(`Wrote ${outFile}`);
