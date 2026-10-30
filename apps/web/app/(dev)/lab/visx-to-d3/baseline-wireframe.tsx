"use client";

import { createElement, type ReactNode } from "react";
import type { GeometryNode } from "./bench/geometry";

/**
 * Redraws a stored geometry snapshot as an outline: every recorded element
 * with its geometry attributes, stroked, no fills. Text has no content in the
 * snapshot and paint servers / clips are not geometry, so those are skipped.
 * Top-level SVGs are laid out in a column (their page position is not part
 * of the snapshot).
 */

const SKIPPED_TAGS = new Set([
  "defs",
  "clippath",
  "mask",
  "pattern",
  "lineargradient",
  "radialgradient",
  "filter",
  "stop",
  "text",
  "tspan",
  "foreignobject",
  "title",
  "desc",
]);

const SHAPE_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);

/** Snapshot tags are lower-cased; React needs the SVG casing. */
const TAG_CASE: Record<string, string> = { foreignobject: "foreignObject" };

function parentPath(path: string): string | null {
  const index = path.lastIndexOf(" > ");
  return index === -1 ? null : path.slice(0, index);
}

function render(
  node: GeometryNode,
  children: Map<string, GeometryNode[]>
): ReactNode {
  if (SKIPPED_TAGS.has(node.tag)) {
    return null;
  }
  const { "style.transform": styleTransform, ...attrs } = node.attrs;
  const props: Record<string, unknown> = {
    ...attrs,
    key: node.path,
    ...(styleTransform
      ? {
          style: {
            transform: styleTransform,
            transformBox: "fill-box",
            transformOrigin: "50% 50%",
          },
        }
      : {}),
  };
  if (SHAPE_TAGS.has(node.tag)) {
    Object.assign(props, {
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1,
      vectorEffect: "non-scaling-stroke",
    });
  }
  return createElement(
    TAG_CASE[node.tag] ?? node.tag,
    props,
    ...(children.get(node.path) ?? []).map((child) => render(child, children))
  );
}

export function BaselineWireframe({ nodes }: { nodes: GeometryNode[] }) {
  const children = new Map<string, GeometryNode[]>();
  const roots: GeometryNode[] = [];
  for (const node of nodes) {
    const parent = parentPath(node.path);
    if (parent === null) {
      roots.push(node);
    } else {
      const list = children.get(parent) ?? [];
      list.push(node);
      children.set(parent, list);
    }
  }
  return (
    <div className="flex w-full flex-col items-center gap-2 text-foreground/70">
      {roots.map((root) => (
        <div className="max-w-full overflow-visible" key={root.path}>
          {render(root, children)}
        </div>
      ))}
    </div>
  );
}
