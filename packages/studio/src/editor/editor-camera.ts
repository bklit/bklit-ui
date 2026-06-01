export const EDITOR_CAMERA_MIN_ZOOM = 0.25;
export const EDITOR_CAMERA_MAX_ZOOM = 4;
export const EDITOR_CAMERA_SESSION_KEY = "bklit-studio-canvas-view-v2";
export const EDITOR_CAMERA_VIEW_PADDING = 64;

/** Viewport camera in screen space. */
export interface EditorCamera {
  x: number;
  y: number;
  zoom: number;
}

/** @deprecated Use EditorCamera */
export type EditorCanvasView = EditorCamera;

export function clampCameraZoom(zoom: number) {
  return Math.min(
    EDITOR_CAMERA_MAX_ZOOM,
    Math.max(EDITOR_CAMERA_MIN_ZOOM, zoom)
  );
}

export function cameraTransformMatrix(
  camera: EditorCamera
): [[number, number, number], [number, number, number]] {
  return [
    [camera.zoom, 0, camera.x],
    [0, camera.zoom, camera.y],
  ];
}

export function pickWorldTickInterval(zoom: number) {
  const targetScreenPx = 48;
  const worldInterval = targetScreenPx / Math.max(zoom, 0.01);
  const magnitude = 10 ** Math.floor(Math.log10(worldInterval));
  const normalized = worldInterval / magnitude;

  if (normalized < 2) {
    return magnitude;
  }
  if (normalized < 5) {
    return 2 * magnitude;
  }
  return 5 * magnitude;
}

export function computeFitCamera({
  viewportWidth,
  viewportHeight,
  worldX,
  worldY,
  worldWidth,
  worldHeight,
  padding = EDITOR_CAMERA_VIEW_PADDING,
}: {
  viewportWidth: number;
  viewportHeight: number;
  worldX: number;
  worldY: number;
  worldWidth: number;
  worldHeight: number;
  padding?: number;
}): EditorCamera {
  const availableWidth = Math.max(viewportWidth - padding, 120);
  const availableHeight = Math.max(viewportHeight - padding, 120);
  const zoom = clampCameraZoom(
    Math.min(availableWidth / worldWidth, availableHeight / worldHeight)
  );

  return {
    zoom,
    x: (viewportWidth - worldWidth * zoom) / 2 - worldX * zoom,
    y: (viewportHeight - worldHeight * zoom) / 2 - worldY * zoom,
  };
}

export function compute100PercentCamera({
  viewportWidth,
  viewportHeight,
  worldX,
  worldY,
  worldWidth,
  worldHeight,
}: {
  viewportWidth: number;
  viewportHeight: number;
  worldX: number;
  worldY: number;
  worldWidth: number;
  worldHeight: number;
}): EditorCamera {
  const zoom = 1;

  return {
    zoom,
    ...computeCenterCamera({
      viewportWidth,
      viewportHeight,
      worldX,
      worldY,
      worldWidth,
      worldHeight,
      zoom,
    }),
  };
}

export function computeCenterCamera({
  viewportWidth,
  viewportHeight,
  worldX,
  worldY,
  worldWidth,
  worldHeight,
  zoom,
}: {
  viewportWidth: number;
  viewportHeight: number;
  worldX: number;
  worldY: number;
  worldWidth: number;
  worldHeight: number;
  zoom: number;
}): Pick<EditorCamera, "x" | "y"> {
  return {
    x: (viewportWidth - worldWidth * zoom) / 2 - worldX * zoom,
    y: (viewportHeight - worldHeight * zoom) / 2 - worldY * zoom,
  };
}

export function zoomCameraAtPoint({
  camera,
  pointX,
  pointY,
  nextZoom,
}: {
  camera: EditorCamera;
  pointX: number;
  pointY: number;
  nextZoom: number;
}): EditorCamera {
  const zoom = clampCameraZoom(nextZoom);
  const worldX = (pointX - camera.x) / camera.zoom;
  const worldY = (pointY - camera.y) / camera.zoom;

  return {
    zoom,
    x: pointX - worldX * zoom,
    y: pointY - worldY * zoom,
  };
}

export function readPersistedCamera(): EditorCamera | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(EDITOR_CAMERA_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<
      EditorCamera & { panX?: number; panY?: number; scale?: number }
    >;

    const x = parsed.x ?? parsed.panX;
    const y = parsed.y ?? parsed.panY;
    const zoom = parsed.zoom ?? parsed.scale;

    if (!(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(zoom))) {
      return null;
    }

    return {
      zoom: clampCameraZoom(zoom as number),
      x: x as number,
      y: y as number,
    };
  } catch {
    return null;
  }
}

export function persistCamera(camera: EditorCamera) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(EDITOR_CAMERA_SESSION_KEY, JSON.stringify(camera));
  } catch {
    // Ignore quota / private mode errors.
  }
}
