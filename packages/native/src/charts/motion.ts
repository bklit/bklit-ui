import { Easing } from "react-native-reanimated";

// Every spring here sets mass: 1 to match Motion. Reanimated 4 defaults to 4.

/**
 * Motion constants copied from the web package so native and web feel the
 * same. Source of each value is noted; keep them in sync.
 */

/** `animation.ts` DEFAULT_ANIMATION_EASING: cubic-bezier(0.85, 0, 0.15, 1). */
export const CHART_EASING = Easing.bezier(0.85, 0, 0.15, 1);

/** Motion's "easeInOut" keyword. */
export const EASE_IN_OUT = Easing.bezier(0.42, 0, 0.58, 1);

/** `chart-phase.ts` DEFAULT_Y_DOMAIN_TWEEN_MS: data-change morph. */
export const DATA_TWEEN_MS = 500;

/** `tooltip-box.tsx`: outer panel fade in/out. */
export const PANEL_FADE_MS = 100;

/** `tooltip-box.tsx` PANEL_ENTRANCE_SPRING + entrance { scale: 0.85, x: ±20 }. */
export const PANEL_ENTRANCE_SPRING = { stiffness: 300, damping: 25, mass: 1 };
export const PANEL_ENTRANCE_SCALE = 0.85;
export const PANEL_ENTRANCE_X = 20;

/** `tooltip-dot.tsx`: dot 2.5 → 5, halo 5 → 13 (×2.6) at 30%, HALO_SPRING. */
export const DOT_SPRING = { stiffness: 420, damping: 28, mass: 1 };
export const DOT_SIZE = 5;
export const DOT_HALO_SCALE = 2.6;
export const DOT_HALO_OPACITY = 0.3;

/** `series-hover-dim.tsx` / `highlight-segment.tsx`: 0.4s easeInOut. */
export const HOVER_DIM_MS = 400;

/** `segment.tsx` SegmentBackground fade. */
export const SEGMENT_FADE_MS = 150;

/** Motion's "easeOut" keyword. */
export const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

/** Background / Weekends / TrendLine enter fade (web: 420ms easeOut). */
export const ENTER_FADE_MS = 420;
