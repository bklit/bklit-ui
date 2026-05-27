"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  StudioFrameRulerX,
  StudioFrameRulerY,
  studioRulerFade,
} from "@/components/studio/studio-frame-rulers";
import { cn } from "@/lib/utils";

export const STUDIO_CHART_FRAME_HEIGHT = 400;
export const STUDIO_CHART_FRAME_WIDTH = 720;
export const STUDIO_CHART_FRAME_MAX_WIDTH = 1000;
export const STUDIO_CHART_FRAME_MAX_HEIGHT = 800;
export const STUDIO_EXPORT_ROOT_ATTR = "data-studio-export-root";

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

const frameSpring = { type: "spring" as const, stiffness: 420, damping: 36 };

type ResizeEdge = "right" | "bottom" | "corner";

interface FrameSize {
  width: number;
  height: number;
}

function resizeAriaLabel(edge: ResizeEdge) {
  if (edge === "corner") {
    return "Resize width and height";
  }
  if (edge === "right") {
    return "Resize width";
  }
  return "Resize height";
}

function resizeCursor(edge: ResizeEdge) {
  if (edge === "right") {
    return "ew-resize";
  }
  if (edge === "bottom") {
    return "ns-resize";
  }
  return "nwse-resize";
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function clampFrameSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): FrameSize {
  const safeW = finiteOr(width, STUDIO_CHART_FRAME_WIDTH);
  const safeH = finiteOr(height, STUDIO_CHART_FRAME_HEIGHT);
  const maxW = Math.max(
    MIN_WIDTH,
    finiteOr(maxWidth, STUDIO_CHART_FRAME_MAX_WIDTH)
  );
  const maxH = Math.max(
    MIN_HEIGHT,
    finiteOr(maxHeight, STUDIO_CHART_FRAME_MAX_HEIGHT)
  );

  return {
    width: Math.round(Math.min(maxW, Math.max(MIN_WIDTH, safeW))),
    height: Math.round(Math.min(maxH, Math.max(MIN_HEIGHT, safeH))),
  };
}

function ResizeHandle({
  edge,
  onPointerDown,
}: {
  edge: ResizeEdge;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-label={resizeAriaLabel(edge)}
      className={cn(
        "absolute z-20 touch-none select-none border-0 bg-transparent p-0 opacity-0",
        edge === "right" &&
          "top-0 right-0 h-full w-4 translate-x-1/2 cursor-ew-resize",
        edge === "bottom" &&
          "bottom-0 left-0 h-4 w-full translate-y-1/2 cursor-ns-resize",
        edge === "corner" &&
          "right-0 bottom-0 size-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
      )}
      onPointerDown={onPointerDown}
      type="button"
    />
  );
}

export const StudioChartFrame = forwardRef<
  HTMLDivElement,
  {
    width: number;
    height: number;
    onResize: (width: number, height: number) => void;
    onDraggingChange?: (dragging: boolean) => void;
    /** Container used to cap resize (defaults to parent element). */
    boundsRef?: React.RefObject<HTMLElement | null>;
    className?: string;
    style?: CSSProperties;
    isRecording?: boolean;
    children: React.ReactNode;
  }
>(function StudioChartFrame(
  {
    width,
    height,
    onResize,
    onDraggingChange,
    boundsRef,
    className,
    style,
    isRecording = false,
    children,
  },
  ref
) {
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [maxSize, setMaxSize] = useState({
    width: STUDIO_CHART_FRAME_MAX_WIDTH,
    height: STUDIO_CHART_FRAME_MAX_HEIGHT,
  });
  const [size, setSize] = useState<FrameSize>(() =>
    clampFrameSize(
      width,
      height,
      STUDIO_CHART_FRAME_MAX_WIDTH,
      STUDIO_CHART_FRAME_MAX_HEIGHT
    )
  );

  useImperativeHandle(ref, () => captureRef.current as HTMLDivElement);

  useEffect(() => {
    const bounds = boundsRef?.current ?? wrapRef.current?.parentElement;
    if (!bounds) {
      return;
    }
    const update = () => {
      setMaxSize({
        width: STUDIO_CHART_FRAME_MAX_WIDTH,
        height: Math.min(
          STUDIO_CHART_FRAME_MAX_HEIGHT,
          Math.max(bounds.clientHeight, STUDIO_CHART_FRAME_HEIGHT)
        ),
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bounds);
    return () => observer.disconnect();
  }, [boundsRef]);

  useEffect(() => {
    if (draggingRef.current) {
      return;
    }
    setSize(clampFrameSize(width, height, maxSize.width, maxSize.height));
  }, [width, height, maxSize.width, maxSize.height]);

  const startDrag = useCallback(
    (edge: ResizeEdge) => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (isRecording) {
        return;
      }
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setIsDragging(true);
      onDraggingChange?.(true);

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = size.width;
      const startHeight = size.height;

      document.body.style.cursor = resizeCursor(edge);
      document.body.style.userSelect = "none";

      let latest = clampFrameSize(
        startWidth,
        startHeight,
        maxSize.width,
        maxSize.height
      );

      const onPointerMove = (moveEvent: PointerEvent) => {
        let nextWidth = startWidth;
        let nextHeight = startHeight;

        if (edge === "right" || edge === "corner") {
          nextWidth = startWidth + (moveEvent.clientX - startX);
        }
        if (edge === "bottom" || edge === "corner") {
          nextHeight = startHeight + (moveEvent.clientY - startY);
        }

        latest = clampFrameSize(
          nextWidth,
          nextHeight,
          maxSize.width,
          maxSize.height
        );
        setSize(latest);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        draggingRef.current = false;
        setIsDragging(false);
        onDraggingChange?.(false);
        onResize(latest.width, latest.height);
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
    },
    [
      isRecording,
      maxSize.height,
      maxSize.width,
      onDraggingChange,
      onResize,
      size.height,
      size.width,
    ]
  );

  const frameContent = (
    <div className="flex size-full min-h-0 min-w-0 items-center justify-center p-4">
      {children}
    </div>
  );

  return (
    <motion.div
      className={cn(
        "group/studio-frame relative inline-block max-w-full overflow-visible",
        className
      )}
      ref={wrapRef}
    >
      <motion.div
        animate={{ width: size.width, height: size.height }}
        className={cn(
          "relative overflow-visible border-2 bg-card",
          isRecording
            ? "border-transparent shadow-none"
            : cn(
                "rounded-lg shadow-sm transition-[border-color,border-style]",
                isDragging
                  ? "border-foreground/50 border-dotted"
                  : "border-border hover:border-foreground/35"
              )
        )}
        data-studio-export-root=""
        layout={!isRecording}
        ref={captureRef}
        style={style}
        transition={
          isDragging || reducedMotion || isRecording
            ? { duration: 0 }
            : { ...frameSpring, layout: frameSpring }
        }
      >
        {frameContent}
        {isRecording ? null : (
          <>
            <ResizeHandle edge="right" onPointerDown={startDrag("right")} />
            <ResizeHandle edge="bottom" onPointerDown={startDrag("bottom")} />
            <ResizeHandle edge="corner" onPointerDown={startDrag("corner")} />
          </>
        )}
      </motion.div>
      <AnimatePresence initial={false}>
        {isDragging ? (
          <>
            <StudioFrameRulerX
              key="studio-ruler-x"
              transition={reducedMotion ? { duration: 0 } : studioRulerFade}
              width={size.width}
            />
            <StudioFrameRulerY
              height={size.height}
              key="studio-ruler-y"
              transition={reducedMotion ? { duration: 0 } : studioRulerFade}
            />
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
});
