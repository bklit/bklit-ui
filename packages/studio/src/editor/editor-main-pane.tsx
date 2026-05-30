"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorCanvas } from "@/editor/editor-canvas";
import { EditorCanvasMinimap } from "@/editor/editor-canvas-minimap";
import { EditorMenuBar } from "@/editor/editor-menu-bar";
import { EditorMobilePanelTriggers } from "@/editor/editor-mobile-panel-sheets";
import { EditorRuler, EditorRulerCorner } from "@/editor/editor-rulers";
import { FpsCounter } from "@/editor/fps-counter";
import { useEditorCanvasView } from "@/editor/use-editor-canvas-view";
import type { ViewportPreset } from "@/editor/viewport-presets";
import { resolveViewportSize } from "@/editor/viewport-presets";
import { cn } from "@/lib/utils";

export function EditorMainPane({
  className,
  viewport,
  size,
  mobileViewport = false,
  showSidebarToggle = true,
  onViewportChange,
  onSizeChange,
  onReplay,
  sidebarsOpen,
  onSidebarsOpenChange,
  onLeftSheetOpen,
  onRightSheetOpen,
  showFpsCounter = false,
  menuBarActions,
  children,
}: {
  className?: string;
  viewport: ViewportPreset | null;
  size: { width: number; height: number };
  mobileViewport?: boolean;
  showSidebarToggle?: boolean;
  onViewportChange: (preset: ViewportPreset | null) => void;
  onSizeChange: (width: number, height: number) => void;
  onReplay: () => void;
  sidebarsOpen: boolean;
  onSidebarsOpenChange: (open: boolean) => void;
  onLeftSheetOpen?: () => void;
  onRightSheetOpen?: () => void;
  showFpsCounter?: boolean;
  menuBarActions?: ReactNode;
  children: (ctx: {
    size: { width: number; height: number };
    boundsRef: RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    mobileViewport: boolean;
    canvasScale: number;
  }) => ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(960);
  const canvasEnabled = true;

  const canvas = useEditorCanvasView({
    enabled: canvasEnabled,
    viewportRef: canvasRef,
    artboardWidth: size.width,
    artboardHeight: size.height,
    persist: !mobileViewport,
  });

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      setMaxWidth(Math.max(element.clientWidth - 48, 280));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    canvas.fitToView();
  }, [canvas.fitToView]);

  const handleViewportChange = useCallback(
    (preset: ViewportPreset) => {
      onViewportChange(preset);
      const next = resolveViewportSize(preset, maxWidth);
      onSizeChange(next.width, next.height);
    },
    [maxWidth, onSizeChange, onViewportChange]
  );

  const handleResize = useCallback(
    (width: number, height: number) => {
      onViewportChange(null);
      onSizeChange(width, height);
    },
    [onSizeChange, onViewportChange]
  );

  const handlePanTo = useCallback(
    (panX: number, panY: number) => {
      canvas.setPan(panX, panY);
    },
    [canvas]
  );

  const artboard = (
    <div
      className="studio-preview-canvas relative shrink-0 overflow-hidden"
      style={{ width: size.width, height: size.height }}
    >
      {children({
        size,
        boundsRef: canvasRef,
        onResize: handleResize,
        mobileViewport,
        canvasScale: canvas.view.scale,
      })}
    </div>
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex h-full min-h-0 flex-1">
        <div className="flex h-full w-8 shrink-0 flex-col">
          <EditorRulerCorner />
          <EditorRuler
            canvasView={canvas.view}
            className="min-h-0 flex-1"
            orientation="vertical"
          />
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorRuler canvasView={canvas.view} orientation="horizontal" />

          <div className="relative min-h-0 flex-1">
            <EditorCanvas
              className="absolute inset-0"
              enabled={canvasEnabled}
              onDoubleClick={canvas.onDoubleClick}
              onPointerDown={canvas.onPointerDown}
              onPointerMove={canvas.onPointerMove}
              onPointerUp={canvas.onPointerUp}
              onWheel={canvas.onWheel}
              registerPinchHandlers={canvas.registerPinchHandlers}
              spacePressed={canvas.spacePressed}
              view={canvas.view}
              viewportRef={canvasRef}
            >
              {artboard}
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

            {canvasEnabled && !mobileViewport ? (
              <EditorCanvasMinimap
                artboardHeight={size.height}
                artboardWidth={size.width}
                onPanTo={handlePanTo}
                view={canvas.view}
                viewportRef={canvasRef}
              />
            ) : null}

            <EditorMenuBar
              actions={menuBarActions}
              canvasScale={canvas.view.scale}
              className={cn(
                "pointer-events-auto absolute left-1/2 z-20 -translate-x-1/2",
                mobileViewport ? "bottom-3" : "bottom-6"
              )}
              height={size.height}
              onFitView={canvas.fitToView}
              onReplay={onReplay}
              onResetZoom={canvas.resetTo100}
              onSidebarsOpenChange={onSidebarsOpenChange}
              onViewportChange={handleViewportChange}
              onZoomIn={() => canvas.zoomBy(1.12)}
              onZoomOut={() => canvas.zoomBy(1 / 1.12)}
              showSidebarToggle={showSidebarToggle}
              showViewportToggles={!mobileViewport}
              showZoomControls={canvasEnabled}
              sidebarsOpen={sidebarsOpen}
              viewport={viewport}
              width={size.width}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
