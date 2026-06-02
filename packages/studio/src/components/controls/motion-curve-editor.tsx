"use client";

import { cn } from "@bklitui/ui/lib/utils";
import {
  EaseCurveControlPointsIcon,
  PlayIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { animate, motion, type Transition } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { studioInputSurfaceClass } from "@/components/controls/control-field-helpers";
import {
  bezierFromSvgPoint,
  clampEaseBezierControl,
  easeEditorGeometry,
  formatMotionBezier,
  getMotionBezier,
  lerpCurvePoints,
  type MotionStateSlice,
  motionCurveToSvg,
  parseMotionBezier,
  pointOnMotionCurve,
  studioMotionToTransition,
  targetMotionCurvePoints,
} from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { Input } from "@/ui/input";

const PREVIEW_H = 180;
const PAD = 10;
const HANDLE_R = 6;
const NOTCH_R = 5.5;
const MORPH_TRANSITION = {
  type: "spring",
  duration: 0.42,
  bounce: 0.14,
} as const;

const INSTANT_TRANSITION = { duration: 0 } as const;

type DragTarget = "p1" | "p2" | null;

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

export function MotionCurveEditor({
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

  const easeGeom = useMemo(
    () =>
      isEase ? easeEditorGeometry(activeBezier, width, PREVIEW_H, PAD) : null,
    [activeBezier, isEase, width]
  );

  const notchPosition = useMemo(
    () => pointOnMotionCurve(displayPoints, playT, width, PREVIEW_H, PAD),
    [displayPoints, playT, width]
  );

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
    <div className="flex flex-col">
      <div
        className="studio-motion-curve-card relative w-full max-w-full overflow-hidden rounded-t-lg border border-border border-b-0 px-1"
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
          {isEase && easeGeom ? (
            <>
              <path
                className="stroke-muted-foreground/40"
                d={easeGeom.handlePathStart}
                fill="none"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <path
                className="stroke-muted-foreground/40"
                d={easeGeom.handlePathEnd}
                fill="none"
                strokeDasharray="3 3"
                strokeWidth={1}
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
              className="fill-none stroke-foreground"
              d={path}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          ) : (
            <motion.path
              animate={{ d: path }}
              className="fill-none stroke-foreground"
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

      <div
        className={cn(
          "flex h-9 items-stretch overflow-hidden rounded-b-lg border-border border-t",
          studioInputSurfaceClass
        )}
      >
        <div
          aria-hidden
          className="flex w-9 shrink-0 items-center justify-center border-border border-r text-muted-foreground"
        >
          <HugeiconsIcon
            icon={EaseCurveControlPointsIcon}
            size={16}
            strokeWidth={1.75}
          />
        </div>
        <Input
          className={cn(
            "h-9 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 font-mono text-xs shadow-none focus-visible:ring-0",
            !isEase && "cursor-default text-muted-foreground"
          )}
          id="motion-bezier-input"
          onChange={
            isEase
              ? (e) => {
                  const parsed = parseMotionBezier(e.target.value);
                  onPreview("motionBezier", e.target.value);
                  if (parsed) {
                    const clamped = clampEaseBezierControl(parsed);
                    setDragBezier(null);
                    onPreview("motionEase", "custom");
                    onCommit("motionBezier", formatMotionBezier(clamped));
                    onCommit("motionEase", "custom");
                  }
                }
              : undefined
          }
          placeholder="0.85, 0, 0.15, 1"
          readOnly={!isEase}
          spellCheck={false}
          value={state.motionBezier}
        />
        <button
          aria-label={isPlaying ? "Stop motion preview" : "Play motion preview"}
          className="flex w-9 shrink-0 items-center justify-center border-border border-l text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          onClick={isPlaying ? stopPlay : runPlay}
          type="button"
        >
          <HugeiconsIcon
            icon={isPlaying ? StopIcon : PlayIcon}
            size={16}
            strokeWidth={1.75}
          />
        </button>
      </div>
    </div>
  );
}
