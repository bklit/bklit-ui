export interface AreaLabelBox {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Positions are box centers; all series share the same collision space. */
export function layoutAreaValueLabels(
  boxes: AreaLabelBox[],
  width: number,
  height: number
) {
  const placed: (AreaLabelBox & { source: number })[] = [];
  const padding = 4;
  const gap = 6;
  const visible = boxes
    .map((box, source) => ({ ...box, source }))
    .filter(
      (box) =>
        [box.index, box.x, box.y, box.width, box.height].every(
          Number.isFinite
        ) &&
        box.x >= 0 &&
        box.x <= width &&
        box.y >= 0 &&
        box.y <= height &&
        box.width > 0 &&
        box.height > 0 &&
        box.width + padding * 2 <= width &&
        box.height + padding * 2 <= height
    );
  const first = Math.min(...visible.map((box) => box.index));
  const last = Math.max(...visible.map((box) => box.index));
  const edge = (index: number) => (index === first || index === last ? 0 : 1);
  // Keep endpoints when possible; place higher series first, regardless of tree order.
  visible.sort(
    (a, b) => edge(a.index) - edge(b.index) || a.x - b.x || a.y - b.y
  );
  for (const box of visible) {
    const x = Math.max(
      padding + box.width / 2,
      Math.min(width - padding - box.width / 2, box.x)
    );
    const offset = box.height / 2 + gap;
    for (const y of [box.y - offset, box.y + offset]) {
      if (
        y - box.height / 2 < padding ||
        y + box.height / 2 > height - padding
      ) {
        continue;
      }
      const collision = placed.some(
        (other) =>
          Math.abs(x - other.x) < (box.width + other.width) / 2 + gap &&
          Math.abs(y - other.y) < (box.height + other.height) / 2 + gap
      );
      if (collision) {
        continue;
      }
      placed.push({ ...box, x, y });
      break;
    }
  }
  return placed;
}

/** Minimum is a preference; collision avoidance still takes priority. */
export function resolveAreaValueLabelCount(
  length: number,
  width: number,
  min = 2,
  max?: number
) {
  const minimum = Number.isFinite(min) ? Math.max(0, Math.floor(min)) : 2;
  const maximum =
    max != null && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : length;
  return Math.min(
    length,
    maximum,
    Math.max(minimum, Math.floor(Math.max(0, width) / 48))
  );
}
