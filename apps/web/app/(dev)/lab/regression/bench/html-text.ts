import type { GeometryDiff } from "./geometry";

/**
 * HTML text snapshot: every visible run of text inside the chart frame that
 * is NOT inside an `<svg>` (axis labels portalled into the chart container,
 * value labels, tooltips, legends, …), with its bounding box relative to the
 * frame. The SVG walk in `geometry.ts` never sees these.
 *
 * Matching is by text, not by DOM path: a migration that swaps wrapper
 * elements but draws the same text in the same place is identical. Equal
 * texts are paired in reading order (top, then left). The path is kept for
 * the diff table only.
 */

export interface TextNode {
  /** e.g. `frame > div[0] > div[1] > span[0] > #text[0]`. */
  path: string;
  /** Text content, whitespace collapsed. */
  text: string;
  /** `[x, y, width, height]` relative to the frame, rounded to 0.5 px. */
  box: [number, number, number, number];
}

const SKIPPED_TAGS = new Set(["svg", "script", "style", "template"]);
const WHITESPACE = /\s+/g;

function half(value: number): number {
  return Math.round(value * 2) / 2;
}

function isVisible(element: Element): boolean {
  if (!("checkVisibility" in element)) {
    return true;
  }
  return element.checkVisibility({
    opacityProperty: true,
    visibilityProperty: true,
  });
}

function recordRun(
  parent: Element,
  run: Text[],
  path: string,
  frame: DOMRect,
  out: TextNode[]
) {
  const first = run[0];
  const last = run.at(-1);
  if (!(first && last)) {
    return;
  }
  const text = run
    .map((node) => node.data)
    .join("")
    .replace(WHITESPACE, " ")
    .trim();
  if (!(text && isVisible(parent))) {
    return;
  }
  const range = document.createRange();
  range.setStartBefore(first);
  range.setEndAfter(last);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return;
  }
  out.push({
    path,
    text,
    box: [
      half(rect.left - frame.left),
      half(rect.top - frame.top),
      half(rect.width),
      half(rect.height),
    ],
  });
}

function visit(
  element: Element,
  path: string,
  frame: DOMRect,
  out: TextNode[]
) {
  const seen = new Map<string, number>();
  let run: Text[] = [];
  let runIndex = 0;
  const flush = () => {
    if (run.length > 0) {
      recordRun(element, run, `${path} > #text[${runIndex}]`, frame, out);
      runIndex += 1;
      run = [];
    }
  };
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      run.push(child as Text);
      continue;
    }
    if (!(child instanceof Element)) {
      continue;
    }
    flush();
    const tag = child.tagName.toLowerCase();
    const index = seen.get(tag) ?? 0;
    seen.set(tag, index + 1);
    if (!SKIPPED_TAGS.has(tag)) {
      visit(child, `${path} > ${tag}[${index}]`, frame, out);
    }
  }
  flush();
}

/** Every visible non-SVG text run under `root` (the chart frame). */
export function snapshotHtmlText(root: Element): TextNode[] {
  const out: TextNode[] = [];
  visit(root, "frame", root.getBoundingClientRect(), out);
  return out;
}

function readingOrder(a: TextNode, b: TextNode): number {
  return (
    a.box[1] - b.box[1] || a.box[0] - b.box[0] || (a.path < b.path ? -1 : 1)
  );
}

function boxDelta(a: TextNode, b: TextNode): number {
  return Math.max(
    ...a.box.map((value, i) => Math.abs(value - (b.box[i] ?? 0)))
  );
}

export function formatTextNode(node: TextNode): string {
  const [x, y, w, h] = node.box;
  return `"${node.text}" @ ${x},${y} ${w}×${h}`;
}

function groupByText(nodes: readonly TextNode[]): Map<string, TextNode[]> {
  const groups = new Map<string, TextNode[]>();
  for (const node of nodes) {
    const group = groups.get(node.text);
    if (group) {
      group.push(node);
    } else {
      groups.set(node.text, [node]);
    }
  }
  for (const group of groups.values()) {
    group.sort(readingOrder);
  }
  return groups;
}

/**
 * Exact text, position within `tolerance` px. Unpaired texts that sit in the
 * same box on both sides are reported as one `text` change; the rest as
 * missing / new.
 */
export function diffHtmlText(
  before: readonly TextNode[],
  after: readonly TextNode[],
  tolerance = 0.5
): GeometryDiff[] {
  const diffs: GeometryDiff[] = [];
  const beforeGroups = groupByText(before);
  const afterGroups = groupByText(after);
  const lostBefore: TextNode[] = [];
  const lostAfter: TextNode[] = [];
  const texts = new Set([...beforeGroups.keys(), ...afterGroups.keys()]);
  for (const text of texts) {
    const b = beforeGroups.get(text) ?? [];
    const a = afterGroups.get(text) ?? [];
    const paired = Math.min(b.length, a.length);
    for (let i = 0; i < paired; i++) {
      const nb = b[i] as TextNode;
      const na = a[i] as TextNode;
      const delta = boxDelta(nb, na);
      if (delta > tolerance) {
        diffs.push({
          path: `html ${na.path}`,
          attribute: "box",
          before: formatTextNode(nb),
          after: formatTextNode(na),
          maxDelta: delta,
        });
      }
    }
    lostBefore.push(...b.slice(paired));
    lostAfter.push(...a.slice(paired));
  }
  const unmatchedAfter = new Set(lostAfter);
  for (const nb of lostBefore) {
    const same = [...unmatchedAfter].find(
      (na) => boxDelta(nb, na) <= tolerance
    );
    if (same) {
      unmatchedAfter.delete(same);
      diffs.push({
        path: `html ${same.path}`,
        attribute: "text",
        before: formatTextNode(nb),
        after: formatTextNode(same),
        maxDelta: null,
      });
      continue;
    }
    diffs.push({
      path: `html ${nb.path}`,
      attribute: "(text)",
      before: formatTextNode(nb),
      after: null,
      maxDelta: null,
    });
  }
  for (const na of unmatchedAfter) {
    diffs.push({
      path: `html ${na.path}`,
      attribute: "(text)",
      before: null,
      after: formatTextNode(na),
      maxDelta: null,
    });
  }
  return diffs;
}
