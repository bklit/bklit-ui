"use client";

import { Icon } from "@bklitui/icons";
import { DialogPrimitive } from "@bklitui/studio/ui/dialog";
import { PatternPreset } from "@bklitui/ui/charts";
import {
  ChartDataOverrideProvider,
  createChartDataOverrideStore,
} from "@bklitui/ui/charts/chart-data-override";
import { useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChartTheme } from "@/components/chart-theme/chart-theme-provider";
import {
  ChartDataEditorSheet,
  ChartOverrideBoundary,
  ChartRenderBoundary,
  useChartDataOverrides,
  useEditableJson,
} from "@/components/charts/chart-data-editor";
import type { EditableData } from "@/components/charts/editable-data";
import { Button } from "@/components/ui/button";
import { FramePanel } from "@/components/ui/frame";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHART_THEME_VAR_NAMES } from "@/lib/chart-themes";
import { cn } from "@/lib/utils";

/**
 * Social export formats, as final PNG pixels. The export canvas is laid out at
 * half these in CSS px (540×540 / 540×675) and rasterised at 2x, so the PNG is
 * exactly what the dialog shows.
 */
export const CHART_PRESENT_FORMATS = {
  square: { label: "Square", ratio: "1:1", width: 1080, height: 1080 },
  portrait: { label: "Portrait", ratio: "4:5", width: 1080, height: 1350 },
} as const;

export type ChartPresentFormat = keyof typeof CHART_PRESENT_FORMATS;

/** Black padding around the surface, in final PNG px (half that in CSS px). */
export const CHART_PRESENT_PADDINGS = [16, 32, 64, 128] as const;

export type ChartPresentPadding = (typeof CHART_PRESENT_PADDINGS)[number];

interface ChartPresentSettings {
  format: ChartPresentFormat;
  padding: ChartPresentPadding;
  /** Pattern opacity at the top-left corner, 0–100 (%). */
  patternOpacity: number;
  /**
   * Chart box as % of the stage (surface minus `STAGE_MIN_PADDING`), or
   * `null` for the chart type's default. Session-scoped: once the slider is
   * touched it applies to every chart until the tab closes or Auto is chosen.
   */
  chartSize: number | null;
  /** Aspect of the chart's own box inside the stage. */
  chartAspect: ChartPresentAspect;
  /** Show `[data-chart-legend]` elements (hidden with `display: none`). */
  showLegend: boolean;
}

/** Chart box aspects (width / height); `auto` keeps the chart's own aspect. */
export const CHART_PRESENT_ASPECTS = {
  auto: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
} as const;

export type ChartPresentAspect = keyof typeof CHART_PRESENT_ASPECTS;

export const CHART_SIZE_MIN = 40;
export const CHART_SIZE_MAX = 100;
const CHART_SIZE_STEP = 5;

/** Minimum gap between the surface edge and the chart box, CSS px. */
const STAGE_MIN_PADDING = 16;

const CHART_SIZE_SESSION_KEY = "bklit:chart-present-size";

const DEFAULT_SETTINGS: ChartPresentSettings = {
  format: "square",
  padding: 64,
  patternOpacity: 25,
  chartSize: null,
  chartAspect: "auto",
  showLegend: true,
};

const SETTINGS_STORAGE_KEY = "bklit:chart-present";

const EXPORT_PIXEL_RATIO = 2;

/** Viewport margin around the on-screen (scaled-up) dialog, in CSS px. */
const VIEWPORT_MARGIN = 24;

/** Half the floating menu bar's height (it straddles the canvas edge), CSS px. */
const MENU_BAR_OVERHANG = 22;

/**
 * Entrance animations settle well within this; an export requested sooner
 * waits out the remainder so the PNG never catches a chart mid-draw.
 */
const ENTRANCE_SETTLE_MS = 1800;

/** Re-center on the painted bounds as the entrance animation settles. */
const INK_CENTER_DELAYS_MS = [0, 300, 900, ENTRANCE_SETTLE_MS - 200];

/** Export button shows a checkmark this long after a download. */
const EXPORT_DONE_MS = 1600;

/** Export canvas size in layout CSS px (final PNG px / pixel ratio). */
function canvasLayoutSize(format: ChartPresentFormat) {
  const { width, height } = CHART_PRESENT_FORMATS[format];
  return {
    width: width / EXPORT_PIXEL_RATIO,
    height: height / EXPORT_PIXEL_RATIO,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readSessionChartSize(): number | null {
  try {
    const value = Number(window.sessionStorage.getItem(CHART_SIZE_SESSION_KEY));
    return value >= CHART_SIZE_MIN && value <= CHART_SIZE_MAX ? value : null;
  } catch {
    return null;
  }
}

function readStoredSettings(): ChartPresentSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<ChartPresentSettings>;
    return {
      format:
        parsed.format && parsed.format in CHART_PRESENT_FORMATS
          ? parsed.format
          : DEFAULT_SETTINGS.format,
      padding: CHART_PRESENT_PADDINGS.includes(
        parsed.padding as ChartPresentPadding
      )
        ? (parsed.padding as ChartPresentPadding)
        : DEFAULT_SETTINGS.padding,
      patternOpacity:
        typeof parsed.patternOpacity === "number" &&
        parsed.patternOpacity >= 0 &&
        parsed.patternOpacity <= 100
          ? parsed.patternOpacity
          : DEFAULT_SETTINGS.patternOpacity,
      chartSize: readSessionChartSize(),
      chartAspect:
        parsed.chartAspect && parsed.chartAspect in CHART_PRESENT_ASPECTS
          ? parsed.chartAspect
          : DEFAULT_SETTINGS.chartAspect,
      showLegend:
        typeof parsed.showLegend === "boolean"
          ? parsed.showLegend
          : DEFAULT_SETTINGS.showLegend,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Export settings, kept in localStorage so repeated exports reuse them. */
function useChartPresentSettings() {
  const [settings, setSettings] =
    useState<ChartPresentSettings>(DEFAULT_SETTINGS);
  const loadedRef = useRef(false);

  useEffect(() => {
    setSettings(readStoredSettings());
    loadedRef.current = true;
  }, []);

  const update = useCallback((patch: Partial<ChartPresentSettings>) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      if (loadedRef.current) {
        try {
          const { chartSize, ...persistent } = next;
          window.localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(persistent)
          );
          if (chartSize === null) {
            window.sessionStorage.removeItem(CHART_SIZE_SESSION_KEY);
          } else {
            window.sessionStorage.setItem(
              CHART_SIZE_SESSION_KEY,
              String(chartSize)
            );
          }
        } catch {
          // Storage unavailable (private mode): settings last for the session.
        }
      }
      return next;
    });
  }, []);

  return [settings, update] as const;
}

/** Width the data sheet takes from the right of the viewport (sm+), CSS px. */
const DATA_SHEET_RESERVE = 384 + 32;

/**
 * Uniform scale that fits the fixed-size dialog in the viewport, minus
 * `reserveRight` px (the data sheet) when set.
 */
function useViewportFitScale(
  size: { width: number; height: number },
  reserveRight: number
) {
  const [fit, setFit] = useState({ scale: 1, offsetX: 0 });
  useLayoutEffect(() => {
    const update = () => {
      // Only make room beside the dialog when the screen is wide enough.
      const reserve =
        reserveRight > 0 && window.innerWidth >= 640 ? reserveRight : 0;
      setFit({
        scale: Math.min(
          (window.innerWidth - reserve - VIEWPORT_MARGIN * 2) / size.width,
          (window.innerHeight - VIEWPORT_MARGIN * 2) / size.height
        ),
        offsetX: -reserve / 2,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [size.width, size.height, reserveRight]);
  return fit;
}

const NON_RENDERED_SVG_ANCESTORS =
  "defs, pattern, mask, clipPath, marker, symbol, linearGradient, radialGradient, filter";

const SVG_SHAPES =
  "path, line, polyline, polygon, circle, ellipse, rect, text, image, use";

function isPaintNone(value: string) {
  return (
    value === "none" || value === "transparent" || value === "rgba(0, 0, 0, 0)"
  );
}

function isHiddenShape(style: CSSStyleDeclaration) {
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return true;
  }
  const noFill = isPaintNone(style.fill) || Number(style.fillOpacity) === 0;
  const noStroke =
    isPaintNone(style.stroke) || Number(style.strokeOpacity) === 0;
  return noFill && noStroke;
}

/**
 * Viewport-space bounds of what the chart actually paints: SVG shapes (not
 * defs / hit areas) and HTML text. Layout boxes include dead space — a
 * gauge's open bottom, reserved axis room — so centering the box alone leaves
 * the visible chart off-center.
 */
function measureInkBounds(root: HTMLElement): DOMRect | null {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  const add = (rect: DOMRect) => {
    if (rect.width <= 0 && rect.height <= 0) {
      return;
    }
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  };

  for (const shape of root.querySelectorAll<SVGGraphicsElement>(SVG_SHAPES)) {
    if (
      shape.closest(NON_RENDERED_SVG_ANCESTORS) ||
      isHiddenShape(getComputedStyle(shape))
    ) {
      continue;
    }
    add(shape.getBoundingClientRect());
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!(node.textContent?.trim() && parent) || parent.closest("svg")) {
      continue;
    }
    const style = getComputedStyle(parent);
    if (style.visibility === "hidden" || Number(style.opacity) === 0) {
      continue;
    }
    range.selectNodeContents(node);
    add(range.getBoundingClientRect());
  }

  if (!(Number.isFinite(left) && right > left && bottom > top)) {
    return null;
  }
  return new DOMRect(left, top, right - left, bottom - top);
}

interface FitState {
  width: number;
  scale: number;
}

interface FitMachine {
  phase: "probe" | "shrink" | "done";
  probeHeight: number;
  availKey: string;
}

interface FitMeasure {
  availWidth: number;
  availHeight: number;
  width: number;
  height: number;
  /** Height of the plot alone (the rest — legend, brush… — stays fixed). */
  plotHeight: number;
  scale: number;
}

/**
 * The chart's plot: an element marked `data-chart-plot` (opt-in), else the
 * largest chart root (`.relative.w-full`, the aspect wrapper every bklit
 * chart renders). Legends, brushes and stat rows around it are companions.
 */
function findPlotElement(root: HTMLElement): HTMLElement | null {
  const marked = root.querySelector<HTMLElement>("[data-chart-plot]");
  if (marked) {
    return marked;
  }
  let best: HTMLElement | null = null;
  let bestArea = 0;
  for (const candidate of root.querySelectorAll<HTMLElement>(
    ".relative.w-full"
  )) {
    const area = candidate.offsetWidth * candidate.offsetHeight;
    if (area > bestArea) {
      best = candidate;
      bestArea = area;
    }
  }
  return best;
}

/** One step of the fit (see `ChartPresentFit`); mutates `machine`. */
function stepFit(
  machine: FitMachine,
  m: FitMeasure
): FitState | "remeasure" | null {
  if (!(m.availWidth > 0 && m.availHeight > 0)) {
    return null;
  }
  const key = `${m.availWidth}x${m.availHeight}`;
  if (key !== machine.availKey) {
    machine.availKey = key;
    machine.phase = "probe";
    // Always (re)commit a fit so the ink-centering pass runs.
    return { width: m.availWidth, scale: 1 };
  }
  if (m.height <= 0) {
    return null;
  }
  if (machine.phase === "probe") {
    if (Math.abs(m.width - m.availWidth) >= 1) {
      return { width: m.availWidth, scale: 1 };
    }
    if (m.height <= m.availHeight + 0.5) {
      machine.phase = "done";
      return null;
    }
    machine.phase = "shrink";
    machine.probeHeight = m.height;
    // The plot scales with width; companions keep their height.
    const companions = m.height - m.plotHeight;
    const room = m.availHeight - companions;
    if (m.plotHeight <= 0 || room <= 0) {
      return { width: (m.availWidth * m.availHeight) / m.height, scale: 1 };
    }
    return { width: (m.availWidth * room) / m.plotHeight, scale: 1 };
  }
  if (machine.phase === "shrink") {
    machine.phase = "done";
    return m.height > m.availHeight + 1
      ? { width: m.availWidth, scale: m.availHeight / machine.probeHeight }
      : null;
  }
  // Done: content that grows later (late data, wrapping) re-probes.
  if (m.scale === 1 && m.height > m.availHeight + 1) {
    machine.availKey = "";
    return "remeasure";
  }
  return null;
}

/**
 * Gives the chart a definite size inside the stage, then centers it:
 * 1. Lay out at the full stage width. If it fits, done.
 * 2. Too tall: responsive charts derive height from width (visx ParentSize,
 *    aspect wrappers), so narrow it to `stageHeight / aspect`.
 * 3. Still too tall (fixed-height content such as stacked charts or cards):
 *    go back to full width and scale it down to fit.
 * Finally the chart is nudged so its painted bounds — not its layout box —
 * sit at the stage center.
 */
function ChartPresentFit({
  unclampWidth,
  layoutKey,
  children,
}: {
  unclampWidth: boolean;
  /**
   * Changes when companions appear or disappear (legend toggle, chart
   * aspect): the fit restarts from the full stage width so the plot can grow
   * back into the freed space, then re-centers.
   */
  layoutKey: string;
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<FitState | null>(null);
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const shiftRef = useRef(shift);
  shiftRef.current = shift;

  useLayoutEffect(() => {
    const box = boxRef.current;
    const chart = chartRef.current;
    if (!(box && chart)) {
      return;
    }

    const machine: FitMachine = {
      phase: "probe",
      probeHeight: 0,
      availKey: "",
    };
    let frame = 0;

    let plot: HTMLElement | null = null;
    const step = () => {
      const nextPlot = findPlotElement(chart);
      if (nextPlot !== plot) {
        plot?.removeAttribute("data-present-plot");
        nextPlot?.setAttribute("data-present-plot", "");
        plot = nextPlot;
      }
      const action = stepFit(machine, {
        availWidth: box.clientWidth,
        availHeight: box.clientHeight,
        width: chart.offsetWidth,
        height: chart.offsetHeight,
        plotHeight: plot?.offsetHeight ?? chart.offsetHeight,
        scale: fitRef.current?.scale ?? 1,
      });
      if (action === "remeasure") {
        schedule();
      } else if (action) {
        setFit((current) =>
          current &&
          Math.abs(current.width - action.width) < 0.5 &&
          Math.abs(current.scale - action.scale) < 0.002
            ? current
            : action
        );
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(step);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(box);
    observer.observe(chart);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [layoutKey]);

  const fitRef = useRef(fit);
  fitRef.current = fit;

  useEffect(() => {
    const box = boxRef.current;
    const chart = chartRef.current;
    if (!(box && chart && fit)) {
      return;
    }
    const center = () => {
      const ink = measureInkBounds(chart);
      const boxRect = box.getBoundingClientRect();
      if (!ink || box.clientWidth === 0) {
        return;
      }
      // The canvas is visually scaled to the viewport; work in layout px.
      const k = boxRect.width / box.clientWidth;
      const current = shiftRef.current;
      const inkLeft = (ink.left - boxRect.left) / k - current.x;
      const inkTop = (ink.top - boxRect.top) / k - current.y;
      const inkWidth = ink.width / k;
      const inkHeight = ink.height / k;
      const clamp = (value: number, min: number, max: number) =>
        min > max ? 0 : Math.min(Math.max(value, min), max);
      const x = clamp(
        (box.clientWidth - inkWidth) / 2 - inkLeft,
        -inkLeft,
        box.clientWidth - inkWidth - inkLeft
      );
      const y = clamp(
        (box.clientHeight - inkHeight) / 2 - inkTop,
        -inkTop,
        box.clientHeight - inkHeight - inkTop
      );
      setShift((previous) =>
        Math.abs(previous.x - x) < 0.5 && Math.abs(previous.y - y) < 0.5
          ? previous
          : { x, y }
      );
    };
    const timers = INK_CENTER_DELAYS_MS.map((delay) =>
      setTimeout(center, delay)
    );
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [fit, layoutKey]);

  const transforms = [
    shift.x || shift.y ? `translate(${shift.x}px, ${shift.y}px)` : "",
    fit && fit.scale < 1 ? `scale(${fit.scale})` : "",
  ].filter(Boolean);

  return (
    <div
      className="flex size-full min-h-0 min-w-0 items-center justify-center"
      ref={boxRef}
    >
      <div
        className={cn(
          "min-w-0 shrink-0 [&>*]:mx-auto",
          // Gallery shells and the gauge cap demos at card widths (`max-w-md`,
          // `max-w-[260px]`…); in the stage the fit decides the width.
          unclampWidth && "[&_[class*='max-w-']]:max-w-none!"
        )}
        ref={chartRef}
        style={{
          width: fit?.width ?? "100%",
          transform: transforms.length > 0 ? transforms.join(" ") : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Whether the chart renders a legend (`[data-chart-legend]`, set by every
 * bklit legend root). Watched, since charts mount lazily and data edits can
 * remount them.
 */
function useHasChartLegend(rootRef: RefObject<HTMLElement | null>) {
  const [hasLegend, setHasLegend] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const check = () =>
      setHasLegend(root.querySelector("[data-chart-legend]") !== null);
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [rootRef]);
  return hasLegend;
}

/**
 * Canvas backdrop: a `dots` pattern preset in `--chart-1`, at `opacity` in the
 * top-left corner and fading out toward the bottom-right through an SVG mask
 * (SVG rather than a CSS mask so the DOM-to-image capture keeps it).
 */
function ChartPresentBackdrop({ opacity }: { opacity: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const patternId = `present-pattern-${id}`;
  const fadeId = `present-fade-${id}`;
  const maskId = `present-mask-${id}`;
  if (opacity <= 0) {
    return null;
  }
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      focusable="false"
    >
      <PatternPreset
        color="var(--chart-1)"
        id={patternId}
        preset="dots"
        scale={2}
      />
      <defs>
        <linearGradient id={fadeId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.85" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId}>
          <rect fill={`url(#${fadeId})`} height="100%" width="100%" />
        </mask>
      </defs>
      <rect
        fill={`url(#${patternId})`}
        height="100%"
        mask={`url(#${maskId})`}
        opacity={opacity}
        width="100%"
      />
    </svg>
  );
}

/**
 * Rasterises the live export canvas (black backdrop + pattern + the inset
 * frame surface with the chart, including any hover tooltip — the floating
 * menu bar lives outside it) at 2x. Nothing is remounted or re-measured: the
 * canvas is captured at its own layout size, with only the on-screen fit
 * transform dropped, so the PNG is exactly the format's pixel size.
 */
async function exportCanvasPng(
  canvasEl: HTMLElement,
  format: ChartPresentFormat
): Promise<string> {
  const { domToCanvas } = await import("modern-screenshot");
  const { width: outWidth, height: outHeight } = CHART_PRESENT_FORMATS[format];
  const layout = canvasLayoutSize(format);
  const captured = await domToCanvas(canvasEl, {
    backgroundColor: "#000",
    scale: EXPORT_PIXEL_RATIO,
    width: layout.width,
    height: layout.height,
    style: { transform: "none", top: "0", left: "0" },
  });
  if (captured.width === outWidth && captured.height === outHeight) {
    return captured.toDataURL("image/png");
  }
  const exact = document.createElement("canvas");
  exact.width = outWidth;
  exact.height = outHeight;
  const context = exact.getContext("2d");
  if (!context) {
    throw new Error("2D canvas unavailable");
  }
  context.drawImage(captured, 0, 0, outWidth, outHeight);
  return exact.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target.closest("input, textarea, select, [role='slider']") !== null
  );
}

/** Studio floating menu bar pill (`packages/studio/src/editor/editor-menu-bar.tsx`). */
const MENU_BAR_CLASS =
  "relative flex shrink-0 items-center justify-center gap-0.5 rounded-xl border bg-popover/90 not-dark:bg-clip-padding p-1 text-popover-foreground shadow-[0_8px_24px_-6px_rgb(0_0_0/0.08),0_2px_6px_-2px_rgb(0_0_0/0.05)] backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:shadow-[0_8px_24px_-6px_rgb(0_0_0/0.4),0_2px_6px_-2px_rgb(0_0_0/0.25)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]";

/** One height for every bar control (h-8; icon buttons square). */
const BAR_ICON_BUTTON_CLASS = "size-8 rounded-lg sm:size-8 [&_svg]:size-4";
const BAR_TEXT_CLASS = "font-mono text-[11px] tabular-nums";

function MenuBarDivider() {
  return (
    <div
      aria-hidden
      className="mx-1 h-4 w-px shrink-0 bg-border"
      role="presentation"
    />
  );
}

/**
 * "Present" dialog: the chart freshly mounted (entrance replays) and centered
 * on the gallery's frame surface, inset on a black, patterned canvas sized for
 * a social format (1:1 or 4:5). The canvas is laid out at the export's CSS
 * size and visually scaled to fit the viewport (a transform only — the chart
 * measures the layout size), so its PNG is exactly what's on screen, hover
 * state included. A Studio-style menu bar floats over the canvas's bottom
 * edge, outside the captured node. `E` exports.
 */
export function ChartPresentDialog({
  open,
  onOpenChange,
  title,
  fileSlug,
  unclampWidth = false,
  autoChartSize = 90,
  editableData,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible dialog title (visually hidden). */
  title: string;
  /** Download name stem: `bklit-<fileSlug>-<w>x<h>.png`. */
  fileSlug: string;
  /**
   * Lift `max-w-*` caps inside the chart so it fills the stage (gallery demos).
   * Leave off for composed cards (recipes) whose inner widths are layout.
   */
  unclampWidth?: boolean;
  /** Chart size (% of the stage) for this chart type when set to auto. */
  autoChartSize?: number;
  /**
   * Explicit data editor: the dialog renders `editableData.render(rows)`.
   * Without it, chart roots in `children` register their own data (see
   * `@bklitui/ui/charts/chart-data-override`) and the editor edits that.
   */
  editableData?: EditableData;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const [dataOpen, setDataOpen] = useState(false);
  const [settings, updateSettings] = useChartPresentSettings();
  // The popup is a scoped `.dark` root whose stylesheet tokens would reset the
  // chart vars to the default palette: re-apply the header palette's dark map.
  const { theme } = useChartTheme();
  const paletteVars = useMemo(() => {
    const vars: Record<string, string> = {};
    for (const name of CHART_THEME_VAR_NAMES) {
      const value = theme.dark[name];
      if (value) {
        vars[`--${name}`] = value;
      }
    }
    return vars as CSSProperties;
  }, [theme]);
  const layout = canvasLayoutSize(settings.format);
  const { scale: fitScale, offsetX } = useViewportFitScale(
    { width: layout.width, height: layout.height + MENU_BAR_OVERHANG * 2 },
    dataOpen ? DATA_SHEET_RESERVE : 0
  );

  return (
    <DialogPrimitive.Root
      onOpenChange={(next) => {
        if (!next) {
          setDataOpen(false);
        }
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
          data-slot="dialog-backdrop"
        />
        <DialogPrimitive.Viewport
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden"
          data-slot="dialog-viewport"
        >
          <DialogPrimitive.Popup
            className={cn(
              "dark relative text-foreground outline-none",
              "transition-[scale,opacity,translate,width,height] duration-200 ease-out data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
            )}
            data-slot="dialog-popup"
            style={{
              ...paletteVars,
              width: layout.width * fitScale,
              height: layout.height * fitScale,
              translate: offsetX ? `${offsetX}px 0` : undefined,
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              {title}
            </DialogPrimitive.Title>
            {open ? (
              <ChartPresentContent
                autoChartSize={autoChartSize}
                dataOpen={dataOpen}
                editableData={editableData}
                fileSlug={fileSlug}
                fitScale={fitScale}
                onDataOpenChange={setDataOpen}
                onSettingsChange={updateSettings}
                reducedMotion={reducedMotion === true}
                settings={settings}
                unclampWidth={unclampWidth}
              >
                {children}
              </ChartPresentContent>
            ) : null}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ChartPresentContent({
  fileSlug,
  fitScale,
  settings,
  onSettingsChange,
  reducedMotion,
  unclampWidth,
  autoChartSize,
  editableData: editableSpec,
  dataOpen,
  onDataOpenChange,
  children,
}: {
  fileSlug: string;
  fitScale: number;
  autoChartSize: number;
  editableData: EditableData | undefined;
  dataOpen: boolean;
  onDataOpenChange: (open: boolean) => void;
  settings: ChartPresentSettings;
  onSettingsChange: (patch: Partial<ChartPresentSettings>) => void;
  reducedMotion: boolean;
  unclampWidth: boolean;
  children: ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mountedAtRef = useRef(0);
  const exportingRef = useRef(false);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"idle" | "exporting" | "done" | "error">(
    "idle"
  );
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const {
    format,
    padding,
    patternOpacity,
    chartSize,
    chartAspect,
    showLegend,
  } = settings;
  const hasLegend = useHasChartLegend(canvasRef);
  const spec = CHART_PRESENT_FORMATS[format];
  const layout = canvasLayoutSize(format);
  const sizeLabel = `${spec.width}×${spec.height}`;
  const inset = padding / EXPORT_PIXEL_RATIO;
  const chartBoxPercent = chartSize ?? autoChartSize;
  // The chart box is `chartBoxPercent` of the stage; a fixed chart aspect
  // applies to the plot inside it (companions like a brush or legend keep
  // their own size), see `ChartPresentFit`.
  const plotAspect = CHART_PRESENT_ASPECTS[chartAspect];
  const editableJson = useEditableJson(editableSpec);
  const [renderError, setRenderError] = useState<string | null>(null);
  // Generic path: the chart roots register their data with this store.
  const [overrideStore] = useState(createChartDataOverrideStore);
  const overrides = useChartDataOverrides(editableSpec ? null : overrideStore);
  const hasEditableData = editableSpec ? true : overrides.available;
  const chart = editableSpec ? (
    <ChartRenderBoundary
      data={editableJson.data}
      onRenderError={setRenderError}
      render={editableSpec.render}
    />
  ) : (
    <ChartOverrideBoundary
      key={overrides.resetKey}
      onRenderError={overrides.onRenderError}
    >
      <ChartDataOverrideProvider store={overrideStore}>
        {children}
      </ChartDataOverrideProvider>
    </ChartOverrideBoundary>
  );

  useEffect(() => {
    mountedAtRef.current = performance.now();
    return () => {
      if (doneTimerRef.current) {
        clearTimeout(doneTimerRef.current);
      }
    };
  }, []);

  const runExport = useCallback(async () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || exportingRef.current) {
      return;
    }
    exportingRef.current = true;
    setStatus("exporting");
    try {
      const settleLeft = reducedMotion
        ? 0
        : ENTRANCE_SETTLE_MS - (performance.now() - mountedAtRef.current);
      if (settleLeft > 0) {
        await wait(settleLeft);
      }
      const dataUrl = await exportCanvasPng(canvasEl, format);
      downloadDataUrl(
        dataUrl,
        `bklit-${slugify(fileSlug) || "chart"}-${spec.width}x${spec.height}.png`
      );
      setStatus("done");
      if (doneTimerRef.current) {
        clearTimeout(doneTimerRef.current);
      }
      doneTimerRef.current = setTimeout(
        () => setStatus("idle"),
        EXPORT_DONE_MS
      );
    } catch {
      setStatus("error");
    } finally {
      exportingRef.current = false;
    }
  }, [fileSlug, format, reducedMotion, spec]);

  // `E` exports the canvas as it is — hover tooltip included.
  const popoverOpen = formatMenuOpen || backgroundOpen;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "e" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        popoverOpen ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      runExport();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [popoverOpen, runExport]);

  const exportLabel = `Export PNG (${sizeLabel}) — E`;
  let exportIcon = <Icon className="size-4" name="IconScreenCapture" />;
  if (status === "exporting") {
    exportIcon = <Spinner className="size-4" />;
  } else if (status === "done") {
    exportIcon = <Icon className="size-4" name="IconCheckmark1" />;
  } else if (status === "error") {
    exportIcon = (
      <Icon className="size-4 text-destructive" name="IconScreenCapture" />
    );
  }

  return (
    <>
      {/* The exported canvas: black + pattern, with the frame surface inset. */}
      <div
        className="absolute top-0 left-0 origin-top-left overflow-hidden bg-black"
        data-chart-present-canvas=""
        ref={canvasRef}
        style={{
          width: layout.width,
          height: layout.height,
          transform: `scale(${fitScale})`,
        }}
      >
        <ChartPresentBackdrop opacity={patternOpacity / 100} />
        {/* Same surface as the /charts and /recipes preview panels. */}
        <FramePanel
          className="absolute overflow-hidden p-0 text-foreground"
          data-chart-present-surface=""
          style={{ inset }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ padding: STAGE_MIN_PADDING }}
          >
            {/* The chart box: a real layout size, so charts re-measure. */}
            <div
              className={cn(
                "flex min-h-0 min-w-0 shrink-0",
                // A fixed chart aspect replaces the plot's own aspect wrapper
                // so it lays out (and re-measures) at that aspect, not stretched.
                chartAspect !== "auto" &&
                  "[&_[data-present-plot][style*=height]]:h-auto! [&_[data-present-plot]]:aspect-(--present-chart-aspect)!",
                // `display: none` (not visibility) so the fit re-measures and
                // the plot grows into the legend's space.
                !showLegend && "[&_[data-chart-legend]]:hidden!"
              )}
              data-chart-present-box=""
              style={
                {
                  width: `${chartBoxPercent}%`,
                  height: `${chartBoxPercent}%`,
                  "--present-chart-aspect": String(plotAspect ?? 1),
                } as CSSProperties
              }
            >
              <ChartPresentFit
                layoutKey={`${showLegend}:${chartAspect}`}
                unclampWidth={unclampWidth}
              >
                {chart}
              </ChartPresentFit>
            </div>
          </div>
        </FramePanel>
      </div>

      {/* Floating Studio-style menu bar over the canvas's bottom edge. */}
      <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
        <div className={MENU_BAR_CLASS} data-chart-present-menu-bar="">
          <FormatMenu
            format={format}
            onFormatChange={(next) => onSettingsChange({ format: next })}
            onOpenChange={setFormatMenuOpen}
          />
          <MenuBarDivider />
          <BackgroundPopover
            autoChartSize={autoChartSize}
            chartAspect={chartAspect}
            chartSize={chartSize}
            hasLegend={hasLegend}
            onChartAspectChange={(next) =>
              onSettingsChange({ chartAspect: next })
            }
            onChartSizeChange={(next) => onSettingsChange({ chartSize: next })}
            onOpenChange={setBackgroundOpen}
            onPaddingChange={(next) => onSettingsChange({ padding: next })}
            onPatternOpacityChange={(next) =>
              onSettingsChange({ patternOpacity: next })
            }
            onShowLegendChange={(next) =>
              onSettingsChange({ showLegend: next })
            }
            padding={padding}
            patternOpacity={patternOpacity}
            showLegend={showLegend}
          />
          {hasEditableData ? (
            <>
              <MenuBarDivider />
              <Button
                aria-expanded={dataOpen}
                aria-label="Edit data"
                aria-pressed={dataOpen}
                className={cn(
                  BAR_ICON_BUTTON_CLASS,
                  dataOpen && "bg-accent text-foreground"
                )}
                onClick={() => onDataOpenChange(!dataOpen)}
                size="icon"
                title="Edit data"
                type="button"
                variant="ghost"
              >
                <Icon className="size-4" name="IconTable" />
              </Button>
            </>
          ) : null}
          <MenuBarDivider />
          <TooltipProvider delay={0}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-keyshortcuts="E"
                    aria-label={exportLabel}
                    className={BAR_ICON_BUTTON_CLASS}
                    disabled={status === "exporting"}
                    onClick={runExport}
                    size="icon"
                    type="button"
                    variant="ghost"
                  />
                }
              >
                {exportIcon}
              </TooltipTrigger>
              <TooltipPopup>Export PNG (E)</TooltipPopup>
            </Tooltip>
          </TooltipProvider>
          <MenuBarDivider />
          <DialogPrimitive.Close
            aria-label="Close"
            render={
              <Button
                className={BAR_ICON_BUTTON_CLASS}
                size="icon"
                title="Close (Esc)"
                type="button"
                variant="ghost"
              />
            }
          >
            <Icon className="size-4" name="IconCrossSmall" />
          </DialogPrimitive.Close>
        </div>
        <p aria-live="polite" className="sr-only">
          {status === "done" ? "PNG downloaded" : null}
          {status === "error" ? "Export failed" : null}
        </p>
      </div>

      {hasEditableData ? (
        <ChartDataEditorSheet
          onOpenChange={onDataOpenChange}
          open={dataOpen}
          renderError={editableSpec ? renderError : overrides.renderError}
          state={editableSpec ? editableJson : overrides.state}
        />
      ) : null}
    </>
  );
}

function FormatMenu({
  format,
  onFormatChange,
  onOpenChange,
}: {
  format: ChartPresentFormat;
  onFormatChange: (format: ChartPresentFormat) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const spec = CHART_PRESENT_FORMATS[format];
  return (
    <Menu onOpenChange={onOpenChange}>
      <MenuTrigger
        render={
          <Button
            aria-label={`Format: ${spec.label} ${spec.ratio}, ${spec.width}×${spec.height}`}
            className={cn(
              "h-8 gap-1 rounded-lg px-2 text-muted-foreground hover:text-foreground sm:h-8",
              BAR_TEXT_CLASS
            )}
            size="sm"
            title="Format"
            type="button"
            variant="ghost"
          />
        }
      >
        {spec.ratio}
        <Icon className="size-4" name="IconChevronDownSmall" />
      </MenuTrigger>
      <MenuPopup align="center" className="dark min-w-56" side="top">
        <MenuGroup>
          <MenuGroupLabel>Format</MenuGroupLabel>
          <MenuRadioGroup
            onValueChange={(value) =>
              onFormatChange(value as ChartPresentFormat)
            }
            value={format}
          >
            {(Object.keys(CHART_PRESENT_FORMATS) as ChartPresentFormat[]).map(
              (key) => {
                const item = CHART_PRESENT_FORMATS[key];
                return (
                  <MenuRadioItem key={key} value={key}>
                    <span className="flex w-full items-center justify-between gap-4">
                      <span>
                        {item.label} {item.ratio}
                      </span>
                      <span
                        className={cn(BAR_TEXT_CLASS, "text-muted-foreground")}
                      >
                        {item.width}×{item.height}
                      </span>
                    </span>
                  </MenuRadioItem>
                );
              }
            )}
          </MenuRadioGroup>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}

function SettingLabel({
  children,
  value,
}: {
  children: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium text-muted-foreground text-xs">
        {children}
      </span>
      {value === undefined ? null : (
        <span className={cn(BAR_TEXT_CLASS, "text-foreground")}>{value}</span>
      )}
    </div>
  );
}

function BackgroundPopover({
  autoChartSize,
  chartSize,
  onChartSizeChange,
  chartAspect,
  onChartAspectChange,
  padding,
  onPaddingChange,
  patternOpacity,
  onPatternOpacityChange,
  hasLegend,
  showLegend,
  onShowLegendChange,
  onOpenChange,
}: {
  padding: ChartPresentPadding;
  onPaddingChange: (padding: ChartPresentPadding) => void;
  patternOpacity: number;
  onPatternOpacityChange: (opacity: number) => void;
  onOpenChange: (open: boolean) => void;
  autoChartSize: number;
  chartSize: number | null;
  onChartSizeChange: (size: number | null) => void;
  chartAspect: ChartPresentAspect;
  onChartAspectChange: (aspect: ChartPresentAspect) => void;
  /** The chart renders a legend; otherwise the switch is hidden. */
  hasLegend: boolean;
  showLegend: boolean;
  onShowLegendChange: (show: boolean) => void;
}) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button
            aria-label="Background and padding"
            className={BAR_ICON_BUTTON_CLASS}
            size="icon"
            title="Background and padding"
            type="button"
            variant="ghost"
          />
        }
      >
        <Icon className="size-4" name="IconSettingsSliderHor" />
      </PopoverTrigger>
      <PopoverPopup align="center" className="dark w-72" side="top">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <SettingLabel>Padding</SettingLabel>
            <SegmentedControl
              aria-label="Padding"
              className="w-full"
              render={
                <RadioGroupPrimitive
                  onValueChange={(value) =>
                    onPaddingChange(Number(value) as ChartPresentPadding)
                  }
                  value={String(padding)}
                />
              }
              size="sm"
            >
              {CHART_PRESENT_PADDINGS.map((value) => (
                <SegmentedControlItem
                  aria-label={`${value} px padding`}
                  className={cn("flex-1", BAR_TEXT_CLASS)}
                  key={value}
                  render={<RadioPrimitive.Root value={String(value)} />}
                >
                  {value}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          <div className="flex flex-col gap-2">
            <SettingLabel value={`${chartSize ?? autoChartSize}%`}>
              Chart size
              {chartSize === null ? (
                <span className="ms-1.5 text-muted-foreground/72">(auto)</span>
              ) : (
                <button
                  className="ms-1.5 text-muted-foreground/72 underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => onChartSizeChange(null)}
                  type="button"
                >
                  Reset
                </button>
              )}
            </SettingLabel>
            <Slider
              aria-label="Chart size"
              max={CHART_SIZE_MAX}
              min={CHART_SIZE_MIN}
              onValueChange={(value) =>
                onChartSizeChange(
                  Array.isArray(value) ? (value[0] ?? autoChartSize) : value
                )
              }
              step={CHART_SIZE_STEP}
              value={chartSize ?? autoChartSize}
            />
          </div>
          <div className="flex flex-col gap-2">
            <SettingLabel>Chart aspect</SettingLabel>
            <SegmentedControl
              aria-label="Chart aspect"
              className="w-full"
              render={
                <RadioGroupPrimitive
                  onValueChange={(value) =>
                    onChartAspectChange(value as ChartPresentAspect)
                  }
                  value={chartAspect}
                />
              }
              size="sm"
            >
              {(Object.keys(CHART_PRESENT_ASPECTS) as ChartPresentAspect[]).map(
                (key) => (
                  <SegmentedControlItem
                    aria-label={
                      key === "auto"
                        ? "Auto chart aspect"
                        : `${key} chart aspect`
                    }
                    className={cn("flex-1", BAR_TEXT_CLASS)}
                    key={key}
                    render={<RadioPrimitive.Root value={key} />}
                  >
                    {key === "auto" ? "Auto" : key}
                  </SegmentedControlItem>
                )
              )}
            </SegmentedControl>
          </div>
          <div className="flex flex-col gap-2">
            <SettingLabel value={`${patternOpacity}%`}>
              Pattern opacity
            </SettingLabel>
            <Slider
              aria-label="Pattern opacity"
              max={100}
              min={0}
              onValueChange={(value) =>
                onPatternOpacityChange(
                  Array.isArray(value) ? (value[0] ?? 0) : value
                )
              }
              step={1}
              value={patternOpacity}
            />
          </div>
          {hasLegend ? (
            <div
              className="flex items-center justify-between"
              data-chart-present-legend-toggle=""
            >
              <SettingLabel>Show legend</SettingLabel>
              <Switch
                aria-label="Show legend"
                checked={showLegend}
                className="[--thumb-size:--spacing(4)]"
                onCheckedChange={onShowLegendChange}
              />
            </div>
          ) : null}
        </div>
      </PopoverPopup>
    </Popover>
  );
}
