export interface StudioArtboard {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Syncs with URL frameW/frameH when true. */
  primary: boolean;
}

export interface StudioScene {
  id: string;
  name: string;
  artboards: StudioArtboard[];
}

export interface StudioScenesDocument {
  activeSceneId: string;
  activeArtboardId: string;
  scenes: StudioScene[];
}

export const STUDIO_SCENES_SESSION_KEY = "bklit-studio-scenes";

const DEFAULT_ARTBOARD_ID = "frame-main";
const DEFAULT_SCENE_ID = "main";

export function createArtboard({
  id,
  label,
  x,
  y,
  width,
  height,
  primary = false,
}: {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  primary?: boolean;
}): StudioArtboard {
  return { id, label, x, y, width, height, primary };
}

export function createDefaultScene(
  width: number,
  height: number
): StudioScenesDocument {
  const artboard = createArtboard({
    id: DEFAULT_ARTBOARD_ID,
    label: "Chart",
    x: 0,
    y: 0,
    width,
    height,
    primary: true,
  });

  return {
    activeSceneId: DEFAULT_SCENE_ID,
    activeArtboardId: artboard.id,
    scenes: [
      {
        id: DEFAULT_SCENE_ID,
        name: "main",
        artboards: [artboard],
      },
    ],
  };
}

export function getPrimaryArtboard(scene: StudioScene) {
  return (
    scene.artboards.find((artboard) => artboard.primary) ?? scene.artboards[0]
  );
}

export function patchPrimaryFrame(
  document: StudioScenesDocument,
  patch: Partial<Pick<StudioArtboard, "x" | "y" | "width" | "height">>
): StudioScenesDocument {
  return {
    ...document,
    scenes: document.scenes.map((scene, index) =>
      index === 0
        ? {
            ...scene,
            artboards: scene.artboards.map((item) =>
              item.primary ? { ...item, ...patch } : item
            ),
          }
        : scene
    ),
  };
}

export function getArtboardsBounds(artboards: StudioArtboard[]) {
  if (artboards.length === 0) {
    return { x: 0, y: 0, width: 720, height: 400 };
  }

  const minX = Math.min(...artboards.map((board) => board.x));
  const minY = Math.min(...artboards.map((board) => board.y));
  const maxX = Math.max(...artboards.map((board) => board.x + board.width));
  const maxY = Math.max(...artboards.map((board) => board.y + board.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function readStudioScenesDocument(
  width: number,
  height: number
): StudioScenesDocument {
  if (typeof window === "undefined") {
    return createDefaultScene(width, height);
  }

  try {
    const raw = sessionStorage.getItem(STUDIO_SCENES_SESSION_KEY);
    if (!raw) {
      return createDefaultScene(width, height);
    }

    const parsed = JSON.parse(raw) as StudioScenesDocument;
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      return createDefaultScene(width, height);
    }

    const scene = parsed.scenes[0];
    if (!scene) {
      return createDefaultScene(width, height);
    }
    const primary =
      scene?.artboards.find((board) => board.primary) ?? scene?.artboards[0];
    if (!primary) {
      return createDefaultScene(width, height);
    }

    return {
      activeSceneId: scene.id,
      activeArtboardId: primary.id,
      scenes: [{ ...scene, artboards: [primary] }],
    };
  } catch {
    return createDefaultScene(width, height);
  }
}

export function persistStudioScenesDocument(document: StudioScenesDocument) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(STUDIO_SCENES_SESSION_KEY, JSON.stringify(document));
  } catch {
    // Ignore quota / private mode errors.
  }
}
