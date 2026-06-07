"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback, useRef } from "react";
import { useStudioFrame } from "@/components/studio-scenes-provider";
import { EditorCanvas } from "@/editor/editor-canvas";
import { EditorFrameLabel } from "@/editor/editor-frame-label";
import {
  EditorGridaRuler,
  EditorGridaRulerCorner,
} from "@/editor/editor-grida-rulers";
import { EditorMenuBar } from "@/editor/editor-menu-bar";
import { EditorMobilePanelTriggers } from "@/editor/editor-mobile-panel-sheets";
import { FpsCounter } from "@/editor/fps-counter";
import { useEditorCamera } from "@/editor/use-editor-canvas-view";
import { STUDIO_EMBED_MENU_BAR_CLEARANCE } from "@/lib/studio-embed";
import { cn } from "@/lib/utils";

export function EditorMainPane({
  className,
  size,
  frameTitle,
  mobileViewport = false,
  showSidebarToggle = true,
  sidebarsOpen,
  onSidebarsOpenChange,
  onLeftSheetOpen,
  onRightSheetOpen,
  showFpsCounter = false,
  onReplay,
  controlsDisabled = false,
  showDimensions = true,
  embedMode = false,
  openInStudioHref,
  children,
}: {
  className?: string;
  size: { width: number; height: number };
  frameTitle: string;
  mobileViewport?: boolean;
  showSidebarToggle?: boolean;
  sidebarsOpen: boolean;
  onSidebarsOpenChange: (open: boolean) => void;
  onLeftSheetOpen?: () => void;
  onRightSheetOpen?: () => void;
  showFpsCounter?: boolean;
  onReplay?: () => void;
  controlsDisabled?: boolean;
  showDimensions?: boolean;
  /** Minimal chrome for iframe embeds: no rulers, footer toolbar, no theme/fit. */
  embedMode?: boolean;
  openInStudioHref?: string;
  children: (ctx: {
    size: { width: number; height: number };
    boundsRef: RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    mobileViewport: boolean;
    /** Screen-space zoom for resize pointer math only (read via ref — not a render prop). */
    canvasScaleRef: RefObject<number>;
  }) => ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasScaleRef = useRef(1);
  const canvasEnabled = !mobileViewport;
  const { frame, contentBounds, updateFrame } = useStudioFrame();

  const getContentBounds = useCallback(() => contentBounds, [contentBounds]);

  const camera = useEditorCamera({
    defaultZoom: embedMode ? 0.9 : 1,
    enabled: canvasEnabled,
    getContentBounds,
    persist: !mobileViewport,
    viewInsets: embedMode
      ? { bottom: STUDIO_EMBED_MENU_BAR_CLEARANCE }
      : undefined,
    viewportRef: canvasRef,
  });

  canvasScaleRef.current = camera.camera.zoom;

  const handleResize = useCallback(
    (width: number, height: number) => {
      updateFrame({ width, height });
    },
    [updateFrame]
  );

  const handleFrameMove = useCallback(
    (x: number, y: number) => {
      updateFrame({ x, y });
    },
    [updateFrame]
  );

  const frameContent = children({
    size: {
      width: frame.width,
      height: frame.height,
    },
    boundsRef: canvasRef,
    canvasScaleRef,
    mobileViewport,
    onResize: handleResize,
  });

  const menuBarProps = {
    canvasScale: camera.camera.zoom,
    controlsDisabled,
    height: frame.height,
    onCenterOnContent: camera.centerOnContent,
    onFitView: camera.fitToContent,
    onReplay,
    onResetZoom: camera.resetTo100,
    onSidebarsOpenChange,
    onZoomIn: () => camera.zoomBy(1.12),
    onZoomOut: () => camera.zoomBy(1 / 1.12),
    showDimensions,
    showFitView: !embedMode,
    showSidebarToggle,
    showThemeToggle: !embedMode,
    showZoomControls: canvasEnabled,
    sidebarsOpen,
    width: frame.width,
    openInStudioHref,
  };

  if (embedMode) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col", className)}>
        <div className="relative min-h-0 flex-1">
          <EditorCanvas
            camera={camera.camera}
            className="absolute inset-0"
            enabled={canvasEnabled}
            onDoubleClick={camera.onDoubleClick}
            onPointerDown={camera.onPointerDown}
            onPointerMove={camera.onPointerMove}
            onPointerUp={camera.onPointerUp}
            registerPinchHandlers={camera.registerPinchHandlers}
            spacePressed={camera.spacePressed}
            viewportRef={canvasRef}
          >
            <div
              className="absolute top-0 left-0 overflow-visible"
              style={{
                transform: `translate(${frame.x}px, ${frame.y}px)`,
              }}
            >
              <EditorFrameLabel
                canvasScaleRef={canvasScaleRef}
                onPositionChange={handleFrameMove}
                originX={frame.x}
                originY={frame.y}
                title={frameTitle}
              />
              {frameContent}
            </div>
          </EditorCanvas>

          <EditorMenuBar
            {...menuBarProps}
            className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2"
          />
        </div>
      </div>
    );
  }

  if (mobileViewport) {
    return (
      <div className={cn("flex h-full min-h-0 flex-col", className)}>
        <div className="studio-preview-canvas relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-3">
          {children({
            size: { width: size.width, height: size.height },
            boundsRef: canvasRef,
            onResize: handleResize,
            mobileViewport: true,
            canvasScaleRef,
          })}
          {onLeftSheetOpen && onRightSheetOpen ? (
            <EditorMobilePanelTriggers
              onLeftOpen={onLeftSheetOpen}
              onRightOpen={onRightSheetOpen}
            />
          ) : null}
          <EditorMenuBar
            canvasScale={1}
            className="pointer-events-auto absolute bottom-3 left-1/2 z-20 -translate-x-1/2"
            height={size.height}
            onFitView={() => undefined}
            onResetZoom={() => undefined}
            onSidebarsOpenChange={onSidebarsOpenChange}
            onZoomIn={() => undefined}
            onZoomOut={() => undefined}
            showSidebarToggle={showSidebarToggle}
            showZoomControls={false}
            sidebarsOpen={sidebarsOpen}
            width={size.width}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex h-full min-h-0 flex-1">
        <div className="flex h-full w-8 shrink-0 flex-col">
          <EditorGridaRulerCorner />
          <EditorGridaRuler
            axis="y"
            camera={camera.camera}
            className="min-h-0 flex-1"
            viewportRef={canvasRef}
          />
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorGridaRuler
            axis="x"
            camera={camera.camera}
            viewportRef={canvasRef}
          />

          <div className="relative min-h-0 flex-1">
            <EditorCanvas
              camera={camera.camera}
              className="absolute inset-0"
              enabled={canvasEnabled}
              onDoubleClick={camera.onDoubleClick}
              onPointerDown={camera.onPointerDown}
              onPointerMove={camera.onPointerMove}
              onPointerUp={camera.onPointerUp}
              registerPinchHandlers={camera.registerPinchHandlers}
              spacePressed={camera.spacePressed}
              viewportRef={canvasRef}
            >
              <div
                className="absolute top-0 left-0 overflow-visible"
                style={{
                  transform: `translate(${frame.x}px, ${frame.y}px)`,
                }}
              >
                <EditorFrameLabel
                  canvasScaleRef={canvasScaleRef}
                  onPositionChange={handleFrameMove}
                  originX={frame.x}
                  originY={frame.y}
                  title={frameTitle}
                />
                {frameContent}
              </div>
            </EditorCanvas>

            {mobileViewport && onLeftSheetOpen && onRightSheetOpen ? (
              <EditorMobilePanelTriggers
                onLeftOpen={onLeftSheetOpen}
                onRightOpen={onRightSheetOpen}
              />
            ) : null}

            {showFpsCounter ? (
              <FpsCounter
                className={cn(
                  "pointer-events-none absolute top-3 z-20",
                  mobileViewport ? "right-14" : "right-3"
                )}
              />
            ) : null}

            <EditorMenuBar
              {...menuBarProps}
              className={cn(
                "pointer-events-auto absolute left-1/2 z-20 -translate-x-1/2",
                mobileViewport ? "bottom-3" : "bottom-6"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
