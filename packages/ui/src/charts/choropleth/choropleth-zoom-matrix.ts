/**
 * 2D affine matrix helpers for the choropleth zoom. Same fields, formulas and
 * operation order as `@visx/zoom` 4.0.0 `util/matrix`, so every wheel / drag /
 * button step produces a bit-identical transform.
 */

export interface TransformMatrix {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  skewX: number;
  skewY: number;
}

export interface Point {
  x: number;
  y: number;
}

export type Translate = Pick<TransformMatrix, "translateX" | "translateY">;
export type Scale = Pick<TransformMatrix, "scaleX" | "scaleY">;

export interface ScaleSignature {
  scaleX: TransformMatrix["scaleX"];
  scaleY?: TransformMatrix["scaleY"];
  point?: Point;
}

export interface ScaleLimits {
  scaleXMin: number;
  scaleXMax: number;
  scaleYMin: number;
  scaleYMax: number;
}

export function identityMatrix(): TransformMatrix {
  return {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  };
}

export function createMatrix({
  scaleX = 1,
  scaleY = 1,
  translateX = 0,
  translateY = 0,
  skewX = 0,
  skewY = 0,
}: Partial<TransformMatrix>): TransformMatrix {
  return { scaleX, scaleY, translateX, translateY, skewX, skewY };
}

export function inverseMatrix({
  scaleX,
  scaleY,
  translateX,
  translateY,
  skewX,
  skewY,
}: TransformMatrix): TransformMatrix {
  const denominator = scaleX * scaleY - skewY * skewX;
  return {
    scaleX: scaleY / denominator,
    scaleY: scaleX / denominator,
    translateX: (scaleY * translateX - skewX * translateY) / -denominator,
    translateY: (skewY * translateX - scaleX * translateY) / denominator,
    skewX: skewX / -denominator,
    skewY: skewY / -denominator,
  };
}

export function applyMatrixToPoint(
  matrix: TransformMatrix,
  { x, y }: Point
): Point {
  return {
    x: matrix.scaleX * x + matrix.skewX * y + matrix.translateX,
    y: matrix.skewY * x + matrix.scaleY * y + matrix.translateY,
  };
}

export function applyInverseMatrixToPoint(
  matrix: TransformMatrix,
  { x, y }: Point
): Point {
  return applyMatrixToPoint(inverseMatrix(matrix), { x, y });
}

export function scaleMatrix(
  scaleX: number,
  maybeScaleY: number | undefined = undefined
): TransformMatrix {
  const scaleY = maybeScaleY || scaleX;
  return createMatrix({ scaleX, scaleY });
}

export function translateMatrix(
  translateX: number,
  translateY: number
): TransformMatrix {
  return createMatrix({ translateX, translateY });
}

export function multiplyMatrices(
  matrix1: TransformMatrix,
  matrix2: TransformMatrix
): TransformMatrix {
  return {
    scaleX: matrix1.scaleX * matrix2.scaleX + matrix1.skewX * matrix2.skewY,
    scaleY: matrix1.skewY * matrix2.skewX + matrix1.scaleY * matrix2.scaleY,
    translateX:
      matrix1.scaleX * matrix2.translateX +
      matrix1.skewX * matrix2.translateY +
      matrix1.translateX,
    translateY:
      matrix1.skewY * matrix2.translateX +
      matrix1.scaleY * matrix2.translateY +
      matrix1.translateY,
    skewX: matrix1.scaleX * matrix2.skewX + matrix1.skewX * matrix2.scaleY,
    skewY: matrix1.skewY * matrix2.scaleX + matrix1.scaleY * matrix2.skewY,
  };
}

/** Left-to-right composition (visx folds pairwise from the left). */
export function composeMatrices(
  ...matrices: [TransformMatrix, ...TransformMatrix[]]
): TransformMatrix {
  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++) {
    result = multiplyMatrices(result, matrices[i] as TransformMatrix);
  }
  return result;
}

/** `matrix(a, b, c, d, e, f)` exactly as visx `toString()` writes it. */
export function matrixToString({
  scaleX,
  scaleY,
  translateX,
  translateY,
  skewX,
  skewY,
}: TransformMatrix): string {
  return `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, ${translateX}, ${translateY})`;
}

/**
 * visx default `constrain`: reject (keep `prev`) when the next scale leaves
 * the limits. Pan is never constrained.
 */
export function constrainScale(
  next: TransformMatrix,
  prev: TransformMatrix,
  { scaleXMin, scaleXMax, scaleYMin, scaleYMax }: ScaleLimits
): TransformMatrix {
  const { scaleX, scaleY } = next;
  const shouldConstrainScaleX = scaleX > scaleXMax || scaleX < scaleXMin;
  const shouldConstrainScaleY = scaleY > scaleYMax || scaleY < scaleYMin;
  if (shouldConstrainScaleX || shouldConstrainScaleY) {
    return prev;
  }
  return next;
}

/**
 * visx `scale()`: scale by `scaleX` / `scaleY` (defaults to `scaleX`) around
 * `point` (in container coordinates; centre of `width` x `height` if absent).
 */
export function scaleMatrixAroundPoint(
  matrix: TransformMatrix,
  { scaleX, scaleY: maybeScaleY, point }: ScaleSignature,
  width: number,
  height: number
): TransformMatrix {
  const scaleY = maybeScaleY || scaleX;
  const cleanPoint = point || { x: width / 2, y: height / 2 };
  const translate = applyInverseMatrixToPoint(matrix, cleanPoint);
  return composeMatrices(
    matrix,
    translateMatrix(translate.x, translate.y),
    scaleMatrix(scaleX, scaleY),
    translateMatrix(-translate.x, -translate.y)
  );
}

/** visx default `wheelDelta` (Zoom without a custom one). */
export function defaultWheelDelta(event: { deltaY: number }): Scale {
  return -event.deltaY > 0
    ? { scaleX: 1.1, scaleY: 1.1 }
    : { scaleX: 0.9, scaleY: 0.9 };
}

/** The `wheelDelta` ChoroplethChart passes: 5% per wheel event. */
export function choroplethWheelDelta(event: { deltaY: number }): Scale {
  const zoomScale = event.deltaY > 0 ? 0.95 : 1.05;
  return { scaleX: zoomScale, scaleY: zoomScale };
}

/** Pinch progress handed to `pinchDelta` (the use-gesture fields visx read). */
export interface PinchDeltaState {
  /** `[scale offset, angle]` now. */
  offset: [number, number];
  /** `[scale offset, angle]` when the pinch started. */
  lastOffset: [number, number];
  /** Pinch centre in client coordinates. */
  origin: [number, number];
}

/** visx default `pinchDelta`: a 10% step towards the pinch direction. */
export function defaultPinchDelta({
  offset: [s],
  lastOffset: [lastS],
}: PinchDeltaState): Scale {
  return {
    scaleX: s - lastS < 0 ? 0.9 : 1.1,
    scaleY: s - lastS < 0 ? 0.9 : 1.1,
  };
}

const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/** use-gesture `wheelValues()[1]`: deltaY in pixels. */
export function wheelDeltaYPixels(event: {
  deltaY: number;
  deltaMode: number;
}): number {
  if (event.deltaMode === 1) {
    return event.deltaY * LINE_HEIGHT;
  }
  if (event.deltaMode === 2) {
    return event.deltaY * PAGE_HEIGHT;
  }
  return event.deltaY;
}

/** use-gesture `PINCH_WHEEL_RATIO`: ctrl+wheel pixels per unit of pinch. */
export const PINCH_WHEEL_RATIO = 100;

/** use-gesture drag `tapsThreshold` (also the drag start threshold). */
export const DRAG_THRESHOLD_PX = 3;
