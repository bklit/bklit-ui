/**
 * Syncs stat-card blocks from apps/web/blocks into registry sources and registry.json
 * (shadcn add + Open in v0). Run from packages/ui after generate-v0-examples.mjs.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiRoot = join(__dirname, "..");
const webBlocksRoot = join(uiRoot, "../../apps/web/blocks");
const registryBlocksRoot = join(uiRoot, "registry/blocks");
const examplesDir = join(uiRoot, "registry/examples");
const registryPath = join(uiRoot, "registry.json");

const BLOCK_CHART_INDEX = {
  "stat-card-area-01": `export { AreaSparkline, useSparklineHover } from "./sparkline";
export { ChartStatFlow } from "./chart-stat-flow";`,
  "stat-card-line-01": `export { LineSparkline, useSparklineHover } from "./sparkline";
export { ChartStatFlow } from "./chart-stat-flow";`,
  "stat-card-choropleth-01": `export { type ChoroplethFeature, ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip, useChoropleth } from "./choropleth";
export { ChartStatFlow } from "./chart-stat-flow";`,
};

/** @type {Record<string, { title: string, description: string, previewMaxWidth: string, registryDependencies: string[], dependencies: string[], files: string[], extraFiles?: { path: string, target: string, content?: string }[] }>} */
const BLOCKS = {
  "stat-card-area-01": {
    title: "Stat Card Area",
    description:
      "Revenue stat card with a gradient area sparkline, hover-to-read values, NumberFlow, and trend badge",
    previewMaxWidth: "max-w-md",
    registryDependencies: [
      "@bklit/sparkline",
      "@bklit/chart-stat-flow",
      "card",
      "badge",
    ],
    dependencies: ["@number-flow/react"],
    files: [
      "components/stat-card-area.tsx",
      "components/stat-card-chart.tsx",
      "components/stat-card-sparkline-hover.ts",
      "components/trend-badge.tsx",
      "data/revenue-series.ts",
    ],
  },
  "stat-card-line-01": {
    title: "Stat Card Line",
    description:
      "Sessions stat card with a line sparkline, hover-to-read values, overlaid NumberFlow, and trend badge",
    previewMaxWidth: "max-w-md",
    registryDependencies: [
      "@bklit/sparkline",
      "@bklit/chart-stat-flow",
      "card",
      "badge",
    ],
    dependencies: ["@number-flow/react"],
    files: [
      "components/stat-card-line.tsx",
      "components/stat-card-chart.tsx",
      "components/stat-card-sparkline-hover.ts",
      "components/trend-badge.tsx",
      "data/sessions-series.ts",
    ],
  },
  "stat-card-choropleth-01": {
    title: "Stat Card Choropleth",
    description:
      "Visitor map stat card with choropleth sparkline, NumberFlow, and trend badge",
    previewMaxWidth: "max-w-3xl",
    registryDependencies: [
      "@bklit/choropleth-chart",
      "@bklit/chart-stat-flow",
      "card",
      "badge",
    ],
    dependencies: [
      "@number-flow/react",
      "@types/geojson",
      "@types/topojson-specification",
      "topojson-client",
    ],
    files: [
      "components/stat-card-choropleth.tsx",
      "components/stat-card-choropleth-hover-bridge.tsx",
      "components/stat-card-chart.tsx",
      "components/trend-badge.tsx",
      "data/visitors.ts",
      "lib/use-world-data.tsx",
    ],
  },
};

const COMPONENT_EXPORTS = {
  "stat-card-area-01": "StatCardArea",
  "stat-card-line-01": "StatCardLine",
  "stat-card-choropleth-01": "StatCardChoropleth",
};

/**
 * Icon packages must never reach a published block: `@central-icons-react/all`
 * is one ~6 MB module that cannot be tree-shaken, and `@bklitui/icons` is
 * workspace-only. Blocks inline the SVGs they need instead.
 */
const FORBIDDEN_IMPORT =
  /from\s+["'](@central-icons-react\/[^"']+|@bklitui\/icons)["']/;

function transformForRegistry(content, filePath) {
  const forbidden = content.match(FORBIDDEN_IMPORT);
  if (forbidden) {
    throw new Error(
      `${filePath} imports ${forbidden[1]}; inline the SVG instead so registry installs stay icon-light.`
    );
  }

  return content
    .replaceAll("@bklitui/ui/charts", "@/components/charts")
    .replaceAll("@/components/docs/use-world-data", "@/lib/use-world-data");
}

function copyBlockFile(blockId, relativePath) {
  const sourcePath = join(webBlocksRoot, blockId, "files", relativePath);
  const targetPath = join(registryBlocksRoot, blockId, relativePath);

  if (relativePath === "lib/use-world-data.tsx") {
    const sharedSource = join(
      uiRoot,
      "../../apps/web/components/docs/use-world-data.tsx"
    );
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sharedSource, targetPath);
    return;
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Block source not found: ${sourcePath}`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  const content = transformForRegistry(
    readFileSync(sourcePath, "utf8"),
    relativePath
  );
  writeFileSync(targetPath, content);
}

function blockRegistryFiles(blockId, relativePaths) {
  return relativePaths.map((relativePath) => ({
    path: `registry/blocks/${blockId}/${relativePath}`,
    type: relativePath.endsWith(".ts") ? "registry:lib" : "registry:component",
    target: relativePath,
  }));
}

function blockChartIndexFile(blockId) {
  if (!BLOCK_CHART_INDEX[blockId]) {
    return null;
  }

  return {
    path: `registry/examples/${blockId}-index.ts`,
    type: "registry:lib",
    target: "components/charts/index.ts",
  };
}

const chartStatFlowItem = {
  name: "chart-stat-flow",
  type: "registry:component",
  title: "Chart Stat Flow",
  description: "Animated stat value and label for chart overlays",
  registryDependencies: ["@bklit/utils"],
  dependencies: ["@number-flow/react", "motion"],
  files: [
    {
      path: "src/charts/chart-stat-flow.tsx",
      type: "registry:component",
      target: "components/charts/chart-stat-flow.tsx",
    },
  ],
};

mkdirSync(examplesDir, { recursive: true });
mkdirSync(registryBlocksRoot, { recursive: true });

for (const [blockId, spec] of Object.entries(BLOCKS)) {
  for (const relativePath of spec.files) {
    copyBlockFile(blockId, relativePath);
  }

  const exportName = COMPONENT_EXPORTS[blockId];
  const mainComponentPath = spec.files.find((file) =>
    file.startsWith("components/stat-card-")
  );
  const importPath = `@/components/${mainComponentPath
    ?.replace("components/", "")
    .replace(".tsx", "")}`;

  const exampleContent = `"use client";

import { ${exportName} } from "${importPath}";

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full ${spec.previewMaxWidth}">
        <${exportName} />
      </div>
    </main>
  );
}
`;

  writeFileSync(join(examplesDir, `${blockId}.tsx`), exampleContent);

  const chartIndex = BLOCK_CHART_INDEX[blockId];
  if (chartIndex) {
    writeFileSync(
      join(examplesDir, `${blockId}-index.ts`),
      `/** biome-ignore-all lint/performance/noBarrelFile: v0 registry example barrel for shadcn install */\n${chartIndex}\n`
    );
  }
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"));

registry.items = registry.items.filter(
  (item) =>
    item.name !== "chart-stat-flow" && !item.name.startsWith("stat-card-")
);

registry.items.push(chartStatFlowItem);

for (const [blockId, spec] of Object.entries(BLOCKS)) {
  const blockFiles = blockRegistryFiles(blockId, spec.files);
  const chartIndexFile = blockChartIndexFile(blockId);
  if (chartIndexFile) {
    blockFiles.push(chartIndexFile);
  }

  registry.items.push({
    name: blockId,
    type: "registry:block",
    title: spec.title,
    description: spec.description,
    registryDependencies: spec.registryDependencies,
    dependencies: spec.dependencies,
    files: blockFiles,
  });

  const exampleFiles = [
    {
      path: `registry/examples/${blockId}.tsx`,
      type: "registry:page",
      target: "app/page.tsx",
    },
  ];

  if (chartIndexFile) {
    exampleFiles.push(chartIndexFile);
  }

  registry.items.push({
    name: `${blockId}-example`,
    type: "registry:example",
    title: `${spec.title} Example`,
    description: `${spec.description} — demo for Open in v0`,
    registryDependencies: [`@bklit/${blockId}`],
    dependencies: spec.dependencies,
    files: exampleFiles,
  });
}

writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(
  `Synced ${Object.keys(BLOCKS).length} stat-card blocks into registry (${Object.keys(BLOCKS).length * 2 + 1} items).`
);
