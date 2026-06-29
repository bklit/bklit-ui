"use client";

import { Icon } from "@bklitui/icons";
import { cn } from "@bklitui/ui/lib/utils";
import { animate, motion, type Transition } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  bezierFromSvgPoint,
  clampEaseBezierControl,
  DEFAULT_MOTION_BEZIER,
  easeEditorGeometry,
  formatMotionBezier,
  getMotionBezier,
  lerpCurvePoints,
  type MotionStateSlice,
  motionCurveAreaPath,
  motionCurveToSvg,
  parseMotionBezier,
  pointOnMotionCurve,
  studioMotionToTransition,
  targetMotionCurvePoints,
} from "@/lib/motion-config";
import {
  studioInputBackgroundClass,
  studioScrubSurfaceClass,
} from "@/lib/studio-chrome-classes";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  studioSidebarPopoverCollisionAvoidance,
  studioSidebarPopoverSideOffset,
} from "@/ui/studio-sidebar-popover";

const PREVIEW_H = 180;
const PAD = 24;
/** Top stop of the area fill gradient (0.4 × 0.8). */
const FILL_GRADIENT_TOP_OPACITY = 0.32;
const HANDLE_R = 6;
const NOTCH_R = 5.5;
const MORPH_TRANSITION = {
  type: "spring",
  duration: 0.42,
  bounce: 0.14,
} as const;

const INSTANT_TRANSITION = { duration: 0 } as const;

type DragTarget = "p1" | "p2" | null;

export type MotionCurveEditorLayout = "inline" | "popover";

function MotionCurveTriggerPreview({ state }: { state: MotionStateSlice }) {
  const size = 16;
  const pad = 2;
  const points = useMemo(() => targetMotionCurvePoints(state), [state]);
  const { path } = useMemo(
    () => motionCurveToSvg(points, size, size, pad),
    [points]
  );

  return (
    <span className="flex size-4 shrink-0 items-center justify-center overflow-hidden">
      <svg
        aria-hidden
        className="block size-4 text-muted-foreground"
        viewBox={`0 0 ${size} ${size}`}
      >
        <title>Easing curve</title>
        <path
          className="fill-none stroke-current"
          d={path}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.25}
        />
      </svg>
    </span>
  );
}

function useCurveContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(280);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const update = () => {
      setWidth(Math.max(160, Math.round(el.getBoundingClientRect().width)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

function MotionCurveEditorContent({
  state,
  onPreview,
  onCommit,
  onDragActiveChange,
}: {
  state: MotionStateSlice;
  onPreview: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  /** While dragging handles, chart reveal should not restart on every preview tick. */
  onDragActiveChange?: (dragging: boolean) => void;
}) {
  const { ref: containerRef, width } = useCurveContainerWidth();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [dragBezier, setDragBezier] = useState<
    [number, number, number, number] | null
  >(null);
  const [displayPoints, setDisplayPoints] = useState(() =>
    targetMotionCurvePoints(state)
  );
  const [playT, setPlayT] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playControls = useRef<ReturnType<typeof animate> | null>(null);
  const dragBezierRef = useRef<[number, number, number, number] | null>(null);
  const displayRef = useRef(displayPoints);
  const skipMorphRef = useRef(false);
  const hasMountedRef = useRef(false);
  const previewRafRef = useRef<number | null>(null);
  const pendingPreviewRef = useRef<string | null>(null);
  const [curveA11yLabel, setCurveA11yLabel] = useState(
    "Interactive motion curve"
  );

  displayRef.current = displayPoints;

  const transition = useMemo(() => studioMotionToTransition(state), [state]);
  const committedBezier = useMemo(
    () => clampEaseBezierControl(getMotionBezier(state)),
    [state]
  );
  const activeBezier = dragBezier ?? committedBezier;
  const isEase = state.motionType === "ease";

  useEffect(() => {
    setCurveA11yLabel(`Interactive ${isEase ? "easing" : "spring"} curve`);
  }, [isEase]);

  const stopPlay = useCallback(() => {
    playControls.current?.stop();
    playControls.current = null;
    setIsPlaying(false);
    setPlayT(0);
  }, []);

  const runPlay = useCallback(() => {
    stopPlay();
    setIsPlaying(true);
    playControls.current = animate(0, 1, {
      ...(transition as Transition),
      onUpdate: (v) => {
        setPlayT(v);
      },
      onComplete: () => {
        setPlayT(1);
        setIsPlaying(false);
        playControls.current = null;
      },
    });
  }, [stopPlay, transition]);

  // Morph between curves when settings change (ease ↔ spring, duration, etc.)
  useEffect(() => {
    if (dragging) {
      return;
    }
    if (skipMorphRef.current) {
      skipMorphRef.current = false;
      return;
    }

    const to = targetMotionCurvePoints(state, activeBezier);

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setDisplayPoints(to);
      return;
    }

    stopPlay();

    const from = displayRef.current;
    let cancelled = false;

    const controls = animate(0, 1, {
      ...MORPH_TRANSITION,
      onUpdate: (progress) => {
        if (cancelled) {
          return;
        }
        setDisplayPoints(lerpCurvePoints(from, to, progress));
      },
      onComplete: () => {
        if (!cancelled) {
          setDisplayPoints(to);
        }
      },
    });

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [activeBezier, dragging, state, stopPlay]);

  const { path } = useMemo(
    () => motionCurveToSvg(displayPoints, width, PREVIEW_H, PAD),
    [displayPoints, width]
  );

  const areaPath = useMemo(
    () => motionCurveAreaPath(displayPoints, width, PREVIEW_H, PAD),
    [displayPoints, width]
  );

  const easeGeom = useMemo(
    () =>
      isEase ? easeEditorGeometry(activeBezier, width, PREVIEW_H, PAD) : null,
    [activeBezier, isEase, width]
  );

  const notchPosition = useMemo(
    () => pointOnMotionCurve(displayPoints, playT, width, PREVIEW_H, PAD),
    [displayPoints, playT, width]
  );

  const fillGradientId = useId().replaceAll(":", "");

  useEffect(() => () => stopPlay(), [stopPlay]);

  const flushPreview = useCallback(() => {
    previewRafRef.current = null;
    const formatted = pendingPreviewRef.current;
    if (!formatted) {
      return;
    }
    pendingPreviewRef.current = null;
    onPreview("motionBezier", formatted);
    onPreview("motionEase", "custom");
  }, [onPreview]);

  const schedulePreview = useCallback(
    (formatted: string) => {
      pendingPreviewRef.current = formatted;
      if (previewRafRef.current == null) {
        previewRafRef.current = requestAnimationFrame(flushPreview);
      }
    },
    [flushPreview]
  );

  useEffect(
    () => () => {
      if (previewRafRef.current != null) {
        cancelAnimationFrame(previewRafRef.current);
      }
    },
    []
  );

  // Recover handles stuck off-canvas from a previous drag (URL may hold extreme values).
  useEffect(() => {
    if (state.motionEase !== "custom") {
      return;
    }
    const raw = parseMotionBezier(state.motionBezier);
    if (!raw) {
      return;
    }
    const clamped = clampEaseBezierControl(raw);
    if (formatMotionBezier(raw) !== formatMotionBezier(clamped)) {
      onCommit("motionBezier", formatMotionBezier(clamped));
    }
  }, [onCommit, state.motionBezier, state.motionEase]);

  const applyHandleDrag = useCallback(
    (clientX: number, clientY: number, target: "p1" | "p2") => {
      const svg = svgRef.current;
      if (!svg) {
        return;
      }
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = PREVIEW_H / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      const [bx, by] = bezierFromSvgPoint(x, y, width, PREVIEW_H, PAD);
      const next: [number, number, number, number] = [...activeBezier];
      if (target === "p1") {
        next[0] = bx;
        next[1] = by;
      } else {
        next[2] = bx;
        next[3] = by;
      }
      const clamped = clampEaseBezierControl(next);
      dragBezierRef.current = clamped;
      setDragBezier(clamped);
      skipMorphRef.current = true;
      setDisplayPoints(
        targetMotionCurvePoints({ ...state, motionType: "ease" }, clamped)
      );
      schedulePreview(formatMotionBezier(clamped));
    },
    [activeBezier, schedulePreview, state, width]
  );

  useEffect(() => {
    if (!dragging) {
      return;
    }
    const onMove = (e: PointerEvent) => {
      applyHandleDrag(e.clientX, e.clientY, dragging);
    };
    const onUp = () => {
      if (previewRafRef.current != null) {
        cancelAnimationFrame(previewRafRef.current);
        previewRafRef.current = null;
      }
      flushPreview();
      skipMorphRef.current = true;
      setDragging(null);
      onDragActiveChange?.(false);
      const next = dragBezierRef.current
        ? clampEaseBezierControl(dragBezierRef.current)
        : null;
      if (next) {
        const formatted = formatMotionBezier(next);
        onCommit("motionBezier", formatted);
        onCommit("motionEase", "custom");
      }
      dragBezierRef.current = null;
      setDragBezier(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [applyHandleDrag, dragging, flushPreview, onCommit, onDragActiveChange]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg",
        studioInputBackgroundClass
      )}
    >
      <div
        className="relative w-full max-w-full overflow-hidden"
        ref={containerRef}
      >
        <svg
          aria-label={curveA11yLabel}
          className="block h-[180px] w-full touch-none select-none text-foreground"
          preserveAspectRatio="none"
          ref={svgRef}
          role="img"
          viewBox={`0 0 ${width} ${PREVIEW_H}`}
        >
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={fillGradientId}
              x1="0"
              x2="0"
              y1={PAD}
              y2={PREVIEW_H - PAD}
            >
              <stop
                offset="0%"
                stopColor="var(--primary)"
                stopOpacity={FILL_GRADIENT_TOP_OPACITY}
              />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#${fillGradientId})`} stroke="none" />

          {isEase && easeGeom ? (
            <>
              <path
                className="stroke-muted-foreground/50"
                d={easeGeom.handlePathStart}
                fill="none"
                strokeWidth={1}
              />
              <path
                className="stroke-muted-foreground/50"
                d={easeGeom.handlePathEnd}
                fill="none"
                strokeWidth={1}
              />
              <circle
                className="fill-muted-foreground/50"
                cx={easeGeom.p0.x}
                cy={easeGeom.p0.y}
                r={3}
              />
              <circle
                className="fill-muted-foreground/50"
                cx={easeGeom.p3.x}
                cy={easeGeom.p3.y}
                r={3}
              />
              {(["p1", "p2"] as const).map((id) => {
                const pt = id === "p1" ? easeGeom.p1 : easeGeom.p2;
                return (
                  <g key={id}>
                    <circle
                      className="cursor-grab fill-transparent"
                      cx={pt.x}
                      cy={pt.y}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        (e.currentTarget as Element).setPointerCapture(
                          e.pointerId
                        );
                        dragBezierRef.current = activeBezier;
                        setDragBezier(activeBezier);
                        onDragActiveChange?.(true);
                        setDragging(id);
                      }}
                      r={HANDLE_R + 6}
                    />
                    <circle
                      className={cn(
                        "pointer-events-none fill-background stroke-2 stroke-primary",
                        dragging === id && "fill-primary/15"
                      )}
                      cx={pt.x}
                      cy={pt.y}
                      r={HANDLE_R}
                    />
                  </g>
                );
              })}
            </>
          ) : null}

          {dragging ? (
            <path
              className="fill-none stroke-primary"
              d={path}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          ) : (
            <motion.path
              animate={{ d: path }}
              className="fill-none stroke-primary/50"
              d={path}
              initial={false}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              transition={MORPH_TRANSITION}
            />
          )}

          <motion.circle
            animate={{ cx: notchPosition.x, cy: notchPosition.y }}
            className="fill-primary stroke-background"
            cx={notchPosition.x}
            cy={notchPosition.y}
            initial={false}
            r={NOTCH_R}
            strokeWidth={1.5}
            transition={
              dragging || isPlaying ? INSTANT_TRANSITION : MORPH_TRANSITION
            }
          />
        </svg>
      </div>

      <div className="flex h-10 items-stretch overflow-hidden">
        <div
          aria-hidden
          className="flex w-9 shrink-0 items-center justify-center text-muted-foreground"
        >
          <Icon className="size-4" name="IconBezierCurves" />
        </div>
        <Input
          className={cn(
            "h-10 min-w-0 flex-1 rounded-none border-0 px-2.5 font-mono text-xs shadow-none focus-visible:ring-0",
            "bg-transparent",
            "selection:bg-primary/25 selection:text-foreground",
            !isEase && "cursor-default text-muted-foreground"
          )}
          id="motion-bezier-input"
          onChange={
            isEase
              ? (e) => {
                  onPreview("motionEase", "custom");
                  onPreview("motionBezier", e.target.value);
                  const parsed = parseMotionBezier(e.target.value);
                  if (parsed) {
                    const clamped = clampEaseBezierControl(parsed);
                    skipMorphRef.current = true;
                    setDragBezier(null);
                    setDisplayPoints(
                      targetMotionCurvePoints(
                        { ...state, motionType: "ease" },
                        clamped
                      )
                    );
                    onCommit("motionBezier", formatMotionBezier(clamped));
                    onCommit("motionEase", "custom");
                  }
                }
              : undefined
          }
          placeholder={formatMotionBezier(DEFAULT_MOTION_BEZIER)}
          readOnly={!isEase}
          spellCheck={false}
          value={
            state.motionEase === "custom"
              ? state.motionBezier
              : formatMotionBezier(committedBezier)
          }
        />
        <button
          aria-label={isPlaying ? "Stop motion preview" : "Play motion preview"}
          className="flex w-9 shrink-0 items-center justify-center bg-transparent text-muted-foreground transition-colors hover:text-foreground"
          onClick={isPlaying ? stopPlay : runPlay}
          type="button"
        >
          <Icon className="size-4" name={isPlaying ? "IconStop" : "IconPlay"} />
        </button>
      </div>
    </div>
  );
}

function motionCurveTriggerLabel(state: MotionStateSlice): string {
  const committedBezier = clampEaseBezierControl(getMotionBezier(state));
  return state.motionEase === "custom"
    ? state.motionBezier
    : formatMotionBezier(committedBezier);
}

export function MotionCurveEditor({
  layout = "popover",
  disabled = false,
  state,
  onPreview,
  onCommit,
  onDragActiveChange,
}: {
  layout?: MotionCurveEditorLayout;
  disabled?: boolean;
  state: MotionStateSlice;
  onPreview: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onCommit: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  onDragActiveChange?: (dragging: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerLabel = useMemo(() => motionCurveTriggerLabel(state), [state]);

  if (layout === "inline") {
    return (
      <MotionCurveEditorContent
        onCommit={onCommit}
        onDragActiveChange={onDragActiveChange}
        onPreview={onPreview}
        state={state}
      />
    );
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-expanded={open}
        disabled={disabled}
        render={
          <button
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full min-w-0 items-center gap-2 px-3 text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50",
              studioScrubSurfaceClass,
              disabled && "pointer-events-none opacity-50"
            )}
            type="button"
          />
        }
      >
        <MotionCurveTriggerPreview state={state} />
        <span className="min-w-0 flex-1 truncate font-mono text-foreground text-xs">
          {triggerLabel}
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(calc(100vw-2rem),18rem)] gap-0 p-3"
        collisionAvoidance={studioSidebarPopoverCollisionAvoidance}
        positionMethod="fixed"
        side="right"
        sideOffset={studioSidebarPopoverSideOffset}
      >
        <MotionCurveEditorContent
          onCommit={onCommit}
          onDragActiveChange={onDragActiveChange}
          onPreview={onPreview}
          state={state}
        />
      </PopoverContent>
    </Popover>
  );
}
