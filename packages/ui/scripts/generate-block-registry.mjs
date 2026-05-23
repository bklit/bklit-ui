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

const TREND_BADGE_REGISTRY = `"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TrendBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;

  return (
    <Badge
      className={cn(
        positive &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        className
      )}
      variant={positive ? "outline" : "destructive"}
    >
      <Icon className="size-3" data-icon="inline-start" />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}
`;

const BLOCK_CHART_INDEX = {
  "stat-card-area-01": `export { AreaChart } from "./area-chart";
export { Area } from "./area";
export { ChartStatFlow } from "./chart-stat-flow";
export { LinearGradient } from "@visx/gradient";`,
  "stat-card-line-01": `export { LineChart } from "./line-chart";
export { Line } from "./line";
export { ChartStatFlow } from "./chart-stat-flow";`,
  "stat-card-choropleth-01": `export { ChoroplethChart, ChoroplethFeatureComponent, ChoroplethTooltip } from "./choropleth";
export { ChartStatFlow } from "./chart-stat-flow";`,
};

/** @type {Record<string, { title: string, description: string, previewMaxWidth: string, registryDependencies: string[], dependencies: string[], files: string[], extraFiles?: { path: string, target: string, content?: string }[] }>} */
const BLOCKS = {
  "stat-card-area-01": {
    title: "Stat Card Area",
    description:
      "Revenue stat card with gradient area sparkline, NumberFlow, and trend badge",
    previewMaxWidth: "max-w-md",
    registryDependencies: [
      "@bklit/area-chart",
      "@bklit/chart-stat-flow",
      "card",
      "badge",
    ],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@visx/gradient@4.0.1-alpha.0",
      "@number-flow/react",
      "lucide-react",
    ],
    files: [
      "components/stat-card-area.tsx",
      "components/stat-card-chart.tsx",
      "components/stat-card-hover-bridge.tsx",
      "components/stat-card-stat-styles.ts",
      "components/trend-badge.tsx",
      "data/revenue-series.ts",
    ],
  },
  "stat-card-line-01": {
    title: "Stat Card Line",
    description:
      "Sessions stat card with line sparkline, overlaid NumberFlow, and trend badge",
    previewMaxWidth: "max-w-md",
    registryDependencies: [
      "@bklit/line-chart",
      "@bklit/chart-stat-flow",
      "card",
      "badge",
    ],
    dependencies: [
      "@visx/curve@4.0.1-alpha.0",
      "@number-flow/react",
      "lucide-react",
    ],
    files: [
      "components/stat-card-line.tsx",
      "components/stat-card-chart.tsx",
      "components/stat-card-hover-bridge.tsx",
      "components/stat-card-stat-styles.ts",
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
      "lucide-react",
      "topojson-client",
    ],
    files: [
      "components/stat-card-choropleth.tsx",
      "components/stat-card-choropleth-hover-bridge.tsx",
      "components/stat-card-chart.tsx",
      "components/stat-card-stat-styles.ts",
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

function transformForRegistry(content, filePath) {
  if (filePath.endsWith("trend-badge.tsx")) {
    return TREND_BADGE_REGISTRY;
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
  registry.items.push({
    name: blockId,
    type: "registry:block",
    title: spec.title,
    description: spec.description,
    registryDependencies: spec.registryDependencies,
    dependencies: spec.dependencies,
    files: blockRegistryFiles(blockId, spec.files),
  });

  const exampleFiles = [
    {
      path: `registry/examples/${blockId}.tsx`,
      type: "registry:page",
      target: "app/page.tsx",
    },
  ];

  if (BLOCK_CHART_INDEX[blockId]) {
    exampleFiles.push({
      path: `registry/examples/${blockId}-index.ts`,
      type: "registry:lib",
      target: "components/charts/index.ts",
    });
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
