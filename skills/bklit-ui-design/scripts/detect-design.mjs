#!/usr/bin/env node
/**
 * detect-design.mjs — read a project's design signals for bklit chart styling.
 *
 * Zero dependencies, Node >= 18. Never throws: anything it cannot read comes
 * back as null / [] and a note in `warnings`.
 *
 * Usage (from the user's project root):
 *   node <path-to-skill>/scripts/detect-design.mjs [projectDir]
 *
 * Prints one JSON object to stdout. Fields:
 *   tailwindVersion   "v4" | "v3" | null
 *   cssPath           globals stylesheet (components.json tailwind.css or a common location)
 *   cssFilesScanned   that file plus relative @imports it follows (depth <= 3)
 *   colorFormat       "oklch" | "oklab" | "hsl" | "hsl-channels" | "rgb" | "hex" |
 *                     "tailwind-var" | "color-mix" | "var" | null
 *                     ("hsl-channels" = shadcn v3 style bare `222 47% 11%` values;
 *                      "tailwind-var" = var(--color-neutral-800) palette references)
 *   darkMode          { strategy, darkSelector, customVariant, prefersColorScheme,
 *                       nextThemes, tailwindConfigDarkMode }
 *   tokens            { light: {...}, dark: {...} } for --primary, --background,
 *                     --foreground, --muted, --border, --radius, --ring, --accent
 *   chartVars         { light: {--chart-*}, dark: {--chart-*} }
 *   chartVarsFormat   format of --chart-1 (same values as colorFormat)
 *   themeInline       --color-chart-* / --color-legend-* names already mapped in @theme
 *   radius            light --radius value or null
 *   components        components.json summary (style, baseColor, cssVariables, aliases,
 *                     iconLibrary, registries)
 *   primitives        { baseUi, radix, coss }
 *   chartLibs         chart packages in package.json
 *   chartsDir         resolved components/charts directory (if it exists)
 *   bklit             { installed, registryConfigured, files: [...] }
 *   framework         "next" | "vite" | "remix" | "react-router" | "astro" | null
 *   warnings          human-readable issues relevant to bklit theming
 *
 * Sample output (run against apps/web in the bklit-ui monorepo, trimmed):
 * {
 *   "tailwindVersion": "v4",
 *   "cssPath": "app/globals.css",
 *   "cssFilesScanned": ["app/globals.css", "../../packages/studio/src/styles/studio-theme.css", ...],
 *   "colorFormat": "tailwind-var",
 *   "darkMode": { "strategy": "class", "darkSelector": true, "customVariant": true,
 *                 "prefersColorScheme": false, "nextThemes": true, "tailwindConfigDarkMode": null },
 *   "chartVars": { "light": { "--chart-1": "var(--color-stone-700)", ... },
 *                  "dark": { "--chart-1": "var(--color-zinc-800)", ... } },
 *   "chartVarsFormat": "tailwind-var",
 *   "themeInline": ["--color-chart-label", "--color-chart-tooltip-background", ...],
 *   "radius": "0.625rem",
 *   "components": { "style": "base-vega", "baseColor": "zinc", "cssVariables": true, ... },
 *   "primitives": { "baseUi": true, "radix": [], "coss": true },
 *   "chartLibs": ["@visx/brush", "@visx/curve", ..., "recharts"],
 *   "chartsDir": "components/charts",
 *   "bklit": { "installed": false, "registryConfigured": false, "files": [] },
 *   "framework": "next",
 *   "warnings": ["@bklit is not listed in components.json registries ..."]
 * }
 *
 * Sample output (Tailwind v3 + shadcn hsl fixture, trimmed):
 * {
 *   "tailwindVersion": "v3",
 *   "colorFormat": "hsl-channels",
 *   "chartVarsFormat": "hsl-channels",
 *   "darkMode": { "strategy": "class", "tailwindConfigDarkMode": "[class]", ... },
 *   "radius": "0.25rem",
 *   "chartLibs": ["recharts"],
 *   "warnings": [
 *     "--chart-1..5 are bare HSL channels (e.g. `12 76% 61%`) ...",
 *     "Tailwind v3: bklit uses utility classes ... add them to theme.extend.colors ...",
 *     "Tailwind v3: --color-red-500 / --color-emerald-500 ... do not exist ..."
 *   ]
 * }
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

// ─── Regexes (top level for performance) ─────────────────────────────

const CSS_IMPORT_RE = /@import\s+(?:url\()?["']([^"']+)["']/g;
const BLOCK_COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT_RE = /(^|[^:"'])\/\/.*$/gm;
const TRAILING_COMMA_RE = /,(\s*[}\]])/g;
const DIGITS_RE = /(\d+)/;
const CUSTOM_PROP_DECL_RE = /^(--[\w-]+)\s*:\s*([\s\S]+)$/;
const WHITESPACE_RE = /\s+/g;
const THEME_AT_RULE_RE = /@theme/;
const DARK_CONTEXT_RE =
  /\.dark\b|\[data-theme=["']?dark|\[data-mode=["']?dark|prefers-color-scheme:\s*dark/;
const LIGHT_CONTEXT_RE = /:root|(^|[\s>,])html\b|:host|\[data-theme=["']?light/;
const HSL_CHANNELS_RE =
  /^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/;
const TW4_IMPORT_RE = /@import\s+["']tailwindcss["']/;
const TW3_DIRECTIVE_RE = /@tailwind\s+(base|components|utilities)/;
const QUOTES_AND_SPACE_RE = /["'\s]/g;
const DARK_CLASS_RE = /\.dark\b/;
const CUSTOM_VARIANT_DARK_RE = /@custom-variant\s+dark\b/;
const PREFERS_DARK_RE = /prefers-color-scheme:\s*dark/;
const DATA_THEME_DARK_RE = /\[data-theme=["']?dark/;
const COSS_RE = /coss/i;
const ALIAS_PREFIX_RE = /^[@~#]\//;
const SCRIPT_EXT_RE = /\.(tsx?|jsx?)$/;
const DARK_MODE_CONFIG_RE = /darkMode\s*:\s*(\[[^\]]*\]|["'][^"']+["'])/;

const root = resolve(process.argv[2] || process.cwd());
const warnings = [];

function safe(fn, fallback = null) {
  try {
    const value = fn();
    return value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

function readText(file) {
  return safe(() => readFileSync(file, "utf8"));
}

function readJson(file) {
  const text = readText(file);
  if (!text) {
    return null;
  }
  return (
    safe(() => JSON.parse(text)) ?? safe(() => JSON.parse(stripJsonc(text)))
  );
}

function stripJsonc(text) {
  return text
    .replace(BLOCK_COMMENT_RE, "")
    .replace(LINE_COMMENT_RE, "$1")
    .replace(TRAILING_COMMA_RE, "$1");
}

function isFile(file) {
  return safe(() => statSync(file).isFile(), false);
}

function isDir(file) {
  return safe(() => statSync(file).isDirectory(), false);
}

function rel(file) {
  return file ? relative(root, file) || "." : null;
}

// ─── package.json ────────────────────────────────────────────────────

const pkg = readJson(join(root, "package.json")) || {};
const deps = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
  ...(pkg.peerDependencies || {}),
};
const depNames = Object.keys(deps);
const hasDep = (name) => Object.hasOwn(deps, name);

function majorOf(range) {
  if (typeof range !== "string") {
    return null;
  }
  const match = range.match(DIGITS_RE);
  return match ? Number(match[1]) : null;
}

// ─── components.json ─────────────────────────────────────────────────

const componentsJson = readJson(join(root, "components.json"));

// ─── Stylesheet discovery ────────────────────────────────────────────

const CSS_CANDIDATES = [
  "app/globals.css",
  "src/app/globals.css",
  "styles/globals.css",
  "src/styles/globals.css",
  "app/global.css",
  "src/global.css",
  "src/globals.css",
  "src/index.css",
  "src/styles.css",
  "app/app.css",
  "src/app.css",
  "app/styles/globals.css",
  "src/styles/global.css",
];

function findCssPath() {
  const fromConfig = componentsJson?.tailwind?.css;
  if (fromConfig && isFile(join(root, fromConfig))) {
    return join(root, fromConfig);
  }
  if (fromConfig) {
    warnings.push(
      `components.json tailwind.css points to ${fromConfig}, which does not exist.`
    );
  }
  for (const candidate of CSS_CANDIDATES) {
    const file = join(root, candidate);
    if (isFile(file)) {
      return file;
    }
  }
  return null;
}

const cssPath = findCssPath();

/** Follow relative @import "./x.css" chains (no packages) up to depth 3. */
function collectCss(entry) {
  const files = [];
  const seen = new Set();
  const visit = (file, depth) => {
    if (!file || seen.has(file) || depth > 3) {
      return;
    }
    seen.add(file);
    const text = readText(file);
    if (text == null) {
      return;
    }
    files.push({ file, text });
    for (const match of text.matchAll(CSS_IMPORT_RE)) {
      const spec = match[1];
      if (spec.startsWith(".") && spec.endsWith(".css")) {
        visit(resolve(dirname(file), spec), depth + 1);
      }
    }
  };
  visit(entry, 0);
  return files;
}

const cssFiles = cssPath ? collectCss(cssPath) : [];
const cssText = cssFiles.map((f) => f.text).join("\n");

// ─── Minimal CSS scanner: custom properties by selector context ──────

function stripComments(text) {
  return text.replace(BLOCK_COMMENT_RE, "");
}

/**
 * Walks the stylesheet tracking the selector / at-rule stack and records
 * every `--name: value` declaration with the innermost block header.
 */
function scanDeclarations(text) {
  const out = [];
  const src = stripComments(text);
  const stack = [];
  let buffer = "";
  for (const ch of src) {
    if (ch === "{") {
      stack.push(buffer.trim());
      buffer = "";
    } else if (ch === "}") {
      flushDecl(buffer, stack, out);
      buffer = "";
      stack.pop();
    } else if (ch === ";") {
      flushDecl(buffer, stack, out);
      buffer = "";
    } else {
      buffer += ch;
    }
  }
  return out;
}

function flushDecl(raw, stack, out) {
  const decl = raw.trim();
  const match = decl.match(CUSTOM_PROP_DECL_RE);
  if (!match || stack.length === 0) {
    return;
  }
  out.push({
    name: match[1],
    value: match[2].trim().replace(WHITESPACE_RE, " "),
    context: stack.join(" > "),
  });
}

function classifyContext(context) {
  if (THEME_AT_RULE_RE.test(context)) {
    return "theme";
  }
  if (DARK_CONTEXT_RE.test(context)) {
    return "dark";
  }
  if (LIGHT_CONTEXT_RE.test(context)) {
    return "light";
  }
  return "other";
}

const declarations = safe(() => scanDeclarations(cssText), []);
const byMode = { light: {}, dark: {}, theme: {} };
for (const d of declarations) {
  const mode = classifyContext(d.context);
  if (mode !== "other") {
    byMode[mode][d.name] = d.value;
  }
}

function colorFormatOf(value) {
  if (typeof value !== "string") {
    return null;
  }
  const v = value.trim().toLowerCase();
  if (v.startsWith("oklch(")) {
    return "oklch";
  }
  if (v.startsWith("oklab(")) {
    return "oklab";
  }
  if (v.startsWith("hsl")) {
    return "hsl";
  }
  if (v.startsWith("rgb")) {
    return "rgb";
  }
  if (v.startsWith("#")) {
    return "hex";
  }
  if (HSL_CHANNELS_RE.test(v)) {
    return "hsl-channels";
  }
  if (v.startsWith("var(--color-")) {
    return "tailwind-var";
  }
  if (v.startsWith("color-mix(")) {
    return "color-mix";
  }
  if (v.startsWith("var(")) {
    return "var";
  }
  return null;
}

const TOKEN_NAMES = [
  "--primary",
  "--primary-foreground",
  "--background",
  "--foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--border",
  "--ring",
  "--radius",
];

function pick(mode, names) {
  const out = {};
  for (const name of names) {
    if (byMode[mode][name] != null) {
      out[name] = byMode[mode][name];
    }
  }
  return out;
}

function chartVarsFor(mode) {
  const out = {};
  for (const [name, value] of Object.entries(byMode[mode])) {
    if (name.startsWith("--chart-") || name.startsWith("--legend")) {
      out[name] = value;
    }
  }
  return out;
}

const tokens = {
  light: pick("light", TOKEN_NAMES),
  dark: pick("dark", TOKEN_NAMES),
};
const chartVars = { light: chartVarsFor("light"), dark: chartVarsFor("dark") };

const colorFormat =
  colorFormatOf(tokens.light["--primary"]) ??
  colorFormatOf(tokens.light["--background"]) ??
  colorFormatOf(tokens.light["--foreground"]) ??
  null;
const chartVarsFormat = colorFormatOf(chartVars.light["--chart-1"]);

const themeInline = Object.keys(byMode.theme).filter(
  (name) =>
    name.startsWith("--color-chart") || name.startsWith("--color-legend")
);

// ─── Tailwind version ────────────────────────────────────────────────

const tailwindConfigFile = [
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.mjs",
  "tailwind.config.cjs",
].find((f) => isFile(join(root, f)));

function detectTailwind() {
  if (TW4_IMPORT_RE.test(cssText)) {
    return "v4";
  }
  if (hasDep("@tailwindcss/postcss") || hasDep("@tailwindcss/vite")) {
    return "v4";
  }
  const major = majorOf(deps.tailwindcss);
  if (major != null && major >= 4) {
    return "v4";
  }
  if (TW3_DIRECTIVE_RE.test(cssText)) {
    return "v3";
  }
  if (tailwindConfigFile || (major != null && major <= 3)) {
    return "v3";
  }
  return null;
}

const tailwindVersion = safe(detectTailwind);

// ─── Dark mode ───────────────────────────────────────────────────────

const tailwindConfigText = tailwindConfigFile
  ? readText(join(root, tailwindConfigFile))
  : null;
const tailwindConfigDarkMode = safe(() => {
  const m = tailwindConfigText?.match(DARK_MODE_CONFIG_RE);
  return m ? m[1].replace(QUOTES_AND_SPACE_RE, "") : null;
});
const darkSelector =
  Object.keys(byMode.dark).length > 0 && DARK_CLASS_RE.test(cssText);
const customVariant = CUSTOM_VARIANT_DARK_RE.test(cssText);
const prefersColorScheme = PREFERS_DARK_RE.test(cssText);
const dataThemeDark = DATA_THEME_DARK_RE.test(cssText);
const nextThemes = hasDep("next-themes");

let darkStrategy = null;
if (
  darkSelector ||
  customVariant ||
  tailwindConfigDarkMode?.includes("class")
) {
  darkStrategy = "class";
} else if (dataThemeDark) {
  darkStrategy = "data-attribute";
} else if (prefersColorScheme || tailwindConfigDarkMode === "media") {
  darkStrategy = "media";
}

// ─── Primitives, chart libs, framework ───────────────────────────────

const radix = depNames.filter(
  (d) => d.startsWith("@radix-ui/") || d === "radix-ui"
);
const baseUi = hasDep("@base-ui/react") || hasDep("@base-ui-components/react");
const registries = componentsJson?.registries || {};
const coss =
  Object.keys(registries).includes("@coss") ||
  COSS_RE.test(String(componentsJson?.style || ""));

const CHART_LIB_PATTERNS = [
  /^recharts$/,
  /^@visx\//,
  /^chart\.js$/,
  /^react-chartjs-2$/,
  /^@nivo\//,
  /^echarts/,
  /^@tremor\//,
  /^victory/,
  /^d3$/,
  /^@unovis\//,
  /^apexcharts$/,
  /^react-apexcharts$/,
  /^highcharts/,
  /^@mui\/x-charts$/,
];
const chartLibs = depNames.filter((d) =>
  CHART_LIB_PATTERNS.some((re) => re.test(d))
);

let framework = null;
if (hasDep("next")) {
  framework = "next";
} else if (hasDep("@remix-run/react")) {
  framework = "remix";
} else if (hasDep("react-router") && hasDep("@react-router/dev")) {
  framework = "react-router";
} else if (hasDep("astro")) {
  framework = "astro";
} else if (hasDep("vite")) {
  framework = "vite";
}

// ─── Existing charts directory / bklit install ──────────────────────

function resolveAliasDir(alias) {
  if (typeof alias !== "string") {
    return null;
  }
  const stripped = alias.replace(ALIAS_PREFIX_RE, "");
  for (const base of ["", "src/"]) {
    const dir = join(root, base + stripped);
    if (isDir(dir)) {
      return dir;
    }
  }
  return null;
}

const componentsDir =
  resolveAliasDir(componentsJson?.aliases?.components) ||
  ["components", "src/components"].map((d) => join(root, d)).find(isDir) ||
  null;
const chartsDirAbs = componentsDir ? join(componentsDir, "charts") : null;
const chartsDir = chartsDirAbs && isDir(chartsDirAbs) ? chartsDirAbs : null;

const BKLIT_MARKERS = [
  "chart-context.tsx",
  "background.tsx",
  "pattern-preset.tsx",
  "bar-squares.tsx",
  "bar-depth.tsx",
  "area-chart.tsx",
  "line-chart.tsx",
  "bar-chart.tsx",
  "pie-chart.tsx",
  "ring-chart.tsx",
  "grid.tsx",
  "reference-area.tsx",
  "projection-line.tsx",
  "trend-line.tsx",
];
const chartFiles = chartsDir
  ? safe(() => readdirSync(chartsDir).filter((f) => SCRIPT_EXT_RE.test(f)), [])
  : [];
const bklitFiles = chartFiles.filter((f) => BKLIT_MARKERS.includes(f));
for (const sub of ["patterns", "tooltip", "legend", "markers"]) {
  if (chartsDir && isDir(join(chartsDir, sub))) {
    bklitFiles.push(`${sub}/`);
  }
}
const bklitInstalled =
  bklitFiles.includes("chart-context.tsx") &&
  safe(
    () =>
      readText(join(chartsDir, "chart-context.tsx")).includes("chartCssVars"),
    false
  );

// ─── Warnings ────────────────────────────────────────────────────────

if (!componentsJson) {
  warnings.push(
    "No components.json — run `npx shadcn@latest init` before adding @bklit items."
  );
} else if (!Object.keys(registries).includes("@bklit")) {
  warnings.push(
    "@bklit is not listed in components.json registries. It resolves from the shadcn registry index; add it explicitly only if `shadcn add @bklit/<item>` cannot resolve it."
  );
}
if (componentsJson && componentsJson?.tailwind?.cssVariables === false) {
  warnings.push(
    "components.json cssVariables is false — bklit theming relies on CSS variables; shadcn will not write chart cssVars."
  );
}
if (!cssPath) {
  warnings.push(
    "Could not find the global stylesheet; chart tokens cannot be inspected."
  );
}
const chartKeys = Object.keys(chartVars.light);
const hasPalette = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
].every((k) => chartKeys.includes(k));
if (!hasPalette) {
  warnings.push(
    "--chart-1..5 are not all defined: `shadcn add @bklit/...` will insert bklit's default Primary palette (indigo, yellow, fuchsia, mist, black). Seed them from --primary instead (see rules/theming.md)."
  );
}
if (chartVarsFormat === "hsl-channels") {
  warnings.push(
    "--chart-1..5 are bare HSL channels (e.g. `12 76% 61%`). bklit reads them as var(--chart-N) directly, which is an invalid color. Scope a wrapper override with hsl(...) values (see rules/theming.md)."
  );
}
if (tailwindVersion === "v3") {
  warnings.push(
    "Tailwind v3: bklit uses utility classes text-chart-label, bg-chart-tooltip-background, text-chart-tooltip-foreground, text-chart-tooltip-muted, border-chart-tooltip-muted and *-legend-* — add them to theme.extend.colors (shadcn only writes @theme mappings on v4)."
  );
  warnings.push(
    "Tailwind v3: --color-red-500 / --color-emerald-500 (candlestick, profit-loss-line, scatter yGradient defaults) and --color-muted (funnel grid bands) do not exist; pass explicit colors."
  );
}
if (tailwindVersion === "v4" && chartKeys.length > 0) {
  const needed = [
    "--color-chart-label",
    "--color-chart-tooltip-background",
    "--color-chart-tooltip-foreground",
    "--color-chart-tooltip-muted",
  ];
  const missing = needed.filter((n) => !themeInline.includes(n));
  if (bklitInstalled && missing.length > 0) {
    warnings.push(
      `@theme inline is missing ${missing.join(", ")} — tooltip/axis label classes will not resolve.`
    );
  }
  const fourDash = themeInline.filter((n) =>
    String(byMode.theme[n]).includes("var(----")
  );
  if (fourDash.length > 0) {
    warnings.push(
      `@theme maps ${fourDash.join(", ")} to var(----…) (four dashes), which resolves empty — replace "var(----" with "var(--" (bklit-ui#235).`
    );
  }
}
if (
  darkStrategy === "class" &&
  Object.keys(chartVars.dark).length === 0 &&
  hasPalette
) {
  warnings.push(
    "Class-based dark mode but no --chart-* overrides in the dark block; charts will keep light-mode colors in dark mode."
  );
}
if (chartLibs.includes("recharts") && chartVarsFormat === "hsl-channels") {
  warnings.push(
    "recharts is installed and likely consumes hsl(var(--chart-N)); do not rewrite the global --chart-N values — scope bklit overrides instead."
  );
}

// ─── Output ──────────────────────────────────────────────────────────

const result = {
  root,
  tailwindVersion,
  tailwindConfig: tailwindConfigFile || null,
  cssPath: rel(cssPath),
  cssFilesScanned: cssFiles.map((f) => rel(f.file)),
  colorFormat,
  darkMode: {
    strategy: darkStrategy,
    darkSelector,
    customVariant,
    prefersColorScheme,
    dataThemeDark,
    nextThemes,
    tailwindConfigDarkMode,
  },
  tokens,
  radius: tokens.light["--radius"] ?? null,
  chartVars,
  chartVarsFormat,
  themeInline,
  components: componentsJson
    ? {
        style: componentsJson.style ?? null,
        baseColor: componentsJson.tailwind?.baseColor ?? null,
        cssVariables: componentsJson.tailwind?.cssVariables ?? null,
        iconLibrary: componentsJson.iconLibrary ?? null,
        aliases: componentsJson.aliases ?? null,
        registries: Object.keys(registries),
      }
    : null,
  primitives: { baseUi, radix, coss },
  chartLibs,
  chartsDir: rel(chartsDir),
  bklit: {
    installed: Boolean(bklitInstalled),
    registryConfigured: Object.keys(registries).includes("@bklit"),
    files: bklitFiles,
  },
  framework,
  warnings,
};

try {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch {
  process.stdout.write("{}\n");
}
