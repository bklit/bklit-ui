#!/usr/bin/env node
// detect-recharts.mjs — inventory Recharts usage (direct or via shadcn's
// components/ui/chart.tsx wrapper) and propose a bklit target per chart.
//
// Usage (from the project root, Node >= 18, zero dependencies):
//   node detect-recharts.mjs [dir] [--format=json|table]
//
// Always exits 0 and always prints valid output; problems go in `errors`.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  ".git",
  ".turbo",
  ".vercel",
  ".output",
  "coverage",
  "storybook-static",
]);
const SOURCE_EXT = /\.(?:tsx|ts|jsx|js|mjs|cjs)$/;
const MAX_FILE_BYTES = 1_000_000;
const MAX_FILES = 20_000;

const CLEAN = "clean";
const WORKAROUND = "needs-workaround";
const KEEP = "keep-recharts";
const RANK = { [CLEAN]: 0, [WORKAROUND]: 1, [KEEP]: 2 };

/** Recharts chart roots -> bklit root export, registry slug, import file. */
const ROOTS = {
  LineChart: { bklit: "LineChart", slug: "line-chart", file: "line-chart" },
  AreaChart: { bklit: "AreaChart", slug: "area-chart", file: "area-chart" },
  BarChart: { bklit: "BarChart", slug: "bar-chart", file: "bar-chart" },
  ComposedChart: {
    bklit: "ComposedChart",
    slug: "composed-chart",
    file: "composed-chart",
  },
  ScatterChart: {
    bklit: "ScatterChart",
    slug: "scatter-chart",
    file: "scatter-chart",
  },
  PieChart: { bklit: "PieChart", slug: "pie-chart", file: "pie-chart" },
  RadarChart: { bklit: "RadarChart", slug: "radar-chart", file: "radar-chart" },
  RadialBarChart: {
    bklit: "RingChart (or Gauge for a single 0-100 value)",
    slug: "ring-chart",
    file: "ring-chart",
  },
  FunnelChart: {
    bklit: "FunnelChart",
    slug: "funnel-chart",
    file: "funnel-chart",
  },
  Sankey: { bklit: "SankeyChart", slug: "sankey-chart", file: "sankey" },
  SunburstChart: {
    bklit: "SunburstChart",
    slug: "sunburst-chart",
    file: "sunburst-chart",
  },
  Treemap: { bklit: null, slug: null, file: null },
};

const TIME_SERIES_ROOTS = new Set([
  "LineChart",
  "AreaChart",
  "ComposedChart",
  "ScatterChart",
]);
const CARTESIAN_ROOTS = new Set([...TIME_SERIES_ROOTS, "BarChart"]);
const DATE_LIKE_KEY = /date|time|day|week|timestamp|^ts$|^t$|period|at$/i;
const SHADCN_WRAPPER_EXPORTS = new Set([
  "ChartContainer",
  "ChartTooltip",
  "ChartTooltipContent",
  "ChartLegend",
  "ChartLegendContent",
  "ChartStyle",
  "ChartConfig",
]);

const RE_IMPORT =
  /import\s+(type\s+)?([\s\S]*?)\s+from\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
const RE_TAG_OPEN = /<([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)(?=[\s/>])/g;
const RE_BRACES = /\{([\s\S]*)\}/;
const RE_TYPE_PREFIX = /^type\s+/;
const RE_AS = /\s+as\s+/;
const RE_NAMESPACE = /\*\s+as\s+([A-Za-z_$][\w$]*)/;
const RE_TAG_NAME_CHAR = /[\w$.]/;
const RE_SPACE = /\s/;
const RE_ATTR_NAME = /^[A-Za-z_$][\w$:-]*/;
const RE_IDENT_CHAR = /[\w$]/;
const RE_ESCAPE = /[.$]/g;
const RE_WRAPPER_HINT = /ChartContainer|components\/ui\/chart|\/chart["']/;
const RE_RECHARTS_SOURCE = /^recharts(?:\/|$)/;
const RE_WRAPPER_SOURCE = /(?:^|\/)ui\/chart$|(?:^|\/)chart$/;
const RE_DEFINES_WRAPPER = /(?:function|const)\s+ChartContainer\b/;
const RE_CHART_CONFIG = /\bChartConfig\b/;
const RE_COLOR_VAR = /var\(--color-([\w-]+)\)/g;
const RE_SCRIPT_EXT = /\.(?:tsx|ts|jsx|js)$/;
const RE_ALIAS_PREFIX = /^[@~#]\//;

// ---------------------------------------------------------------- scanning

/** Replace comments with spaces (newlines kept) so line numbers stay valid. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: single-pass character scanner
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += n ?? "";
        i += 2;
        continue;
      }
      if (c === quote) {
        quote = null;
      }
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }
    if (c === "/" && n === "*") {
      out += "  ";
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      out += "  ";
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

function lineAt(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i += 1) {
    if (src[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

/** Parse `{ A, B as C, type D }` import specifiers -> [{ imported, local }]. */
function parseSpecifiers(clause) {
  const braces = clause.match(RE_BRACES);
  if (!braces) {
    return [];
  }
  return braces[1]
    .split(",")
    .map((s) => s.trim().replace(RE_TYPE_PREFIX, ""))
    .filter(Boolean)
    .map((s) => {
      const [imported, local] = s.split(RE_AS).map((p) => p.trim());
      return { imported, local: local || imported };
    });
}

function collectImports(code) {
  const imports = [];
  for (const m of code.matchAll(RE_IMPORT)) {
    const source = m[3] || m[4];
    const clause = m[2] || "";
    const ns = clause.match(RE_NAMESPACE);
    imports.push({
      source,
      typeOnly: Boolean(m[1]),
      namespace: ns ? ns[1] : null,
      specifiers: parseSpecifiers(clause),
      line: lineAt(code, m.index ?? 0),
    });
  }
  return imports;
}

/** Scan a JSX opening tag starting at `<`; returns { end, attrs, selfClosing }. */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: single-pass JSX attribute scanner
function readTag(code, start) {
  let i = start + 1;
  while (i < code.length && RE_TAG_NAME_CHAR.test(code[i])) {
    i += 1;
  }
  const attrs = {};
  while (i < code.length) {
    const c = code[i];
    if (RE_SPACE.test(c)) {
      i += 1;
      continue;
    }
    if (c === "/" && code[i + 1] === ">") {
      return { end: i + 2, attrs, selfClosing: true };
    }
    if (c === ">") {
      return { end: i + 1, attrs, selfClosing: false };
    }
    if (c === "{") {
      // spread props: {...rest}
      const close = skipBalanced(code, i);
      attrs["{...spread}"] = code.slice(i, close);
      i = close;
      continue;
    }
    const nameMatch = RE_ATTR_NAME.exec(code.slice(i, i + 80));
    if (!nameMatch) {
      i += 1;
      continue;
    }
    const name = nameMatch[0];
    i += name.length;
    while (RE_SPACE.test(code[i] ?? "")) {
      i += 1;
    }
    if (code[i] !== "=") {
      attrs[name] = "true";
      continue;
    }
    i += 1;
    while (RE_SPACE.test(code[i] ?? "")) {
      i += 1;
    }
    const q = code[i];
    if (q === '"' || q === "'") {
      const close = code.indexOf(q, i + 1);
      const stop = close === -1 ? code.length : close + 1;
      attrs[name] = code.slice(i, stop);
      i = stop;
    } else if (q === "{") {
      const close = skipBalanced(code, i);
      attrs[name] = code.slice(i, close);
      i = close;
    } else {
      i += 1;
    }
  }
  return { end: code.length, attrs, selfClosing: true };
}

/** From an opening `{`, return the index just past its matching `}`. */
function skipBalanced(code, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < code.length; i += 1) {
    const c = code[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
      } else if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if (c === "{") {
      depth += 1;
    } else if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        return i + 1;
      }
    }
  }
  return code.length;
}

/** Every JSX opening tag whose name resolves to a known component. */
function collectTags(code, resolveName) {
  const tags = [];
  for (const m of code.matchAll(RE_TAG_OPEN)) {
    const prev = code[(m.index ?? 0) - 1] ?? "";
    if (RE_IDENT_CHAR.test(prev)) {
      continue;
    }
    const component = resolveName(m[1]);
    if (!component) {
      continue;
    }
    const start = m.index ?? 0;
    const { end, attrs, selfClosing } = readTag(code, start);
    tags.push({
      raw: m[1],
      component: component.name,
      origin: component.origin,
      start,
      end,
      attrs,
      selfClosing,
      line: lineAt(code, start),
    });
  }
  return tags;
}

/** Index just past the `</raw>` that closes the tag opened at `tag.start`. */
function findClose(code, tag) {
  if (tag.selfClosing) {
    return tag.end;
  }
  const esc = tag.raw.replace(RE_ESCAPE, "\\$&");
  const re = new RegExp(`<(/?)${esc}(?=[\\s/>])`, "g");
  re.lastIndex = tag.end;
  let depth = 1;
  for (const m of code.matchAll(re)) {
    if ((m.index ?? 0) < tag.end) {
      continue;
    }
    if (m[1] === "/") {
      depth -= 1;
      if (depth === 0) {
        return (m.index ?? 0) + m[0].length;
      }
    } else {
      const inner = readTag(code, m.index ?? 0);
      if (!inner.selfClosing) {
        depth += 1;
      }
    }
  }
  return code.length;
}

const unquote = (v) =>
  typeof v === "string" ? v.replace(/^["'{]+|["'}]+$/g, "").trim() : v;

// ------------------------------------------------------------- classifying

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: flat list of independent mapping rules
function classifyChart(root, inner) {
  const target = ROOTS[root.component];
  const reasons = [];
  const notes = [];
  const slugs = new Set(target.slug ? [target.slug] : []);
  let level = CLEAN;
  const raise = (to, why) => {
    if (RANK[to] > RANK[level]) {
      level = to;
    }
    reasons.push(`${to}: ${why}`);
  };
  const byName = (name) => inner.filter((t) => t.component === name);
  const has = (name) => byName(name).length > 0;
  const rootAttrs = root.attrs;

  if (!target.slug) {
    raise(
      KEEP,
      "Treemap has no bklit equivalent (SunburstChart is the closest hierarchy chart)"
    );
  }

  const xAxes = byName("XAxis");
  const yAxes = byName("YAxis");
  const isTimeSeries = TIME_SERIES_ROOTS.has(root.component);
  const isCartesian = CARTESIAN_ROOTS.has(root.component);
  const layout = unquote(rootAttrs.layout);

  if (layout === "vertical") {
    if (root.component === "BarChart") {
      notes.push(
        'layout="vertical" -> BarChart orientation="horizontal" (naming is inverted); categories go on BarYAxis'
      );
    } else {
      raise(
        KEEP,
        `layout="vertical" on ${root.component} has no bklit equivalent (only BarChart has orientation)`
      );
    }
  }
  if (rootAttrs.syncId) {
    raise(
      WORKAROUND,
      "syncId: bklit charts do not sync hover across charts (drop it, or keep Recharts)"
    );
  }
  if (rootAttrs.stackOffset) {
    raise(
      WORKAROUND,
      `stackOffset=${unquote(rootAttrs.stackOffset)}: pre-normalise data (e.g. to percentages) before rendering`
    );
  }

  // X axis shape
  if (isTimeSeries) {
    const numericX = xAxes.some((t) => unquote(t.attrs.type) === "number");
    const xKey = xAxes.map((t) => unquote(t.attrs.dataKey)).find(Boolean);
    if (numericX && root.component === "ScatterChart") {
      raise(
        WORKAROUND,
        'numeric x (XAxis type="number"): bklit ScatterChart x is a time scale; pass numbers as-is, hide XAxis, show x in ChartTooltip content'
      );
    } else if (numericX && !(xKey && DATE_LIKE_KEY.test(xKey))) {
      raise(
        WORKAROUND,
        'numeric x (XAxis type="number"): bklit time-series charts treat x as Date; positions stay linear but XAxis labels/tooltip title render as dates'
      );
    } else if (xKey && !DATE_LIKE_KEY.test(xKey)) {
      raise(
        WORKAROUND,
        `x dataKey "${xKey}" looks categorical; ${target.bklit} needs Date (or ISO string) x values — map rows to dates or use BarChart`
      );
    }
    if (xKey && xKey !== "date") {
      notes.push(`set xDataKey="${xKey}" on ${target.bklit} (default "date")`);
    }
  } else if (root.component === "BarChart") {
    const categoryAxis = layout === "vertical" ? yAxes : xAxes;
    const key = categoryAxis.map((t) => unquote(t.attrs.dataKey)).find(Boolean);
    if (key && key !== "name") {
      notes.push(`set xDataKey="${key}" on BarChart (default "name")`);
    }
  }
  if (isCartesian) {
    if (xAxes.some((t) => t.attrs.tickFormatter)) {
      notes.push(
        isTimeSeries
          ? 'XAxis tickFormatter has no bklit prop: XAxis labels are fixed "MMM d"; tooltip title is "EEE, MMM d"'
          : "XAxis tickFormatter has no bklit prop: BarXAxis shows the raw category string (reformat the data instead)"
      );
    }
    if (xAxes.some((t) => t.attrs.angle)) {
      notes.push(
        "angled tick labels are not supported (bklit labels are horizontal HTML)"
      );
    }
    if (yAxes.some((t) => t.attrs.tickFormatter)) {
      notes.push("YAxis tickFormatter -> YAxis formatValue");
    }
    if (yAxes.some((t) => t.attrs.domain)) {
      raise(
        WORKAROUND,
        "YAxis domain: bklit has no y-domain prop (auto [0, max*1.1] niced for non-negative data)"
      );
    }
    // In a vertical-layout BarChart the YAxis is the category axis (BarYAxis).
    const valueYAxes =
      root.component === "BarChart" && layout === "vertical" ? [] : yAxes;
    if (valueYAxes.some((t) => unquote(t.attrs.hide) !== "true")) {
      slugs.add("y-axis");
    }
    if (yAxes.some((t) => t.attrs.yAxisId) && root.component !== "BarChart") {
      notes.push(
        "multiple y axes -> yAxisId on series + YAxis yAxisId/orientation"
      );
    }
  }

  // Series-level props
  const series = inner.filter((t) =>
    ["Line", "Area", "Bar", "Scatter"].includes(t.component)
  );
  if (series.some((t) => t.attrs.data)) {
    notes.push(
      "series-level `data` prop -> merge rows into the root chart `data` (bklit series only take a dataKey)"
    );
  }
  if (series.some((t) => t.attrs.name)) {
    notes.push(
      "series `name` -> ChartTooltip rows() labels / Legend items (default tooltip label is the dataKey)"
    );
  }
  const areaStack = byName("Area").filter((t) => t.attrs.stackId);
  if (areaStack.length > 0) {
    raise(
      WORKAROUND,
      "Area stackId: bklit areas do not stack — overlap them or pre-compute cumulative values"
    );
  }
  const barStackIds = new Set(
    byName("Bar")
      .map((t) => unquote(t.attrs.stackId))
      .filter(Boolean)
  );
  if (barStackIds.size === 1) {
    notes.push(
      root.component === "ComposedChart"
        ? "Bar stackId -> ComposedChart stacked (SeriesBar)"
        : "Bar stackId -> BarChart stacked"
    );
  } else if (barStackIds.size > 1) {
    raise(
      WORKAROUND,
      `${barStackIds.size} different Bar stackIds: bklit has one stack per chart (no named stack groups)`
    );
  }
  if (series.some((t) => t.attrs.shape)) {
    raise(KEEP, "custom `shape` renderer on a series has no bklit equivalent");
  }
  if (series.some((t) => t.attrs.label)) {
    raise(
      WORKAROUND,
      "series `label` prop: no value labels on bklit cartesian series"
    );
  }
  if (
    inner.some(
      (t) =>
        t.component === "Line" &&
        t.attrs.dot &&
        unquote(t.attrs.dot) !== "false"
    )
  ) {
    notes.push("Line dot -> showMarkers / markers");
  }
  for (const t of series) {
    const curve = unquote(t.attrs.type);
    if (curve) {
      notes.push(`type="${curve}" -> curve prop from @visx/curve`);
      break;
    }
  }

  // Unsupported children
  const unsupported = {
    LabelList: [
      WORKAROUND,
      "LabelList: no data labels in bklit (drop, or use Legend / PieCenter)",
    ],
    Label: [WORKAROUND, "Label: no in-SVG labels in bklit charts"],
    ErrorBar: [KEEP, "ErrorBar has no bklit equivalent"],
    Customized: [KEEP, "Customized renderer has no bklit equivalent"],
    ZAxis: [KEEP, "ZAxis (bubble size) has no bklit equivalent"],
    Brush: [
      WORKAROUND,
      "Brush -> ChartBrush/ChartBrushLayout exist in bklit source but are not shipped by any @bklit registry item",
    ],
    ReferenceLine: [
      WORKAROUND,
      "ReferenceLine -> Grid highlightRowValues (horizontal y) or a thin ReferenceArea",
    ],
    ReferenceDot: [
      WORKAROUND,
      "ReferenceDot -> ChartMarkers (date-anchored icon markers, not an (x, y) dot)",
    ],
  };
  const isRadial =
    root.component === "PieChart" || root.component === "RadialBarChart";
  if (isRadial && has("Label")) {
    notes.push(
      root.component === "PieChart"
        ? "center Label -> PieCenter (defaultLabel / children render fn)"
        : "center Label -> RingCenter (defaultLabel / children render fn)"
    );
  }
  for (const [name, [to, why]] of Object.entries(unsupported)) {
    if (isRadial && name === "Label") {
      continue;
    }
    if (has(name)) {
      raise(to, why);
    }
  }
  if (has("ReferenceArea")) {
    slugs.add("reference-area");
  }
  if (has("ReferenceDot")) {
    slugs.add("markers");
  }
  if (has("Legend")) {
    slugs.add("legend");
    notes.push(
      "Legend -> HTML <Legend items> from @bklit/legend, rendered outside the chart"
    );
  }
  const tooltip = byName("Tooltip");
  if (tooltip.some((t) => t.attrs.content)) {
    notes.push(
      "custom Tooltip content -> ChartTooltip rows(point) or content({ point, index })"
    );
  }

  // Chart-specific
  if (root.component === "PieChart") {
    const pies = byName("Pie");
    if (pies.length > 1) {
      raise(
        WORKAROUND,
        "multiple <Pie> rings: bklit PieChart renders one ring (use SunburstChart for nested data, or keep Recharts)"
      );
    }
    if (pies.some((t) => t.attrs.label || t.attrs.labelLine)) {
      raise(
        WORKAROUND,
        "Pie slice labels: not supported — use PieCenter + Legend instead"
      );
    }
    if (pies.some((t) => t.attrs.activeShape)) {
      notes.push(
        "activeShape -> PieSlice hoverEffect (translate | grow | none)"
      );
    }
    if (pies.some((t) => t.attrs.startAngle || t.attrs.endAngle)) {
      notes.push(
        "startAngle/endAngle: Recharts degrees (0 = 3 o'clock, CCW) -> radians (0 = 12 o'clock, CW): rad = (90 - deg) * PI / 180"
      );
    }
    notes.push(
      "Pie data -> PieChart data: { label, value, color? }[] + one <PieSlice index> per row"
    );
  }
  if (root.component === "RadarChart") {
    notes.push(
      "Radar: pivot data to metrics {key,label}[] + data {label, color?, values}[] normalised 0-100"
    );
  }
  if (root.component === "RadialBarChart") {
    notes.push(
      "RadialBar rows -> RingData { label, value, maxValue, color? }[]"
    );
  }
  if (root.component === "Sankey") {
    if (rootAttrs.node || rootAttrs.link) {
      raise(KEEP, "custom Sankey node/link renderers have no bklit equivalent");
    }
    notes.push(
      "Sankey { nodes: [{name}], links: [{source,target,value}] } is the same shape"
    );
  }
  if (root.component === "FunnelChart") {
    notes.push("Funnel rows -> FunnelChart data: { label, value, color? }[]");
  }
  if (root.component === "ComposedChart") {
    notes.push("Bar inside ComposedChart -> SeriesBar");
  }

  return {
    type: root.component,
    line: root.line,
    bklitTarget: target.bklit,
    slugs: [...slugs],
    classification: level,
    reasons,
    notes,
  };
}

// ---------------------------------------------------------------- per file

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: linear pipeline per file
function analyzeFile(absPath, relPath) {
  const src = readFileSync(absPath, "utf8");
  if (!(src.includes("recharts") || RE_WRAPPER_HINT.test(src))) {
    return null;
  }
  const code = stripComments(src);
  const imports = collectImports(code);
  const rechartsImports = imports.filter((imp) =>
    RE_RECHARTS_SOURCE.test(imp.source)
  );
  const wrapperImports = imports.filter(
    (imp) =>
      RE_WRAPPER_SOURCE.test(imp.source) &&
      imp.specifiers.some((s) => SHADCN_WRAPPER_EXPORTS.has(s.imported))
  );
  const definesWrapper =
    RE_DEFINES_WRAPPER.test(code) && rechartsImports.length > 0;

  if (rechartsImports.length === 0 && wrapperImports.length === 0) {
    return null;
  }

  // local name -> { name, origin }
  const locals = new Map();
  const namespaces = new Set();
  for (const imp of rechartsImports) {
    if (imp.namespace) {
      namespaces.add(imp.namespace);
    }
    for (const s of imp.specifiers) {
      locals.set(s.local, { name: s.imported, origin: "recharts" });
    }
  }
  for (const imp of wrapperImports) {
    for (const s of imp.specifiers) {
      locals.set(s.local, { name: s.imported, origin: "shadcn-chart" });
    }
  }
  const resolveName = (raw) => {
    if (raw.includes(".")) {
      const [ns, name] = raw.split(".");
      return namespaces.has(ns) ? { name, origin: "recharts" } : null;
    }
    return locals.get(raw) ?? null;
  };

  const tags = collectTags(code, resolveName);
  const components = [...new Set(tags.map((t) => t.component))].sort();
  const charts = [];
  for (const tag of tags) {
    if (tag.origin !== "recharts" || !(tag.component in ROOTS)) {
      continue;
    }
    // A root nested inside another root (e.g. Brush mini-chart) is analysed with its parent.
    if (charts.some((c) => tag.start > c._start && tag.start < c._end)) {
      continue;
    }
    const end = findClose(code, tag);
    const inner = tags.filter((t) => t.start > tag.start && t.start < end);
    const result = classifyChart(tag, inner);
    charts.push({ ...result, _start: tag.start, _end: end });
  }

  const wrapperUsage = tags.filter((t) => t.origin === "shadcn-chart");
  const shadcn =
    wrapperImports.length > 0
      ? {
          importedFrom: [...new Set(wrapperImports.map((i) => i.source))],
          components: [...new Set(wrapperUsage.map((t) => t.component))].sort(),
          usesChartConfig: RE_CHART_CONFIG.test(code),
          colorVars: [
            ...new Set([...code.matchAll(RE_COLOR_VAR)].map((m) => m[1])),
          ],
          containerClassNames: wrapperUsage
            .filter(
              (t) => t.component === "ChartContainer" && t.attrs.className
            )
            .map((t) => unquote(t.attrs.className)),
        }
      : null;

  const fileNotes = [];
  if (shadcn?.colorVars.length) {
    fileNotes.push(
      `var(--color-*) only exists inside ChartContainer — replace ${shadcn.colorVars
        .map((k) => `var(--color-${k})`)
        .join(", ")} with the ChartConfig colors (e.g. var(--chart-1))`
    );
  }
  const allKept =
    charts.length > 0 && charts.every((c) => c.classification === KEEP);
  if (
    components.includes("ResponsiveContainer") &&
    !definesWrapper &&
    !allKept
  ) {
    fileNotes.push(
      "ResponsiveContainer -> remove (bklit charts size to their parent; set aspectRatio)"
    );
  }

  let classification = charts.length === 0 ? null : CLEAN;
  for (const c of charts) {
    if (RANK[c.classification] > RANK[classification]) {
      classification = c.classification;
    }
  }

  return {
    path: relPath,
    role: definesWrapper ? "shadcn-chart-wrapper" : "chart-consumer",
    rechartsImports: rechartsImports.map((i) => ({
      source: i.source,
      line: i.line,
      namespace: i.namespace,
      names: i.specifiers.map((s) => s.imported),
    })),
    shadcn,
    components,
    charts: charts.map(({ _start, _end, ...rest }) => rest),
    classification,
    notes: fileNotes,
  };
}

function walk(dir, root, out, errors) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    errors.push({
      path: relative(root, dir) || ".",
      error: String(error.message ?? error),
    });
    return;
  }
  for (const entry of entries) {
    if (out.length >= MAX_FILES) {
      return;
    }
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!(SKIP_DIRS.has(entry.name) || entry.name.startsWith("."))) {
        walk(abs, root, out, errors);
      }
    } else if (
      entry.isFile() &&
      SOURCE_EXT.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
    ) {
      out.push(abs);
    }
  }
}

/**
 * Does `source` (imported from `fromPath`) point at `wrapperPath`? Relative
 * imports are resolved; aliases (`@/`, `~/`) match on the path suffix.
 */
function importTargets(fromPath, source, wrapperPath) {
  const target = wrapperPath.replace(RE_SCRIPT_EXT, "");
  if (source.startsWith(".")) {
    const parts = fromPath.split("/").slice(0, -1);
    for (const seg of source.split("/")) {
      if (seg === "..") {
        parts.pop();
      } else if (seg !== ".") {
        parts.push(seg);
      }
    }
    return parts.join("/") === target;
  }
  const bare = source.replace(RE_ALIAS_PREFIX, "");
  return target === bare || target.endsWith(`/${bare}`);
}

/** Closest wrapper (longest shared directory prefix) that `source` can resolve to. */
function resolveWrapper(fromPath, source, wrappers) {
  let best = null;
  let bestScore = -1;
  for (const w of wrappers) {
    if (w.path === fromPath || !importTargets(fromPath, source, w.path)) {
      continue;
    }
    const a = fromPath.split("/");
    const b = w.path.split("/");
    let score = 0;
    while (score < a.length && a[score] === b[score]) {
      score += 1;
    }
    if (score > bestScore) {
      best = w.path;
      bestScore = score;
    }
  }
  return best;
}

function toTable(report) {
  const rows = [
    "| File | Recharts / shadcn components | Chart(s) | bklit target | Class |",
    "|------|------------------------------|----------|--------------|-------|",
  ];
  for (const f of report.files) {
    const comps = f.components.join(", ") || "—";
    if (f.charts.length === 0) {
      rows.push(
        `| ${f.path} | ${comps} | ${f.role === "shadcn-chart-wrapper" ? "(wrapper)" : "—"} | — | — |`
      );
      continue;
    }
    for (const c of f.charts) {
      rows.push(
        `| ${f.path}:${c.line} | ${comps} | ${c.type} | ${c.bklitTarget ?? "none"} | ${c.classification} |`
      );
    }
  }
  const s = report.summary;
  rows.push(
    "",
    `Charts: ${s.charts} (clean ${s.clean}, needs-workaround ${s.workaround}, keep-recharts ${s.keep}).`,
    `Install: ${s.slugs.length ? `npx shadcn@latest add ${s.slugs.map((x) => `@bklit/${x}`).join(" ")}` : "nothing"}`
  );
  return rows.join("\n");
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: CLI entry with defensive try/catch
function main() {
  const args = process.argv.slice(2);
  const format = (
    args.find((a) => a.startsWith("--format=")) ?? "--format=json"
  ).split("=")[1];
  const dirArg = args.find((a) => !a.startsWith("--"));
  const root = resolve(dirArg ?? process.cwd());
  const errors = [];
  const files = [];
  let packageJson = null;

  try {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    packageJson = { recharts: deps.recharts ?? null };
  } catch {
    packageJson = null;
  }

  const paths = [];
  try {
    if (!statSync(root).isDirectory()) {
      throw new Error("not a directory");
    }
    walk(root, root, paths, errors);
  } catch (error) {
    errors.push({ path: root, error: String(error.message ?? error) });
  }

  for (const abs of paths) {
    const rel = relative(root, abs).split(sep).join("/");
    try {
      if (statSync(abs).size > MAX_FILE_BYTES) {
        continue;
      }
      const result = analyzeFile(abs, rel);
      if (result) {
        files.push(result);
      }
    } catch (error) {
      errors.push({ path: rel, error: String(error.message ?? error) });
    }
  }

  const wrappers = files.filter((f) => f.role === "shadcn-chart-wrapper");
  const charts = files.flatMap((f) => f.charts);
  const slugs = new Set();
  for (const c of charts) {
    if (c.classification !== KEEP) {
      for (const s of c.slugs) {
        slugs.add(s);
      }
    }
  }
  const report = {
    root,
    scannedFiles: paths.length,
    packageJson,
    summary: {
      files: files.length,
      charts: charts.length,
      clean: charts.filter((c) => c.classification === CLEAN).length,
      workaround: charts.filter((c) => c.classification === WORKAROUND).length,
      keep: charts.filter((c) => c.classification === KEEP).length,
      slugs: [...slugs].sort(),
    },
    // shadcn chart.tsx wrappers; remove one only when `importedBy` is empty.
    shadcnWrappers: wrappers.map((w) => ({
      path: w.path,
      importedBy: files
        .filter((f) =>
          f.shadcn?.importedFrom.some(
            (source) => resolveWrapper(f.path, source, wrappers) === w.path
          )
        )
        .map((f) => f.path),
    })),
    files,
    errors,
  };
  process.stdout.write(
    `${format === "table" ? toTable(report) : JSON.stringify(report, null, 2)}\n`
  );
}

try {
  main();
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({ files: [], errors: [{ path: ".", error: String(error?.message ?? error) }] }, null, 2)}\n`
  );
}
process.exitCode = 0;
