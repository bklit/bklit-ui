/**
 * X-axis tick selection, ported verbatim from web `x-axis.tsx`
 * (`selectEvenlySpacedIndices` and helpers) so native picks the same
 * data-aligned ticks: first and last rows always, even on-screen spacing,
 * `targetCount ± 1` tried. Keep in sync until this moves to a shared core.
 */

const MAX_GAP_LAYOUTS = 400;

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) {
    return 0;
  }
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** All ways to split `span` into `parts` positive integer gaps. */
function composePositiveSum(sum: number, parts: number): number[][] {
  if (parts === 1) {
    return sum >= 1 ? [[sum]] : [];
  }

  const layouts: number[][] = [];
  for (let gap = 1; gap <= sum - (parts - 1); gap++) {
    for (const tail of composePositiveSum(sum - gap, parts - 1)) {
      layouts.push([gap, ...tail]);
    }
  }
  return layouts;
}

function gapsToIndices(gaps: number[]): number[] {
  const indices = [0];
  let position = 0;
  for (const gap of gaps) {
    position += gap;
    indices.push(position);
  }
  return indices;
}

function indicesForTickCount(length: number, tickCount: number): number[] {
  const span = length - 1;
  if (span <= 0) {
    return [0];
  }

  const rawIndices = Array.from({ length: tickCount }, (_, index) =>
    Math.round((index / (tickCount - 1)) * span)
  );

  const indices = [...new Set(rawIndices)].sort((a, b) => a - b);
  if (indices[0] !== 0) {
    indices.unshift(0);
  }
  if (indices.at(-1) !== span) {
    indices.push(span);
  }

  return [...new Set(indices)].sort((a, b) => a - b);
}

function allIndexLayouts(length: number, tickCount: number): number[][] {
  const span = length - 1;
  if (span <= 0) {
    return [[0]];
  }

  const gapCount = tickCount - 1;
  if (gapCount <= 0) {
    return [[0]];
  }

  const layoutCount = binomial(span - 1, gapCount - 1);
  if (layoutCount > MAX_GAP_LAYOUTS) {
    return [indicesForTickCount(length, tickCount)];
  }

  return composePositiveSum(span, gapCount).map(gapsToIndices);
}

function dedupeIndicesByLabel(indices: number[], labels: string[]): number[] {
  const seenLabels = new Set<string>();
  const deduped: number[] = [];

  for (const index of indices) {
    const label = labels[index];
    if (label === undefined || seenLabels.has(label)) {
      continue;
    }
    seenLabels.add(label);
    deduped.push(index);
  }

  return deduped;
}

interface TickLayoutScore {
  score: number;
  symmetryPenalty: number;
  countDistance: number;
  /** 0 = smallest gap at end, 1 = at start, 2 = in the middle */
  edgePreference: number;
}

function indexGaps(indices: number[]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < indices.length; i++) {
    const current = indices[i];
    const previous = indices[i - 1];
    if (current == null || previous == null) {
      continue;
    }
    gaps.push(current - previous);
  }
  return gaps;
}

function smallestGapEdgePreference(indices: number[]): number {
  const gaps = indexGaps(indices);
  const smallestGap = Math.min(...gaps);
  const smallestGapIndex = gaps.indexOf(smallestGap);
  if (smallestGapIndex === gaps.length - 1) {
    return 0;
  }
  if (smallestGapIndex === 0) {
    return 1;
  }
  return 2;
}

function scoreTickLayout(
  indices: number[],
  resolveXPx: (index: number) => number,
  targetCount: number
): TickLayoutScore {
  if (indices.length < 2) {
    return {
      score: Number.POSITIVE_INFINITY,
      symmetryPenalty: Number.POSITIVE_INFINITY,
      countDistance: Number.POSITIVE_INFINITY,
      edgePreference: Number.POSITIVE_INFINITY,
    };
  }

  const pixelGaps: number[] = [];
  for (let i = 1; i < indices.length; i++) {
    const current = indices[i];
    const previous = indices[i - 1];
    if (current == null || previous == null) {
      continue;
    }
    pixelGaps.push(resolveXPx(current) - resolveXPx(previous));
  }

  const minGap = Math.min(...pixelGaps);
  const maxGap = Math.max(...pixelGaps);
  const meanGap =
    pixelGaps.reduce((sum, gap) => sum + gap, 0) / pixelGaps.length;
  const spreadRatio =
    meanGap > 0 ? (maxGap - minGap) / meanGap : maxGap - minGap;
  const countDistance = Math.abs(indices.length - targetCount);

  const gaps = indexGaps(indices);
  const smallestGap = Math.min(...gaps);
  const smallestGapIndex = gaps.indexOf(smallestGap);
  const interiorPenalty =
    smallestGapIndex > 0 && smallestGapIndex < gaps.length - 1 ? 0.08 : 0;

  const symmetryPenalty =
    gaps.reduce((penalty, gap, index) => {
      return penalty + Math.abs(gap - (gaps.at(-1 - index) ?? gap));
    }, 0) / gaps.length;

  return {
    score:
      spreadRatio +
      0.1 * countDistance +
      interiorPenalty +
      symmetryPenalty * 0.02,
    symmetryPenalty,
    countDistance,
    edgePreference: smallestGapEdgePreference(indices),
  };
}

function isBetterTickLayout(
  next: TickLayoutScore,
  best: TickLayoutScore,
  nextCountDistance: number,
  bestCountDistance: number
): boolean {
  if (next.score < best.score - 1e-6) {
    return true;
  }
  if (Math.abs(next.score - best.score) > 1e-6) {
    return false;
  }
  if (nextCountDistance < bestCountDistance) {
    return true;
  }
  if (nextCountDistance > bestCountDistance) {
    return false;
  }
  if (next.symmetryPenalty < best.symmetryPenalty - 1e-6) {
    return true;
  }
  if (next.symmetryPenalty > best.symmetryPenalty + 1e-6) {
    return false;
  }
  return next.edgePreference < best.edgePreference;
}

/**
 * Picks tick indices with the most even on-screen spacing. Tries
 * `targetCount ± 1` and evaluates every gap layout when feasible.
 */
export function selectEvenlySpacedIndices(
  length: number,
  targetCount: number,
  options?: {
    labels?: string[];
    resolveXPx?: (index: number) => number;
  }
): number[] {
  if (length <= 0) {
    return [];
  }
  if (length === 1) {
    return [0];
  }
  if (length <= targetCount) {
    return Array.from({ length }, (_, index) => index);
  }

  const resolveXPx = options?.resolveXPx ?? ((index: number) => index);

  const minCount = Math.max(2, targetCount - 1);
  const maxCount = Math.min(length, targetCount + 1);

  let bestIndices = indicesForTickCount(length, targetCount);
  let bestScore = scoreTickLayout(bestIndices, resolveXPx, targetCount);
  let bestCountDistance = bestScore.countDistance;

  for (let tickCount = minCount; tickCount <= maxCount; tickCount++) {
    for (const rawIndices of allIndexLayouts(length, tickCount)) {
      const indices = options?.labels
        ? dedupeIndicesByLabel(rawIndices, options.labels)
        : rawIndices;

      if (indices.length < 2) {
        continue;
      }

      const layoutScore = scoreTickLayout(indices, resolveXPx, targetCount);
      const countDistance = Math.abs(indices.length - targetCount);

      if (
        isBetterTickLayout(
          layoutScore,
          bestScore,
          countDistance,
          bestCountDistance
        )
      ) {
        bestIndices = indices;
        bestScore = layoutScore;
        bestCountDistance = countDistance;
      }
    }
  }

  return bestIndices;
}
