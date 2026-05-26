"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EDITOR_MOBILE_CHART_ASPECT_RATIO,
  fitSizeToAspectRatio,
} from "@/components/editor/editor-aspect-ratio";
import { EditorMenuBar } from "@/components/editor/editor-menu-bar";
import { EditorMobilePanelTriggers } from "@/components/editor/editor-mobile-panel-sheets";
import {
  EditorRuler,
  EditorRulerCorner,
} from "@/components/editor/editor-rulers";
import type { ViewportPreset } from "@/components/editor/viewport-presets";
import { resolveViewportSize } from "@/components/editor/viewport-presets";
import { FpsCounter } from "@/components/playground/fps-counter";
import { cn } from "@/lib/utils";

const MOBILE_CANVAS_MIN_WIDTH = 240;
const MOBILE_CANVAS_MIN_HEIGHT = 180;

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
  children: (ctx: {
    size: { width: number; height: number };
    boundsRef: RefObject<HTMLDivElement | null>;
    onResize: (width: number, height: number) => void;
    mobileViewport: boolean;
  }) => ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const onSizeChangeRef = useRef(onSizeChange);
  onSizeChangeRef.current = onSizeChange;
  const [maxWidth, setMaxWidth] = useState(960);

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
    if (!mobileViewport) {
      return;
    }

    const element = canvasRef.current;
    if (!element) {
      return;
    }

    const fitToCanvas = () => {
      const style = getComputedStyle(element);
      const padX =
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight);
      const padY =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom);
      const width = Math.max(
        Math.round(element.clientWidth - padX),
        MOBILE_CANVAS_MIN_WIDTH
      );
      const height = Math.max(
        Math.round(element.clientHeight - padY),
        MOBILE_CANVAS_MIN_HEIGHT
      );
      const next = fitSizeToAspectRatio(
        width,
        height,
        EDITOR_MOBILE_CHART_ASPECT_RATIO,
        MOBILE_CANVAS_MIN_WIDTH,
        MOBILE_CANVAS_MIN_HEIGHT
      );
      if (next.width !== size.width || next.height !== size.height) {
        onSizeChangeRef.current(next.width, next.height);
      }
    };

    fitToCanvas();
    const observer = new ResizeObserver(fitToCanvas);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileViewport, size.height, size.width]);

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

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex h-full min-h-0 flex-1">
        <div className="flex h-full w-8 shrink-0 flex-col">
          <EditorRulerCorner />
          <EditorRuler className="min-h-0 flex-1" orientation="vertical" />
        </div>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <EditorRuler orientation="horizontal" />

          <div
            className={cn(
              "studio-preview-canvas relative flex min-h-0 flex-1 flex-col items-center justify-center",
              mobileViewport
                ? "overflow-hidden overscroll-none p-3"
                : "overflow-auto p-8"
            )}
            ref={canvasRef}
          >
            {children({
              size,
              boundsRef: canvasRef,
              onResize: handleResize,
              mobileViewport,
            })}

            {mobileViewport && onLeftSheetOpen && onRightSheetOpen ? (
              <EditorMobilePanelTriggers
                onLeftOpen={onLeftSheetOpen}
                onRightOpen={onRightSheetOpen}
              />
            ) : null}

            <FpsCounter
              className={cn(
                "absolute top-3 z-20",
                mobileViewport ? "right-14" : "right-3"
              )}
            />

            <EditorMenuBar
              className={cn(
                "absolute left-1/2 z-20 -translate-x-1/2",
                mobileViewport ? "bottom-3" : "bottom-6"
              )}
              height={size.height}
              onReplay={onReplay}
              onSidebarsOpenChange={onSidebarsOpenChange}
              onViewportChange={handleViewportChange}
              showSidebarToggle={showSidebarToggle}
              showViewportToggles={!mobileViewport}
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
