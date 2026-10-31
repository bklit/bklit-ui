import {
  diffGeometry,
  type GeometryNode,
  type ParityResult,
  snapshotGeometry,
} from "./geometry";
import { diffHtmlText, snapshotHtmlText, type TextNode } from "./html-text";
import { type CallbackLog, diffCallbacks, type LabProbe } from "./probe";

/**
 * Everything one settled moment of a chart is compared on: SVG geometry,
 * HTML text (outside the SVG) and the callback output emitted since the
 * previous snapshot.
 */
export interface Snapshot {
  nodes: GeometryNode[];
  texts: TextNode[];
  callbacks?: CallbackLog;
}

export function takeSnapshot(root: Element, probe?: LabProbe | null): Snapshot {
  const callbacks = probe?.drain();
  return {
    nodes: snapshotGeometry(root),
    texts: snapshotHtmlText(root),
    ...(callbacks ? { callbacks } : {}),
  };
}

/** Geometry (1e-4), text (exact text, 0.5 px boxes) and callbacks. */
export function diffSnapshots(before: Snapshot, after: Snapshot): ParityResult {
  const geometry = diffGeometry(before.nodes, after.nodes);
  const diffs = [
    ...geometry.diffs,
    ...diffHtmlText(before.texts, after.texts),
    ...diffCallbacks(before.callbacks, after.callbacks),
  ];
  return {
    ...geometry,
    identical: diffs.length === 0,
    diffs,
    textCount: { before: before.texts.length, after: after.texts.length },
  };
}
