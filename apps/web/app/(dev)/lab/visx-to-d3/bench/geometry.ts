/**
 * Geometry snapshot + diff for the Before/After parity check. Only geometry
 * is compared (no class names, ids, fills or `url(#…)` references), so visx's
 * `visx-group` / `visx-line-radial` classes and per-instance `useId` values
 * never show up as drift.
 */

const GEOMETRY_ATTRIBUTES = [
  "d",
  "transform",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "points",
] as const;

/** Inline transform written by Motion (hover offsets, scale-in). */
const STYLE_TRANSFORM = "style.transform";

export interface GeometryNode {
  /** e.g. `svg[0] > g[0] > path[3]` (index among same-tag siblings). */
  path: string;
  tag: string;
  attrs: Record<string, string>;
}

export interface GeometryDiff {
  path: string;
  attribute: string;
  before: string | null;
  after: string | null;
  /** Largest numeric difference, `null` when the values differ in shape. */
  maxDelta: number | null;
}

export interface ParityResult {
  identical: boolean;
  beforeCount: number;
  afterCount: number;
  comparedAttributes: number;
  diffs: GeometryDiff[];
}

const TOKEN_PATTERN = /[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?|[a-z]+/gi;
const NUMBER_PATTERN = /^[-+]?(?:\d|\.\d)/;
const IDENTITY_TRANSFORM = /^(?:translate\(\s*0(?:\s*[, ]\s*0)?\s*\)|none)$/;

function readGeometry(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const name of GEOMETRY_ATTRIBUTES) {
    const value = element.getAttribute(name);
    if (value === null) {
      continue;
    }
    // visx `<Group>` always writes `translate(0, 0)`; treat as no transform.
    if (name === "transform" && IDENTITY_TRANSFORM.test(value.trim())) {
      continue;
    }
    attrs[name] = value.trim();
  }
  const styleTransform =
    element instanceof SVGElement ? element.style.transform : "";
  if (styleTransform && !IDENTITY_TRANSFORM.test(styleTransform.trim())) {
    attrs[STYLE_TRANSFORM] = styleTransform.trim();
  }
  return attrs;
}

function walk(element: Element, path: string, out: GeometryNode[]) {
  out.push({
    path,
    tag: element.tagName.toLowerCase(),
    attrs: readGeometry(element),
  });
  const seen = new Map<string, number>();
  for (const child of element.children) {
    const tag = child.tagName.toLowerCase();
    const index = seen.get(tag) ?? 0;
    seen.set(tag, index + 1);
    walk(child, `${path} > ${tag}[${index}]`, out);
  }
}

/** Every element inside every top-level `<svg>` under `root`. */
export function snapshotGeometry(root: Element): GeometryNode[] {
  const out: GeometryNode[] = [];
  const svgs = [...root.querySelectorAll("svg")].filter(
    (svg) => !svg.parentElement?.closest("svg")
  );
  svgs.forEach((svg, i) => {
    walk(svg, `svg[${i}]`, out);
  });
  return out;
}

function tokenize(value: string): string[] {
  return value.match(TOKEN_PATTERN) ?? [];
}

/**
 * Compares two attribute values token by token (path commands / function
 * names must match exactly, numbers within `tolerance`), so formatting
 * differences like `translate(1, 2)` vs `translate(1,2)` are ignored.
 */
function compareValues(
  before: string,
  after: string,
  tolerance: number
): { equal: boolean; maxDelta: number | null } {
  if (before === after) {
    return { equal: true, maxDelta: 0 };
  }
  const a = tokenize(before);
  const b = tokenize(after);
  if (a.length !== b.length) {
    return { equal: false, maxDelta: null };
  }
  let maxDelta = 0;
  for (let i = 0; i < a.length; i++) {
    const ta = a[i] ?? "";
    const tb = b[i] ?? "";
    const aIsNumber = NUMBER_PATTERN.test(ta);
    const bIsNumber = NUMBER_PATTERN.test(tb);
    if (aIsNumber && bIsNumber) {
      maxDelta = Math.max(maxDelta, Math.abs(Number(ta) - Number(tb)));
    } else if (ta !== tb) {
      return { equal: false, maxDelta: null };
    }
  }
  return { equal: maxDelta <= tolerance, maxDelta };
}

function diffNode(
  path: string,
  before: GeometryNode,
  after: GeometryNode,
  tolerance: number,
  diffs: GeometryDiff[]
): number {
  const names = new Set([
    ...Object.keys(before.attrs),
    ...Object.keys(after.attrs),
  ]);
  for (const attribute of names) {
    const b = before.attrs[attribute] ?? null;
    const a = after.attrs[attribute] ?? null;
    if (b === null || a === null) {
      diffs.push({ path, attribute, before: b, after: a, maxDelta: null });
      continue;
    }
    const { equal, maxDelta } = compareValues(b, a, tolerance);
    if (!equal) {
      diffs.push({ path, attribute, before: b, after: a, maxDelta });
    }
  }
  return names.size;
}

export function diffGeometry(
  before: GeometryNode[],
  after: GeometryNode[],
  tolerance = 1e-4
): ParityResult {
  const afterByPath = new Map(after.map((node) => [node.path, node]));
  const beforePaths = new Set(before.map((node) => node.path));
  const diffs: GeometryDiff[] = [];
  let comparedAttributes = 0;

  for (const node of before) {
    const match = afterByPath.get(node.path);
    if (!match) {
      diffs.push({
        path: node.path,
        attribute: "(element)",
        before: node.tag,
        after: null,
        maxDelta: null,
      });
      continue;
    }
    comparedAttributes += diffNode(node.path, node, match, tolerance, diffs);
  }
  for (const node of after) {
    if (!beforePaths.has(node.path)) {
      diffs.push({
        path: node.path,
        attribute: "(element)",
        before: null,
        after: node.tag,
        maxDelta: null,
      });
    }
  }

  return {
    identical: diffs.length === 0,
    beforeCount: before.length,
    afterCount: after.length,
    comparedAttributes,
    diffs,
  };
}
