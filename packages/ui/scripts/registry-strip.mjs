#!/usr/bin/env node
/**
 * Strips site-only plumbing from chart sources before they ship in the shadcn
 * registry. `chart-data-override.tsx` powers live data editing in the
 * bklit.com "Present chart" dialog; installed charts must not carry it.
 *
 * Supported patterns (anything else that mentions the module fails the build):
 *
 * 1. Imports from the module — removed:
 *      import { useChartDataOverride } from "./chart-data-override";
 *      import { type ChartDataOverrideCodec, useChartDataOverride } from "../chart-data-override";
 *
 * 2. Call sites — one destructuring `const` whose inputs map each key to a
 *    `<key>Prop` binding renamed in the component's parameter list:
 *
 *      export function LineChart({ data: dataProp, ... }: LineChartProps) {
 *        const { data } = useChartDataOverride("LineChart", { data: dataProp });
 *
 *    The call (and `//` comment lines directly above it) is removed and the
 *    nearest preceding `data: dataProp` becomes `data`, i.e. the original
 *    props destructuring. An optional third argument (a codec) is allowed.
 *
 * 3. Regions between `// registry-strip-start` and `// registry-strip-end`
 *    (inclusive) — removed (e.g. a codec only the call site uses).
 *
 * 4. `<ChartDataOverrideExempt>` … `</ChartDataOverrideExempt>`, each tag on
 *    its own line at the same indent — unwrapped (the JSX inside stays,
 *    dedented one level).
 *
 * Usage:
 *   import { stripRegistryInternals } from "./registry-strip.mjs";
 *   node scripts/registry-strip.mjs <dir-with-registry-json>   (rewrites in place)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STRIPPED_MODULE = "chart-data-override";

const MARKERS = [STRIPPED_MODULE, "useChartDataOverride", "ChartDataOverride"];

const IMPORT_RE =
  /^import\s+(?:type\s+)?\{[^}]*\}\s+from\s+["']\.{1,2}\/(?:[\w-]+\/)*chart-data-override["'];\n/gm;

const CALL_RE =
  /^([ \t]*)const \{([^}]*)\} = useChartDataOverride\(\s*"(\w+)",\s*\{([^}]*)\}(?:,\s*\w+)?,?\s*\);\n/gm;

const REGION_RE =
  /^[ \t]*\/\/ registry-strip-start[^\n]*\n[\s\S]*?^[ \t]*\/\/ registry-strip-end[^\n]*\n(?:[ \t]*\n)?/gm;

const EXEMPT_RE =
  /^([ \t]*)<ChartDataOverrideExempt>\n([\s\S]*?)^\1<\/ChartDataOverrideExempt>\n/gm;

/** Unwraps `<ChartDataOverrideExempt>` JSX, dedenting what it wrapped. */
function unwrapExempt(source) {
  return source.replace(EXEMPT_RE, (_whole, _indent, inner) =>
    inner.replace(/^ {2}/gm, "")
  );
}

const COMMENT_LINE_RE = /^[ \t]*\/\/.*\n$/;
const INPUT_PAIR_RE = /^(\w+):\s*(\w+)$/;

function fail(file, message) {
  throw new Error(`[registry-strip] ${file}: ${message}`);
}

function parseKeys(list) {
  return list
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Removes `//` comment lines directly above `index`; returns the new start. */
function commentBlockStart(source, index) {
  let start = index;
  for (;;) {
    const lineStart = source.lastIndexOf("\n", start - 2) + 1;
    const line = source.slice(lineStart, start);
    if (start === 0 || !COMMENT_LINE_RE.test(line)) {
      return start;
    }
    start = lineStart;
  }
}

/** Returns `source` without the override plumbing; throws on unknown usage. */
export function stripRegistryInternals(source, file = "<source>") {
  if (!MARKERS.some((marker) => source.includes(marker))) {
    return source;
  }
  let out = source.replace(REGION_RE, "").replace(IMPORT_RE, "");
  out = unwrapExempt(out);

  const calls = [...out.matchAll(CALL_RE)];
  // Back to front so earlier indices stay valid.
  for (const match of calls.reverse()) {
    const [whole, , destructured, component, inputs] = match;
    const keys = parseKeys(destructured);
    const mapping = parseKeys(inputs).map((pair) => {
      const pairMatch = INPUT_PAIR_RE.exec(pair);
      if (!pairMatch) {
        fail(file, `${component}: input "${pair}" is not \`key: keyProp\``);
      }
      return { key: pairMatch[1], binding: pairMatch[2] };
    });
    if (
      mapping.length !== keys.length ||
      mapping.some(
        ({ key, binding }) => !keys.includes(key) || binding !== `${key}Prop`
      )
    ) {
      fail(
        file,
        `${component}: destructured keys must match \`{ key: keyProp }\` inputs`
      );
    }
    const start = commentBlockStart(out, match.index);
    let head = out.slice(0, start);
    const tail = out.slice(match.index + whole.length);
    for (const { key, binding } of mapping) {
      const paramRe = new RegExp(`\\b${key}: ${binding}\\b`, "g");
      const params = [...head.matchAll(paramRe)];
      const param = params.at(-1);
      if (!param) {
        fail(
          file,
          `${component}: no \`${key}: ${binding}\` parameter before the call`
        );
      }
      head =
        head.slice(0, param.index) +
        key +
        head.slice(param.index + param[0].length);
    }
    out = head + tail;
  }

  for (const marker of MARKERS) {
    if (out.includes(marker)) {
      fail(
        file,
        `"${marker}" is still present after stripping (unsupported pattern)`
      );
    }
  }
  return out;
}

/** Rewrites `files[].content` of every registry item JSON in `dir`. */
export function stripRegistryDir(dir) {
  let changed = 0;
  for (const name of fs.readdirSync(dir)) {
    // The index (copied from packages/ui/registry.json afterwards) has no sources.
    if (!name.endsWith(".json") || name === "registry.json") {
      continue;
    }
    const filePath = path.join(dir, name);
    const raw = fs.readFileSync(filePath, "utf8");
    if (!MARKERS.some((marker) => raw.includes(marker))) {
      continue;
    }
    const item = JSON.parse(raw);
    if (!Array.isArray(item.files)) {
      fail(name, "mentions the override module but has no files[]");
    }
    item.files = item.files.filter(
      (entry) => !entry.path?.endsWith(`${STRIPPED_MODULE}.tsx`)
    );
    for (const entry of item.files) {
      if (typeof entry.content === "string") {
        entry.content = stripRegistryInternals(
          entry.content,
          `${name} → ${entry.path}`
        );
      }
    }
    const next = `${JSON.stringify(item, null, 2)}${raw.endsWith("\n") ? "\n" : ""}`;
    if (MARKERS.some((marker) => next.includes(marker))) {
      fail(name, "override plumbing still present after stripping");
    }
    fs.writeFileSync(filePath, next);
    changed += 1;
  }
  return changed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error(
      "usage: node scripts/registry-strip.mjs <registry-output-dir>"
    );
    process.exit(1);
  }
  try {
    const count = stripRegistryDir(path.resolve(dir));
    console.log(
      `registry-strip: stripped chart-data-override from ${count} item(s)`
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
