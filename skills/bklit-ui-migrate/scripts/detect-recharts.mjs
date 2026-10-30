#!/usr/bin/env node
// detect-recharts.mjs — inventory Recharts usage (direct or via shadcn's
// components/ui/chart.tsx wrapper) and TanStack Charts (`@tanstack/charts`)
// definitions, and propose a bklit target per chart. Tiny axis-less charts
// (Recharts "Tiny" examples, TanStack KPI sparklines) map to `@bklit/sparkline`.
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
const KEEP_TANSTACK = "keep-tanstack";
const RANK = { [CLEAN]: 0, [WORKAROUND]: 1, [KEEP]: 2, [KEEP_TANSTACK]: 2 };
const isKept = (level) => level === KEEP || level === KEEP_TANSTACK;

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

// ------------------------------------------------------------- sparklines

/** Recharts roots that can collapse to a `@bklit/sparkline` component. */
const SPARKLINE_ROOTS = {
  LineChart: { series: "Line", bklit: "LineSparkline" },
  AreaChart: { series: "Area", bklit: "AreaSparkline" },
  BarChart: { series: "Bar", bklit: "BarSparkline" },
};
/** Children that make a chart "a chart", not a sparkline. */
const CHART_CHROME = [
  "XAxis",
  "YAxis",
  "CartesianGrid",
  "Legend",
  "Brush",
  "ReferenceLine",
  "ReferenceArea",
  "ReferenceDot",
  "LabelList",
];
/** Height (px) at or below which an axis-less chart reads as a sparkline. */
const SPARKLINE_MAX_HEIGHT = 120;
/** Width (px) at or below which an axis-less chart reads as a sparkline. */
const SPARKLINE_MAX_WIDTH = 200;
const SPARKLINE_CURVES = new Set(["linear", "monotone", "natural", "step"]);
const RE_STYLE_SIZE = /\b(maxWidth|maxHeight|width|height)\s*:\s*["']?(\d+)/g;
const RE_TW_HEIGHT = /(?:^|\s)h-(?:\[(\d+)px\]|(\d+(?:\.5)?))(?=\s|$)/;
const RE_NUMBER = /^\d+(?:\.\d+)?$/;

// ---------------------------------------------------------- TanStack Charts

const RE_TANSTACK_SOURCE = /^@tanstack\/charts(?:\/|$)/;
/** TanStack marks bklit can express, by mark name. */
const TANSTACK_MAPPED_MARKS = new Set(["lineY", "areaY", "barY"]);
/** Every built-in TanStack mark (anything else imported is ignored). */
const TANSTACK_MARKS = new Set([
  "lineY",
  "areaX",
  "areaY",
  "barX",
  "barY",
  "dot",
  "rect",
  "cell",
  "ruleX",
  "ruleY",
  "text",
  "arrow",
  "frame",
  "hexagon",
  "link",
  "tickX",
  "tickY",
  "vector",
  "facet",
]);
const RE_AXIS_FALSE = /\baxis\s*:\s*false\b/;
const RE_AXIS_ON = /\baxis\s*:\s*(?:true|\{)/;
const RE_GRID_ON = /\bgrid\s*:\s*true\b/;
const RE_GUIDES_FALSE = /\bguides\s*:\s*false\b/;
const RE_TOOLTIP_WORD = /\btooltip\b/;
const RE_TOOLTIP_OFF = /\btooltip\s*:\s*false\b/;
const RE_LEGEND = /\blegend\s*:/;
const RE_Z_CHANNEL = /\bz\s*:/;
const RE_Y_KEY = /\by\s*:\s*["']([^"']+)["']/;
const RE_X_KEY = /\bx\s*:\s*["']([^"']+)["']/;
const RE_CURVE = /\bcurve\s*:\s*["']([^"']+)["']/;
const RE_ANIMATION = /\b(?:svgAnimation|motion)\b/;
const RE_DOMAIN = /\.domain\s*\(|\bdomain\s*:/;
const RE_GRADIENTS = /\bgradients\s*:/;
const RE_MARGIN = /\bmargin\s*:/;
const RE_STROKE = /\bstroke\s*:/;
const RE_STROKE_WIDTH = /\bstrokeWidth\s*:/;
const RE_ID_PREFIX = /\bidPrefix\b/;
const RE_ARIA_LABEL = /\bariaLabel\b/;
const RE_CURVE_AXIS_SUFFIX = /[XY]$/;
const RE_CURVE_PREFIX = /^curve/i;
const RE_PX_SUFFIX = /px$/;

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

/** From an opening `{` (or `open`), return the index just past its matching close. */
function skipBalanced(code, start, open = "{", close = "}") {
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
    } else if (c === open) {
      depth += 1;
    } else if (c === close) {
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
      notes.push(`type="${curve}" -> curve prop from d3-shape`);
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

// ------------------------------------------------------ sparkline detection

/** Numeric px value of a JSX attr (`{48}`, `"48"`, `48px`); null otherwise. */
function pxAttr(value) {
  const v = unquote(value);
  if (typeof v !== "string") {
    return null;
  }
  const n = v.replace(RE_PX_SUFFIX, "");
  return RE_NUMBER.test(n) ? Number(n) : null;
}

/**
 * Smallest known width / height of a chart root from its own props, its
 * `style` / `className`, and an enclosing `ResponsiveContainer`.
 */
function measureFootprint(root, container) {
  let width = null;
  let height = null;
  const take = (kind, n) => {
    if (n === null) {
      return;
    }
    if (kind === "w") {
      width = width === null ? n : Math.min(width, n);
    } else {
      height = height === null ? n : Math.min(height, n);
    }
  };
  for (const tag of [root, container].filter(Boolean)) {
    take("w", pxAttr(tag.attrs.width));
    take("h", pxAttr(tag.attrs.height));
    take("h", pxAttr(tag.attrs.maxHeight));
    for (const m of (tag.attrs.style ?? "").matchAll(RE_STYLE_SIZE)) {
      take(m[1].toLowerCase().includes("width") ? "w" : "h", Number(m[2]));
    }
    const tw = (unquote(tag.attrs.className) ?? "").match(RE_TW_HEIGHT);
    if (tw) {
      take("h", tw[1] ? Number(tw[1]) : Number(tw[2]) * 4);
    }
  }
  return { width, height };
}

/**
 * Is this Recharts root a sparkline? Line/Area/Bar with one series and no
 * axes, grid, legend or reference chrome. `small` says whether the footprint
 * is also sparkline-sized; size-unknown charts only get a note.
 */
function sparklineShape(root, inner, container) {
  const spec = SPARKLINE_ROOTS[root.component];
  if (!spec) {
    return null;
  }
  const visibleChrome = inner.filter(
    (t) =>
      t.origin === "recharts" &&
      CHART_CHROME.includes(t.component) &&
      unquote(t.attrs.hide) !== "true"
  );
  const series = inner.filter((t) =>
    ["Line", "Area", "Bar"].includes(t.component)
  );
  if (visibleChrome.length > 0 || series.length !== 1) {
    return null;
  }
  const { width, height } = measureFootprint(root, container);
  const small =
    (height !== null && height <= SPARKLINE_MAX_HEIGHT) ||
    (width !== null && width <= SPARKLINE_MAX_WIDTH);
  return { spec, series: series[0], width, height, small };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: flat list of independent prop mappings
function classifySparkline(root, inner, shape, container) {
  const { spec, series, width, height } = shape;
  const reasons = [];
  const notes = [];
  let level = CLEAN;
  const raise = (to, why) => {
    if (RANK[to] > RANK[level]) {
      level = to;
    }
    reasons.push(`${to}: ${why}`);
  };
  const a = series.attrs;
  const size = [
    width === null ? null : `${width}px wide`,
    height === null ? null : `${height}px tall`,
  ]
    .filter(Boolean)
    .join(", ");
  notes.push(
    `tiny ${root.component} (one ${spec.series}, no axes/grid${size ? `, ${size}` : ""}) -> ${spec.bklit} from @bklit/sparkline, not ${ROOTS[root.component].bklit}`
  );
  const dataKey = unquote(a.dataKey);
  if (dataKey) {
    notes.push(
      `${spec.series} dataKey="${dataKey}" -> ${spec.bklit} dataKey="${dataKey}"`
    );
  }
  if (container || root.attrs.responsive) {
    notes.push(
      "ResponsiveContainer / responsive -> omit width (sparklines fill the parent); keep height"
    );
  } else if (width !== null || height !== null) {
    notes.push("width / height (px) -> width / height (height defaults to 32)");
  }
  if (root.attrs.margin) {
    notes.push("margin -> padding (number or { top, right, bottom, left })");
  }
  const tooltip = inner.filter(
    (t) => t.component === "Tooltip" || t.component === "ChartTooltip"
  );
  if (tooltip.length > 0) {
    raise(
      WORKAROUND,
      "Tooltip: sparklines have no tooltip by design — drop it, read the hovered row with useSparklineHover() and render the value next to the sparkline"
    );
    if (tooltip.some((t) => unquote(t.attrs.cursor) === "false")) {
      notes.push("Tooltip cursor={false} -> crosshair={false}");
    }
  }
  const curve = unquote(a.type);
  if (curve && spec.series !== "Bar") {
    notes.push(
      SPARKLINE_CURVES.has(curve)
        ? `type="${curve}" -> curve="${curve}" (a string, not a d3-shape curve)`
        : `type="${curve}" has no sparkline curve — closest is curve="${curve.startsWith("step") ? "step" : "monotone"}"`
    );
  } else if (spec.series !== "Bar") {
    notes.push(
      'no type: Recharts defaults to linear, sparklines to monotone — set curve="linear" for parity'
    );
  }
  if (a.stroke) {
    notes.push("stroke -> color");
  } else if (a.fill) {
    notes.push("fill -> color");
  }
  if (spec.series === "Area" && a.fill && a.stroke) {
    notes.push(
      'Area fill + stroke -> color (the stroke) + fill="solid" | "gradient" with fillOpacity'
    );
  }
  if (a.strokeWidth && spec.series !== "Bar") {
    notes.push("strokeWidth -> strokeWidth (default 1.5)");
  }
  if (spec.series === "Line" && unquote(a.dot) !== "false") {
    notes.push(
      "Line dots on every point have no sparkline equivalent — endDot marks the last point, dot marks the hovered point"
    );
  }
  if (unquote(a.activeDot) === "false") {
    notes.push("activeDot={false} -> dot={false}");
  }
  if (unquote(a.isAnimationActive) === "false") {
    notes.push("isAnimationActive={false} -> animate={false}");
  }
  if (a.animationDuration) {
    notes.push("animationDuration -> animationDuration (ms, default 900)");
  }
  if (spec.series === "Bar" && a.radius) {
    notes.push(
      "Bar radius -> barRadius (one number, rounds the end away from the baseline)"
    );
  }
  if (a.shape || a.label || inner.some((t) => t.component === "Cell")) {
    raise(
      KEEP,
      "custom shape / label / per-bar Cell colours have no sparkline equivalent"
    );
  }
  if (root.attrs.syncId) {
    notes.push(
      "syncId -> share one useSparklineHover() and spread sparklineProps onto each sparkline"
    );
  }
  return {
    type: root.component,
    line: root.line,
    bklitTarget: spec.bklit,
    slugs: ["sparkline"],
    classification: level,
    sparkline: true,
    reasons,
    notes,
  };
}

// --------------------------------------------------- TanStack Charts files

/** Local names imported from `@tanstack/charts*` -> imported name. */
function tanstackLocals(imports) {
  const locals = new Map();
  for (const imp of imports) {
    for (const s of imp.specifiers) {
      locals.set(s.local, s.imported);
    }
  }
  return locals;
}

/** Text of each `name(...)` call's arguments inside `text`. */
function callArgs(text, name) {
  const out = [];
  const re = new RegExp(
    `(?<![\\w$.])${name.replace(RE_ESCAPE, "\\$&")}\\s*\\(`,
    "g"
  );
  for (const m of text.matchAll(re)) {
    const open = (m.index ?? 0) + m[0].length - 1;
    const close = skipBalanced(text, open, "(", ")");
    out.push({ index: m.index ?? 0, args: text.slice(open + 1, close - 1) });
  }
  return out;
}

/** Smallest `height` passed to a TanStack `<Chart>` in this file. */
function tanstackChartHeight(code, locals) {
  const chartLocals = [...locals].filter(
    ([, imported]) => imported === "Chart"
  );
  let min = null;
  for (const [local] of chartLocals) {
    const tags = collectTags(code, (raw) =>
      raw === local ? { name: "Chart", origin: "tanstack" } : null
    );
    for (const tag of tags) {
      const h = pxAttr(tag.attrs.height);
      if (h !== null) {
        min = min === null ? h : Math.min(min, h);
      }
    }
  }
  return min;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: flat list of independent mapping rules
function classifyTanstack(code, def, locals, chartHeight) {
  const text = def.args;
  const marks = [];
  for (const [local, imported] of locals) {
    if (!TANSTACK_MARKS.has(imported)) {
      continue;
    }
    for (const call of callArgs(text, local)) {
      marks.push({ mark: imported, args: call.args });
    }
  }
  const count = (name) => marks.filter((m) => m.mark === name).length;
  const horizontalBars = count("barX");
  const unmappedAll = [...new Set(marks.map((m) => m.mark))].filter(
    (m) => !TANSTACK_MAPPED_MARKS.has(m)
  );
  // barX (horizontal bars) maps to a full BarChart, never to a sparkline.
  const unmapped = unmappedAll.filter((m) => m !== "barX");
  const lines = count("lineY");
  const areas = count("areaY");
  const bars = count("barY") + horizontalBars;
  const multiSeries =
    RE_Z_CHANNEL.test(text) || lines > 1 || areas > 1 || bars > 1;
  const hidesAxes = RE_AXIS_FALSE.test(text) && !RE_AXIS_ON.test(text);
  const hidesGuides = RE_GUIDES_FALSE.test(text) || !RE_GRID_ON.test(text);
  const small = chartHeight !== null && chartHeight <= SPARKLINE_MAX_HEIGHT;
  const isSparkline =
    marks.length > 0 &&
    unmappedAll.length === 0 &&
    !multiSeries &&
    !(bars > 0 && lines + areas > 0) &&
    hidesGuides &&
    !RE_LEGEND.test(text) &&
    (hidesAxes || small);

  const reasons = [];
  const notes = [];
  let level = CLEAN;
  const raise = (to, why) => {
    if (RANK[to] > RANK[level]) {
      level = to;
    }
    reasons.push(`${to}: ${why}`);
  };
  const markList = marks.map((m) => m.mark).join(" + ") || "no marks found";
  let bklitTarget = null;
  let slugs = [];

  if (marks.length === 0) {
    raise(
      WORKAROUND,
      "no lineY / areaY / barY marks found in this definition — open the file and map it by hand"
    );
  } else if (isSparkline) {
    bklitTarget = "LineSparkline";
    if (areas > 0) {
      bklitTarget = "AreaSparkline";
    } else if (bars > 0) {
      bklitTarget = "BarSparkline";
    }
    slugs = ["sparkline"];
    notes.push(
      `${markList} with axes hidden${small ? ` (<Chart height={${chartHeight}}>)` : ""} -> ${bklitTarget} from @bklit/sparkline`
    );
    const y = marks.map((m) => m.args.match(RE_Y_KEY)?.[1]).find(Boolean);
    if (y) {
      notes.push(`y: "${y}" -> dataKey="${y}"`);
    }
    if (areas > 0 && lines > 0) {
      notes.push(
        "areaY + lineY pair -> one AreaSparkline (it draws its own line)"
      );
    }
    const curve = marks.map((m) => m.args.match(RE_CURVE)?.[1]).find(Boolean);
    if (curve) {
      const base = curve
        .replace(RE_CURVE_AXIS_SUFFIX, "")
        .replace(RE_CURVE_PREFIX, "")
        .toLowerCase();
      notes.push(
        SPARKLINE_CURVES.has(base)
          ? `curve "${curve}" -> curve="${base}"`
          : `curve "${curve}" has no sparkline equivalent — closest is curve="monotone"`
      );
    }
    if (marks.some((m) => RE_STROKE.test(m.args))) {
      notes.push("stroke -> color");
    }
    if (marks.some((m) => RE_STROKE_WIDTH.test(m.args)) && bars === 0) {
      notes.push("strokeWidth -> strokeWidth");
    }
    if (RE_ID_PREFIX.test(code)) {
      notes.push("<Chart idPrefix> -> drop (sparklines scope ids with useId)");
    }
    if (RE_ARIA_LABEL.test(code)) {
      notes.push("<Chart ariaLabel> -> aria-label (generated when omitted)");
    }
    if (RE_DOMAIN.test(text)) {
      notes.push("y scale domain -> yDomain={[min, max]}");
    }
    if (RE_GRADIENTS.test(text)) {
      notes.push(
        'gradients -> AreaSparkline fill="gradient" (default) + fillOpacity'
      );
    }
    if (RE_MARGIN.test(text)) {
      notes.push("margin -> padding");
    }
    if (RE_ANIMATION.test(text)) {
      notes.push(
        "svgAnimation / motion renderer -> animate (+ animationDuration); reduced motion is handled"
      );
    }
    if (RE_TOOLTIP_WORD.test(text) && !RE_TOOLTIP_OFF.test(text)) {
      raise(
        WORKAROUND,
        "tooltip: sparklines have no tooltip — use useSparklineHover() and render the hovered value yourself"
      );
    }
  } else if (unmapped.length > 0) {
    raise(
      KEEP_TANSTACK,
      `marks ${unmapped.join(", ")} have no bklit mapping — keep this chart on TanStack Charts`
    );
  } else {
    const roots = [];
    if (bars > 0 && lines + areas > 0) {
      roots.push(["ComposedChart", "composed-chart"]);
    } else if (bars > 0) {
      roots.push(["BarChart", "bar-chart"]);
    } else if (areas > 0) {
      roots.push(["AreaChart", "area-chart"]);
    } else {
      roots.push(["LineChart", "line-chart"]);
    }
    bklitTarget = roots[0][0];
    slugs = [roots[0][1]];
    if (RE_AXIS_ON.test(text) && !(bars > 0 && lines + areas === 0)) {
      slugs.push("y-axis");
    }
    raise(
      WORKAROUND,
      `full ${markList} chart -> ${bklitTarget}: mapped at a high level only — check x values (Line/Area/Composed need dates), scales, axes, colour scale and interactions by hand`
    );
    if (horizontalBars > 0) {
      notes.push(
        'barX (horizontal bars) -> BarChart orientation="horizontal" + BarYAxis; xDataKey is the category (TanStack y) channel'
      );
    }
    if (multiSeries) {
      notes.push(
        "z channel / several marks -> one bklit series per value (pivot long rows to one key per series)"
      );
    }
  }
  const x = marks.map((m) => m.args.match(RE_X_KEY)?.[1]).find(Boolean);
  if (x && !isSparkline && horizontalBars === 0) {
    notes.push(`x: "${x}" -> root xDataKey="${x}"`);
  }
  return {
    type: "defineChart",
    library: "@tanstack/charts",
    line: lineAt(code, def.index),
    bklitTarget,
    slugs,
    classification: level,
    sparkline: isSparkline,
    reasons,
    notes,
  };
}

function analyzeTanstack(code, imports) {
  const locals = tanstackLocals(imports);
  const defineLocal = [...locals].find(([, i]) => i === "defineChart")?.[0];
  const chartHeight = tanstackChartHeight(code, locals);
  const charts = defineLocal
    ? callArgs(code, defineLocal).map((def) =>
        classifyTanstack(code, def, locals, chartHeight)
      )
    : [];
  return { charts, names: [...new Set(locals.values())].sort() };
}

// ---------------------------------------------------------------- per file

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: linear pipeline per file
function analyzeFile(absPath, relPath) {
  const src = readFileSync(absPath, "utf8");
  if (
    !(
      src.includes("recharts") ||
      src.includes("@tanstack/charts") ||
      RE_WRAPPER_HINT.test(src)
    )
  ) {
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
  const tanstackImports = imports.filter((imp) =>
    RE_TANSTACK_SOURCE.test(imp.source)
  );
  const definesWrapper =
    RE_DEFINES_WRAPPER.test(code) && rechartsImports.length > 0;

  if (
    rechartsImports.length === 0 &&
    wrapperImports.length === 0 &&
    tanstackImports.length === 0
  ) {
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
  const tanstack =
    tanstackImports.length > 0 ? analyzeTanstack(code, tanstackImports) : null;
  const components = [
    ...new Set([...tags.map((t) => t.component), ...(tanstack?.names ?? [])]),
  ].sort();
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
    const container = tags
      .filter(
        (t) =>
          t.component === "ResponsiveContainer" &&
          t.start < tag.start &&
          findClose(code, t) > tag.start
      )
      .at(-1);
    const shape = sparklineShape(tag, inner, container);
    const result = shape?.small
      ? classifySparkline(tag, inner, shape, container)
      : classifyChart(tag, inner);
    if (shape && !shape.small) {
      result.notes.push(
        `no axes/grid and one series: if this renders as a small inline trend, use ${shape.spec.bklit} from @bklit/sparkline instead`
      );
    }
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
  // Sparklines and kept charts carry their own sizing notes.
  const noFullCharts =
    charts.length > 0 &&
    charts.every((c) => isKept(c.classification) || c.sparkline);
  if (
    components.includes("ResponsiveContainer") &&
    !definesWrapper &&
    !noFullCharts
  ) {
    fileNotes.push(
      "ResponsiveContainer -> remove (bklit charts size to their parent; set aspectRatio)"
    );
  }

  const allCharts = [...charts, ...(tanstack?.charts ?? [])];
  let classification = allCharts.length === 0 ? null : CLEAN;
  for (const c of allCharts) {
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
    tanstackImports: tanstackImports.map((i) => ({
      source: i.source,
      line: i.line,
      names: i.specifiers.map((s) => s.imported),
    })),
    charts: [
      ...charts.map(({ _start, _end, ...rest }) => rest),
      ...(tanstack?.charts ?? []),
    ],
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
    "| File | Recharts / TanStack / shadcn components | Chart(s) | bklit target | Class |",
    "|------|-----------------------------------------|----------|--------------|-------|",
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
    `Charts: ${s.charts} (clean ${s.clean}, needs-workaround ${s.workaround}, keep ${s.keep}).`,
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
    packageJson = {
      recharts: deps.recharts ?? null,
      tanstackCharts: deps["@tanstack/charts"] ?? null,
    };
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
    if (!isKept(c.classification)) {
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
      keep: charts.filter((c) => isKept(c.classification)).length,
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
