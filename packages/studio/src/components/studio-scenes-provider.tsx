"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createDefaultScene,
  getArtboardsBounds,
  getPrimaryArtboard,
  patchPrimaryFrame,
  persistStudioScenesDocument,
  readStudioScenesDocument,
  type StudioArtboard,
  type StudioScenesDocument,
} from "@/lib/studio-scenes";

interface StudioFrameContextValue {
  frame: StudioArtboard;
  contentBounds: { x: number; y: number; width: number; height: number };
  updateFrame: (
    patch: Partial<Pick<StudioArtboard, "x" | "y" | "width" | "height">>
  ) => void;
}

const StudioFrameContext = createContext<StudioFrameContextValue | null>(null);

function getFrame(document: StudioScenesDocument) {
  const scene = document.scenes[0];
  return getPrimaryArtboard(
    scene ?? { id: "main", name: "main", artboards: [] }
  );
}

/** @deprecated Use StudioFrameProvider */
export const StudioScenesProvider = StudioFrameProvider;

export function StudioFrameProvider({
  frameWidth,
  frameHeight,
  onPrimaryFrameChange,
  persistSession = true,
  children,
}: {
  frameWidth: number;
  frameHeight: number;
  onPrimaryFrameChange: (width: number, height: number) => void;
  /** When false, keep the default artboard at the origin (marketing/static previews). */
  persistSession?: boolean;
  children: React.ReactNode;
}) {
  const [document, setDocument] = useState<StudioScenesDocument>(() =>
    createDefaultScene(frameWidth, frameHeight)
  );
  const framePropsRef = useRef({ frameWidth, frameHeight });
  const hasHydratedFromSessionRef = useRef(!persistSession);

  // Hydrate persisted frame position after mount — sessionStorage is unavailable on SSR.
  useEffect(() => {
    if (!persistSession || hasHydratedFromSessionRef.current) {
      return;
    }
    hasHydratedFromSessionRef.current = true;

    setDocument(
      patchPrimaryFrame(readStudioScenesDocument(frameWidth, frameHeight), {
        width: frameWidth,
        height: frameHeight,
      })
    );
  }, [frameHeight, frameWidth, persistSession]);

  const frame = useMemo(() => {
    const board = getFrame(document);
    if (board) {
      return board;
    }
    return (
      createDefaultScene(frameWidth, frameHeight).scenes[0]?.artboards[0] ?? {
        id: "frame-main",
        label: "Chart",
        x: 0,
        y: 0,
        width: frameWidth,
        height: frameHeight,
        primary: true,
      }
    );
  }, [document, frameHeight, frameWidth]);

  // Sync URL frame dimensions into session only when props change (viewport presets, etc.)
  useEffect(() => {
    const prev = framePropsRef.current;
    if (prev.frameWidth === frameWidth && prev.frameHeight === frameHeight) {
      return;
    }
    framePropsRef.current = { frameWidth, frameHeight };

    setDocument((previous) => {
      const board = getFrame(previous);
      if (!board) {
        return previous;
      }
      if (board.width === frameWidth && board.height === frameHeight) {
        return previous;
      }
      const next = patchPrimaryFrame(previous, {
        width: frameWidth,
        height: frameHeight,
      });
      if (persistSession) {
        persistStudioScenesDocument(next);
      }
      return next;
    });
  }, [frameHeight, frameWidth, persistSession]);

  const updateFrame = useCallback(
    (patch: Partial<Pick<StudioArtboard, "x" | "y" | "width" | "height">>) => {
      let syncedSize: { width: number; height: number } | undefined;

      setDocument((previous) => {
        const next = patchPrimaryFrame(previous, patch);
        if (persistSession) {
          persistStudioScenesDocument(next);
        }

        if (patch.width !== undefined || patch.height !== undefined) {
          const board = getFrame(next);
          if (board) {
            syncedSize = { width: board.width, height: board.height };
          }
        }

        return next;
      });

      if (syncedSize) {
        onPrimaryFrameChange(syncedSize.width, syncedSize.height);
      }
    },
    [onPrimaryFrameChange, persistSession]
  );

  const contentBounds = useMemo(() => getArtboardsBounds([frame]), [frame]);

  const value = useMemo(
    (): StudioFrameContextValue => ({
      frame,
      contentBounds,
      updateFrame,
    }),
    [contentBounds, frame, updateFrame]
  );

  return (
    <StudioFrameContext.Provider value={value}>
      {children}
    </StudioFrameContext.Provider>
  );
}

/** @deprecated Use useStudioFrame */
export function useStudioScenes() {
  return useStudioFrame();
}

export function useStudioFrame() {
  const context = useContext(StudioFrameContext);
  if (!context) {
    const fallback = createDefaultScene(720, 400);
    const board = fallback.scenes[0]?.artboards[0];
    if (!board) {
      throw new Error("Studio frame fallback is missing default frame.");
    }
    return {
      frame: board,
      contentBounds: { x: 0, y: 0, width: 720, height: 400 },
      updateFrame: () => undefined,
    } satisfies StudioFrameContextValue;
  }
  return context;
}
