/**
 * Map chart DOM back to Studio layer ids for the canvas direct-selection tool.
 *
 * Layers are rendered through `StudioVisibleLayer` (DOM-less, so chart child
 * classification and SVG/HTML nesting stay untouched) or tagged with
 * `data-studio-layer` on a real element. Axes, tooltips and other HTML
 * overlays are portalled out of the chart SVG, so `closest()` alone cannot
 * reach their layer — we walk React's fiber tree instead, which follows the
 * component tree through portals. Studio-only dev tooling: if React's
 * internals change, hit-testing degrades to "nothing hovered".
 */

export const STUDIO_LAYER_ATTR = "data-studio-layer";

/** Static flag on DOM-less layer wrappers (`StudioVisibleLayer`). */
export const STUDIO_LAYER_MARKER = "__studioLayer" as const;

/** Toggled on the chart content root while hit-testing. */
export const STUDIO_HIT_TEST_CLASS = "studio-direct-select-hit-test";

const FIBER_KEY_PREFIX = "__reactFiber$";
const HOST_ROOT = 3;
const HOST_PORTAL = 4;
const HOST_COMPONENT = 5;

interface Fiber {
  tag: number;
  type: unknown;
  memoizedProps: Record<string, unknown> | null;
  stateNode: unknown;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
}

let fiberKey: string | null = null;

function fiberFromNode(node: Element): Fiber | null {
  const record = node as unknown as Record<string, Fiber | undefined>;
  if (fiberKey && record[fiberKey]) {
    return record[fiberKey] ?? null;
  }
  for (const key in node) {
    if (key.startsWith(FIBER_KEY_PREFIX)) {
      fiberKey = key;
      return record[key] ?? null;
    }
  }
  return null;
}

/** DOM nodes cache one of two alternate fibers; resolve the committed one. */
function currentFiber(fiber: Fiber): Fiber {
  let node: Fiber | null = fiber;
  while (node?.return) {
    node = node.return;
  }
  if (node?.tag !== HOST_ROOT) {
    return fiber;
  }
  const root = node.stateNode as { current?: Fiber } | null;
  return root?.current === node ? fiber : (fiber.alternate ?? fiber);
}

/** Chart primitives whose layer suffix differs from their display name. */
const LAYER_SUFFIX_BY_NAME: Record<string, string> = {
  AreaSparkline: "series",
  BarSparkline: "series",
  BarColumnTrack: "track",
  BarXAxis: "xaxis",
  BarYAxis: "baryaxis",
  Candlestick: "candles",
  ChartBrush: "brush",
  ChartLegend: "legend",
  ChartTooltip: "tooltip",
  ChoroplethFeature: "features",
  ChoroplethTooltip: "tooltip",
  HeatmapLegend: "legend",
  HeatmapTooltip: "tooltip",
  HeatmapXAxis: "xaxis",
  HeatmapYAxis: "yaxis",
  LiveLine: "line",
  LiveXAxis: "xaxis",
  LiveYAxis: "yaxis",
  LineSparkline: "series",
  ProfitLossLine: "profit-loss",
  RadialLegend: "legend",
  ReferenceArea: "reference-area",
  SankeyTooltip: "tooltip",
  TrendLine: "trend-line",
  XAxis: "xaxis",
};

/** Series primitives keyed by `dataKey` (`line.series.0`, `scatter.desktop`). */
const SERIES_COMPONENT_NAMES = new Set([
  "Area",
  "Bar",
  "BarSquares",
  "Line",
  "PatternArea",
  "Scatter",
  "SeriesBar",
]);

/** Indexed primitives (`pie.slice.2`, `ring.layer.0`, `radar.area.1`). */
const INDEXED_LAYER_SUFFIXES = ["slice", "layer", "area", "segment", "stage"];

const IMPL_SUFFIX = /Impl$/;

const CHART_NAME_PREFIX =
  /^(Radial|Radar|Ring|Pie|Sunburst|Heatmap|Sankey|Choropleth|Live|Bar|Chart)(?=[A-Z])/;

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function kebab(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export interface StudioLayerLookup {
  ids: ReadonlySet<string>;
  /** Chart id prefix (`line`, `pie`, …) for name-based inference. */
  prefix: string;
  /** Data keys in series order (`desktop`, `mobile`, …). */
  seriesKeys: readonly string[];
}

function inferredLayerIds(
  fiber: Fiber,
  props: Record<string, unknown>,
  lookup: StudioLayerLookup
): string[] {
  const type = fiber.type as { displayName?: string; name?: string };
  const name = (type.displayName || type.name || "").replace(IMPL_SUFFIX, "");
  if (!name) {
    return [];
  }
  const { prefix } = lookup;
  const candidates: string[] = [];

  if (SERIES_COMPONENT_NAMES.has(name) && typeof props.dataKey === "string") {
    const seriesIndex = lookup.seriesKeys.indexOf(props.dataKey);
    if (seriesIndex >= 0) {
      candidates.push(`${prefix}.series.${seriesIndex}`);
    }
    candidates.push(`${prefix}.${props.dataKey}`, `${prefix}.series`);
  }

  if (typeof props.index === "number") {
    for (const suffix of INDEXED_LAYER_SUFFIXES) {
      candidates.push(`${prefix}.${suffix}.${props.index}`);
    }
  }

  const mapped = LAYER_SUFFIX_BY_NAME[name];
  if (mapped) {
    candidates.push(`${prefix}.${mapped}`);
  }
  const stripped = name.replace(CHART_NAME_PREFIX, "");
  for (const variant of new Set([name, stripped])) {
    candidates.push(
      `${prefix}.${lowerFirst(variant)}`,
      `${prefix}.${kebab(variant)}`
    );
  }
  return candidates;
}

function fiberLayerId(fiber: Fiber, lookup: StudioLayerLookup): string | null {
  const props = fiber.memoizedProps;
  if (!props) {
    return null;
  }
  const attr = props[STUDIO_LAYER_ATTR];
  if (typeof attr === "string" && lookup.ids.has(attr)) {
    return attr;
  }
  if (typeof fiber.type !== "function" && typeof fiber.type !== "object") {
    return null;
  }
  if (fiber.type === null) {
    return null;
  }
  const type = fiber.type as Record<string, unknown>;
  if (
    type[STUDIO_LAYER_MARKER] === true &&
    typeof props.componentId === "string"
  ) {
    return lookup.ids.has(props.componentId) ? props.componentId : null;
  }
  for (const id of inferredLayerIds(fiber, props, lookup)) {
    if (lookup.ids.has(id)) {
      return id;
    }
  }
  return null;
}

/** Innermost known layer that rendered `element` (portals included). */
export function layerIdForElement(
  element: Element,
  lookup: StudioLayerLookup
): string | null {
  let fiber = fiberFromNode(element);
  while (fiber) {
    const id = fiberLayerId(fiber, lookup);
    if (id) {
      return id;
    }
    fiber = fiber.return;
  }
  return null;
}

function findLayerFibers(
  root: Fiber,
  layerId: string,
  lookup: StudioLayerLookup
): Fiber[] {
  const found: Fiber[] = [];
  const stack: Fiber[] = root.child ? [root.child] : [];
  while (stack.length > 0) {
    const fiber = stack.pop() as Fiber;
    if (fiber.sibling) {
      stack.push(fiber.sibling);
    }
    if (fiberLayerId(fiber, lookup) === layerId) {
      found.push(fiber);
      continue;
    }
    if (fiber.child) {
      stack.push(fiber.child);
    }
  }
  return found;
}

const ZERO_ALPHA_COLOR = /rgba?\([^)]*,\s*0(\.0+)?\)$/;

function isTransparentColor(value: string) {
  return (
    value === "none" || value === "transparent" || ZERO_ALPHA_COLOR.test(value)
  );
}

const SVG_SHAPES = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "image",
  "use",
]);

function hasDirectText(element: Element) {
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

function isHidden(style: CSSStyleDeclaration) {
  return style.visibility === "hidden" || Number(style.opacity) === 0;
}

/** Element draws something itself (not just a positioning container). */
function isPaintedElement(element: Element): boolean {
  const style = getComputedStyle(element);
  if (isHidden(style)) {
    return false;
  }
  if (element instanceof SVGElement) {
    if (element.tagName === "svg") {
      return false;
    }
    if (!SVG_SHAPES.has(element.tagName)) {
      return false;
    }
    return !(
      isTransparentColor(style.fill) && isTransparentColor(style.stroke)
    );
  }
  if (hasDirectText(element)) {
    return true;
  }
  const tag = element.tagName;
  if (tag === "IMG" || tag === "CANVAS" || tag === "VIDEO") {
    return true;
  }
  return (
    !isTransparentColor(style.backgroundColor) ||
    style.backgroundImage !== "none" ||
    Number.parseFloat(style.borderTopWidth) > 0 ||
    Number.parseFloat(style.borderLeftWidth) > 0
  );
}

const HIT_OFFSETS: ReadonlyArray<readonly [number, number]> = (() => {
  const offsets: [number, number][] = [[0, 0]];
  for (const radius of [3, 6]) {
    for (let step = 0; step < 8; step += 1) {
      const angle = (step / 8) * Math.PI * 2;
      offsets.push([
        Math.round(Math.cos(angle) * radius),
        Math.round(Math.sin(angle) * radius),
      ]);
    }
  }
  return offsets;
})();

/**
 * Topmost painted layer under the pointer. Chart content has
 * `pointer-events: none` while the tool is active; it is flipped on only for
 * the duration of these `elementsFromPoint` calls so axis labels and other
 * `pointer-events-none` overlays are hit-testable too. A small ring of probe
 * points makes 1px strokes (grid, lines) reachable.
 */
export function hitTestStudioLayer(
  contentRoot: HTMLElement,
  clientX: number,
  clientY: number,
  lookup: StudioLayerLookup
): string | null {
  contentRoot.classList.add(STUDIO_HIT_TEST_CLASS);
  try {
    const checked = new Map<Element, string | null>();
    for (const [dx, dy] of HIT_OFFSETS) {
      for (const element of document.elementsFromPoint(
        clientX + dx,
        clientY + dy
      )) {
        if (!contentRoot.contains(element) || element === contentRoot) {
          continue;
        }
        let id = checked.get(element);
        if (id === undefined) {
          id = isPaintedElement(element)
            ? layerIdForElement(element, lookup)
            : null;
          checked.set(element, id);
        }
        if (id) {
          return id;
        }
      }
    }
    return null;
  } finally {
    contentRoot.classList.remove(STUDIO_HIT_TEST_CLASS);
  }
}

/**
 * Host elements to measure under one layer fiber. SVG nodes bound their whole
 * subtree; HTML containers (portal roots, absolute overlays) usually span the
 * chart, so their painted descendants are measured instead.
 */
function collectFiberElements(layer: Fiber, elements: Element[]) {
  const stack: { fiber: Fiber; covered: boolean }[] = layer.child
    ? [{ fiber: layer.child, covered: false }]
    : [];
  while (stack.length > 0) {
    const { fiber, covered } = stack.pop() as {
      fiber: Fiber;
      covered: boolean;
    };
    if (fiber.sibling) {
      stack.push({ fiber: fiber.sibling, covered });
    }
    let childCovered = fiber.tag === HOST_PORTAL ? false : covered;
    const node = fiber.stateNode;
    if (
      fiber.tag === HOST_COMPONENT &&
      !covered &&
      node instanceof Element &&
      (node instanceof SVGElement || isPaintedElement(node))
    ) {
      elements.push(node);
      childCovered = true;
    }
    if (fiber.child) {
      stack.push({ fiber: fiber.child, covered: childCovered });
    }
  }
}

/** Elements whose rects outline a layer (SVG subtrees, painted HTML, portals). */
export function collectLayerElements(
  contentRoot: HTMLElement,
  layerId: string,
  lookup: StudioLayerLookup
): Element[] {
  const rootFiber = fiberFromNode(contentRoot);
  if (!rootFiber) {
    return [];
  }
  const elements: Element[] = [];
  for (const layer of findLayerFibers(
    currentFiber(rootFiber),
    layerId,
    lookup
  )) {
    collectFiberElements(layer, elements);
  }
  return elements;
}

export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function unionClientRect(elements: Element[]): ScreenRect | null {
  let rect: ScreenRect | null = null;
  for (const element of elements) {
    if (!element.isConnected) {
      continue;
    }
    const box = element.getBoundingClientRect();
    if (box.width <= 0 && box.height <= 0) {
      continue;
    }
    if (
      element instanceof SVGElement &&
      element.tagName !== "svg" &&
      isHidden(getComputedStyle(element))
    ) {
      continue;
    }
    rect = rect
      ? {
          left: Math.min(rect.left, box.left),
          top: Math.min(rect.top, box.top),
          right: Math.max(rect.right, box.right),
          bottom: Math.max(rect.bottom, box.bottom),
        }
      : { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
  }
  return rect;
}
