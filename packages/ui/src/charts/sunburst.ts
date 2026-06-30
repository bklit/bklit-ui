import type { SunburstNode } from "./sunburst-data";

export interface ArcDatum {
  id: string;
  name: string;
  depth: number;
  value: number;
  categoryIndex: number;
  hasChildren: boolean;
  trail: string[];
  parentId: string | null;
  a0: number;
  a1: number;
  /** Stable index for Studio layer wiring. */
  arcIndex: number;
  /** Optional color override from data node. */
  color?: string;
  /** Optional fill override from data node (patterns). */
  fill?: string;
}

export interface Focus {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  categoryIndex: number;
  a0: number;
  a1: number;
}

export interface ArcGeometry {
  a0: number;
  a1: number;
  innerR: number;
  outerR: number;
}

const TOP = -Math.PI / 2;
const TWO_PI = 2 * Math.PI;
const ID_SEP = " / ";

function nodeId(parentId: string | null, name: string): string {
  return parentId ? `${parentId}${ID_SEP}${name}` : name;
}

export function sumValues(node: SunburstNode): number {
  if (node.children?.length) {
    return node.children.reduce((sum, child) => sum + sumValues(child), 0);
  }
  return node.value ?? 0;
}

interface BuildContext {
  arcs: ArcDatum[];
  focusById: Map<string, Focus>;
  maxDepth: number;
  rootId: string;
  arcIndex: number;
}

function layoutNode(
  node: SunburstNode,
  id: string,
  depth: number,
  a0: number,
  a1: number,
  parentId: string | null,
  categoryIndex: number,
  trail: string[],
  ctx: BuildContext
) {
  const value = sumValues(node);
  const hasChildren = Boolean(node.children?.length);

  if (depth > 0) {
    ctx.arcs.push({
      id,
      name: node.name,
      depth,
      value,
      categoryIndex,
      hasChildren,
      trail: [...trail, node.name],
      parentId,
      a0,
      a1,
      arcIndex: ctx.arcIndex,
      color: node.color,
      fill: node.fill,
    });
    ctx.arcIndex += 1;
  }

  ctx.focusById.set(id, {
    id,
    name: node.name,
    depth,
    parentId,
    categoryIndex,
    a0,
    a1,
  });
  ctx.maxDepth = Math.max(ctx.maxDepth, depth);

  if (!(hasChildren && node.children?.length)) {
    return;
  }

  const span = a1 - a0;
  let cursor = a0;
  for (const [index, child] of node.children.entries()) {
    const childValue = sumValues(child);
    const childSpan = value > 0 ? (childValue / value) * span : 0;
    const childId = nodeId(id, child.name);
    const childCategory = depth === 0 ? index : categoryIndex;
    layoutNode(
      child,
      childId,
      depth + 1,
      cursor,
      cursor + childSpan,
      id,
      childCategory,
      depth === 0 ? [node.name] : trail,
      ctx
    );
    cursor += childSpan;
  }
}

function toRadians(normalized: number): number {
  return TOP + normalized * TWO_PI;
}

export function buildArcs(data: SunburstNode) {
  const rootId = data.name;
  const ctx: BuildContext = {
    arcs: [],
    focusById: new Map(),
    maxDepth: 0,
    rootId,
    arcIndex: 0,
  };

  layoutNode(data, rootId, 0, 0, 1, null, 0, [], ctx);

  for (const arc of ctx.arcs) {
    arc.a0 = toRadians(arc.a0);
    arc.a1 = toRadians(arc.a1);
  }
  for (const focus of ctx.focusById.values()) {
    focus.a0 = toRadians(focus.a0);
    focus.a1 = toRadians(focus.a1);
  }

  return {
    arcs: ctx.arcs,
    maxDepth: ctx.maxDepth,
    total: sumValues(data),
    focusById: ctx.focusById,
    rootId,
  };
}

export function ringOptions(
  focusDepth: number,
  maxDepth: number,
  radius: number
) {
  const oneLevelCenterR = radius / maxDepth;
  if (focusDepth === 0) {
    // Root view — segments fill from the center, no navigation hub gap.
    return { centerR: 0, ringWidth: oneLevelCenterR };
  }
  // Hub stays the same size from the first drill onward; only the rings widen.
  const centerR = oneLevelCenterR;
  const visibleRings = Math.max(1, maxDepth - focusDepth);
  const ringWidth = (radius - centerR) / visibleRings;
  return { centerR, ringWidth };
}

export function geometryFor(
  arc: ArcDatum,
  focus: Focus,
  maxDepth: number,
  radius: number
): ArcGeometry | null {
  if (arc.depth <= focus.depth) {
    return null;
  }
  if (arc.id !== focus.id && !arc.id.startsWith(`${focus.id}${ID_SEP}`)) {
    return null;
  }

  const { centerR, ringWidth } = ringOptions(focus.depth, maxDepth, radius);
  const relativeDepth = arc.depth - focus.depth;
  const focusSpan = focus.a1 - focus.a0;
  const mapAngle = (angle: number) => {
    if (focusSpan <= 1e-9) {
      return TOP;
    }
    return TOP + ((angle - focus.a0) / focusSpan) * TWO_PI;
  };

  return {
    a0: mapAngle(arc.a0),
    a1: mapAngle(arc.a1),
    innerR: centerR + (relativeDepth - 1) * ringWidth,
    outerR: centerR + relativeDepth * ringWidth,
  };
}

export function lerpGeometry(
  from: ArcGeometry,
  to: ArcGeometry,
  progress: number
): ArcGeometry {
  const t = Math.min(1, Math.max(0, progress));
  const fromMid = (from.a0 + from.a1) / 2;
  const toMid = (to.a0 + to.a1) / 2;
  const fromHalf = (from.a1 - from.a0) / 2;
  const toHalf = (to.a1 - to.a0) / 2;
  const mid = lerpAngle(fromMid, toMid, t);
  const half = fromHalf + (toHalf - fromHalf) * t;

  return {
    a0: mid - half,
    a1: mid + half,
    innerR: from.innerR + (to.innerR - from.innerR) * t,
    outerR: from.outerR + (to.outerR - from.outerR) * t,
  };
}

function lerpAngle(from: number, to: number, progress: number): number {
  let delta = to - from;
  while (delta > Math.PI) {
    delta -= TWO_PI;
  }
  while (delta < -Math.PI) {
    delta += TWO_PI;
  }
  return from + delta * progress;
}

function pointGeometry(source: ArcGeometry): ArcGeometry {
  const mid = (source.a0 + source.a1) / 2;
  const radius = (source.innerR + source.outerR) / 2;
  const pin = Math.max(0, Math.min(radius * 0.12, source.innerR));
  return { a0: mid, a1: mid, innerR: pin, outerR: pin };
}

/** Zoom morph — lerps matching arcs; entering/exiting arcs collapse to a point. */
export function transitionGeometry(
  arc: ArcDatum,
  fromFocus: Focus,
  toFocus: Focus,
  maxDepth: number,
  radius: number,
  progress: number
): ArcGeometry | null {
  const from = geometryFor(arc, fromFocus, maxDepth, radius);
  const to = geometryFor(arc, toFocus, maxDepth, radius);

  if (!(from || to)) {
    return null;
  }
  if (from && to) {
    return lerpGeometry(from, to, progress);
  }
  if (from) {
    return lerpGeometry(from, pointGeometry(from), progress);
  }
  if (to) {
    return lerpGeometry(pointGeometry(to), to, progress);
  }
  return null;
}

/** Normalized clockwise angle from 12 o'clock (0 → 1). */
export function clockwiseFraction(angle: number): number {
  let normalized = angle - TOP;
  if (normalized < 0) {
    normalized += TWO_PI;
  }
  return normalized / TWO_PI;
}

/** Ring-by-ring, clockwise stagger for the init reveal. */
export function buildRevealDelays(arcs: ArcDatum[]): Map<string, number> {
  const map = new Map<string, number>();
  const ringGap = 0.14;
  const ringSpan = 0.28;
  const byDepth = new Map<number, ArcDatum[]>();

  for (const arc of arcs) {
    const list = byDepth.get(arc.depth) ?? [];
    list.push(arc);
    byDepth.set(arc.depth, list);
  }

  for (const [depth, ringArcs] of byDepth) {
    const sorted = [...ringArcs].sort(
      (a, b) => clockwiseFraction(a.a0) - clockwiseFraction(b.a0)
    );
    const ringIndex = depth - 1;
    const baseDelay = ringIndex * ringGap;

    for (const [index, arc] of sorted.entries()) {
      const clockwiseSlot = sorted.length <= 1 ? 0 : index / sorted.length;
      map.set(arc.id, baseDelay + clockwiseSlot * ringSpan);
    }
  }

  return map;
}

export function arcPath(
  geometry: ArcGeometry,
  progress: number
): string | null {
  if (progress <= 0) {
    return null;
  }

  const p = Math.min(1, Math.max(0, progress));
  const { a0, a1, innerR, outerR } = geometry;

  if (p >= 1) {
    return arcPathFromGeometry(geometry);
  }

  const span = a1 - a0;

  // Clockwise sweep from the segment's leading edge (matches pie chart enter).
  const currentA0 = a0;
  const currentA1 = a0 + span * p;
  const currentInner = innerR < 1 ? 0 : innerR;
  const currentOuter = innerR < 1 ? outerR * p : innerR + (outerR - innerR) * p;

  return arcPathFromRadii(currentA0, currentA1, currentInner, currentOuter);
}

function arcPathFromGeometry(geometry: ArcGeometry): string | null {
  const { a0, a1, innerR, outerR } = geometry;
  return arcPathFromRadii(a0, a1, innerR, outerR);
}

function arcPathFromRadii(
  currentA0: number,
  currentA1: number,
  currentInner: number,
  currentOuter: number
): string | null {
  if (currentOuter - currentInner < 0.5 || currentA1 - currentA0 < 0.001) {
    return null;
  }

  const largeArc = currentA1 - currentA0 > Math.PI ? 1 : 0;
  const outerX0 = Math.sin(currentA0) * currentOuter;
  const outerY0 = -Math.cos(currentA0) * currentOuter;
  const outerX1 = Math.sin(currentA1) * currentOuter;
  const outerY1 = -Math.cos(currentA1) * currentOuter;

  if (currentInner < 1) {
    return `M 0 0 L ${outerX0} ${outerY0} A ${currentOuter} ${currentOuter} 0 ${largeArc} 1 ${outerX1} ${outerY1} Z`;
  }

  const innerX1 = Math.sin(currentA1) * currentInner;
  const innerY1 = -Math.cos(currentA1) * currentInner;
  const innerX0 = Math.sin(currentA0) * currentInner;
  const innerY0 = -Math.cos(currentA0) * currentInner;

  return `M ${outerX0} ${outerY0} A ${currentOuter} ${currentOuter} 0 ${largeArc} 1 ${outerX1} ${outerY1} L ${innerX1} ${innerY1} A ${currentInner} ${currentInner} 0 ${largeArc} 0 ${innerX0} ${innerY0} Z`;
}

export function centroidAngle(arc: ArcDatum): number {
  return (arc.a0 + arc.a1) / 2;
}

export function geomCentroidAngle(geometry: ArcGeometry): number {
  return (geometry.a0 + geometry.a1) / 2;
}

export function geomCentroidRadius(geometry: ArcGeometry): number {
  return (geometry.innerR + geometry.outerR) / 2;
}

export function localProgress(progress: number, delay: number): number {
  if (progress <= delay) {
    return 0;
  }
  const remaining = 1 - delay;
  if (remaining <= 0) {
    return 1;
  }
  const raw = Math.min(1, (progress - delay) / remaining);
  return raw;
}
