"use client";

import { memo, useCallback, useId } from "react";
import { cn } from "@/lib/utils";
import {
  CHOROPLETH_CAMERA_SCALE_VAR,
  useChoroplethCamera,
} from "./choropleth-camera";
import {
  useChoroplethInteraction,
  useChoroplethStable,
  useChoroplethZoom,
} from "./choropleth-context";

export type ChoroplethMarkerShape =
  | "circle"
  | "triangle"
  | "square"
  | "diamond"
  | "pin";

export type ChoroplethMarkerPulse = "none" | "hover" | "always";

export interface ChoroplethMarkerProps {
  /** `[longitude, latitude]` */
  coordinates: [number, number];
  /** Name shown in the tooltip (and next to the marker with `showLabel`). */
  label: string;
  /** Default: "circle" */
  shape?: ChoroplethMarkerShape;
  /** Marker size in px. It stays this size while the map zooms. Default: 9 */
  size?: number;
  /** Default: `var(--foreground)` */
  color?: string;
  /** Outline colour; omit for no outline. */
  stroke?: string;
  /** Outline width in px (only with `stroke`). Default: 1.5 */
  strokeWidth?: number;
  /** Ripple ring: off, while hovered/focused, or always. Default: "hover" */
  pulse?: ChoroplethMarkerPulse;
  /** Soft outer glow blur in px; `0` turns it off. Default: 0 */
  glow?: number;
  /** Always show the label beside the marker. Default: false */
  showLabel?: boolean;
  className?: string;
}

function shapePath(shape: ChoroplethMarkerShape, r: number) {
  switch (shape) {
    case "triangle":
      return `M0,${-r * 1.15}L${r * 1.05},${r * 0.7}L${-r * 1.05},${r * 0.7}Z`;
    case "square": {
      const s = r * 0.88;
      return `M${-s},${-s}H${s}V${s}H${-s}Z`;
    }
    case "diamond":
      return `M0,${-r * 1.2}L${r * 1.2},0L0,${r * 1.2}L${-r * 1.2},0Z`;
    case "pin": {
      // Tip sits on the coordinate; round head above it.
      const cy = -r * 1.9;
      const hx = r * 0.82;
      const hy = cy + r * 0.57;
      return `M0,0L${-hx},${hy}A${r},${r} 0 1,1 ${hx},${hy}Z`;
    }
    default:
      return `M${-r},0a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
  }
}

const PULSE_CLASS: Record<ChoroplethMarkerPulse, string> = {
  always: "animate-ping",
  hover:
    "group-hover/marker:animate-ping group-focus-visible/marker:animate-ping",
  none: "hidden",
};

/** Stable per-label offset so "always" pulses don't fire in lockstep. */
function pulseDelay(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = (h * 31 + label.charCodeAt(i)) % 997;
  }
  return `${-(h % 10) * 110}ms`;
}

export const ChoroplethMarker = memo(function ChoroplethMarker({
  coordinates,
  label,
  shape = "circle",
  size = 9,
  color = "var(--foreground)",
  stroke,
  strokeWidth = 1.5,
  pulse = "hover",
  glow = 0,
  showLabel = false,
  className,
}: ChoroplethMarkerProps) {
  const { projectPoint } = useChoroplethStable();
  const { setMarkerTooltip, setHoveredFeatureIndex, setTooltipData } =
    useChoroplethInteraction();
  const { zoom } = useChoroplethZoom();
  const camera = useChoroplethCamera();
  const glowId = `choropleth-marker-glow-${useId().replace(/:/g, "")}`;

  const [lon, lat] = coordinates;
  const point = projectPoint([lon, lat]);

  const hoverable = camera.isHoverable(`point:${label}`);
  const show = useCallback(() => {
    if (!hoverable) {
      return;
    }
    setHoveredFeatureIndex(null);
    setTooltipData(null);
    setMarkerTooltip?.({ label, coordinates: [lon, lat] });
  }, [
    hoverable,
    label,
    lat,
    lon,
    setHoveredFeatureIndex,
    setMarkerTooltip,
    setTooltipData,
  ]);

  const hide = useCallback(() => setMarkerTooltip?.(null), [setMarkerTooltip]);

  const focus = useCallback(() => {
    if (camera.enabled) {
      camera.focusPoint([lon, lat], label);
    }
  }, [camera, label, lat, lon]);

  if (!point) {
    return null;
  }

  const r = size / 2;
  const d = shapePath(shape, r);
  const isPin = shape === "pin";
  const headY = isPin ? -r * 1.9 : 0;
  const zoomScale = zoom?.transformMatrix.scaleX ?? 1;
  const interactive = camera.enabled;
  const pulseClass =
    pulse === "hover" && !hoverable ? "hidden" : PULSE_CLASS[pulse];
  // Zoomed in on something else: stay clickable, skip hover feedback.
  const hoverScale = hoverable ? "group-hover/marker:scale-115" : "";

  return (
    <g transform={`translate(${point[0]} ${point[1]})`}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: role set when clickable */}
      <g
        aria-label={interactive ? `Zoom to ${label}` : undefined}
        className={cn(
          "group/marker outline-none",
          interactive && "cursor-pointer",
          className
        )}
        onBlur={hide}
        onClick={(event) => {
          event.stopPropagation();
          if (!camera.wasDrag()) {
            focus();
          }
        }}
        onFocus={show}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            focus();
          }
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
        role={interactive ? "button" : undefined}
        style={{
          // Constant on-screen size while the camera and drag-zoom scale the map.
          transform: `scale(calc(1 / (var(${CHOROPLETH_CAMERA_SCALE_VAR}, 1) * ${zoomScale})))`,
        }}
        tabIndex={interactive ? 0 : undefined}
      >
        {/* Hit area stays still while the shape scales. */}
        <circle cy={headY * 0.6} fill="transparent" r={Math.max(r * 2, 22)} />
        <circle
          className={cn(
            "pointer-events-none origin-center [transform-box:fill-box] motion-reduce:animate-none",
            pulseClass
          )}
          cy={headY}
          fill="none"
          r={r}
          stroke={color}
          strokeWidth={1.5}
          style={
            pulse === "always"
              ? { animationDelay: pulseDelay(label) }
              : undefined
          }
        />
        {glow > 0 ? (
          <>
            <defs>
              <filter
                height="500%"
                id={glowId}
                width="500%"
                x="-200%"
                y="-200%"
              >
                <feGaussianBlur stdDeviation={glow} />
              </filter>
            </defs>
            <path
              className={cn(
                hoverable &&
                  "group-hover/marker:scale-115 group-hover/marker:opacity-100",
                "pointer-events-none opacity-55 transition-[opacity,scale] duration-150 ease-out [transform-box:fill-box] group-focus-visible/marker:opacity-100 group-focus-visible/marker:opacity-100 motion-reduce:transition-none",
                isPin ? "origin-bottom" : "origin-center"
              )}
              d={d}
              fill={color}
              filter={`url(#${glowId})`}
            />
          </>
        ) : null}
        <path
          className={cn(
            hoverScale,
            "transition-[scale] duration-150 ease-out [transform-box:fill-box] group-focus-visible/marker:stroke-foreground motion-reduce:transition-none",
            isPin ? "origin-bottom" : "origin-center"
          )}
          d={d}
          fill={color}
          paintOrder="stroke"
          // No outline unless asked for; keyboard focus still draws one.
          stroke={stroke ?? "none"}
          strokeWidth={stroke ? strokeWidth : 2}
        />
        {isPin ? (
          <circle
            className="pointer-events-none"
            cy={headY}
            fill="var(--background)"
            r={r * 0.38}
          />
        ) : null}
        {showLabel ? (
          <text
            className="pointer-events-none select-none font-medium text-[11px]"
            dy="0.35em"
            fill="var(--foreground)"
            paintOrder="stroke"
            stroke="var(--background)"
            strokeLinejoin="round"
            strokeWidth={3}
            x={r + 6}
            y={headY}
          >
            {label}
          </text>
        ) : null}
      </g>
    </g>
  );
});

ChoroplethMarker.displayName = "ChoroplethMarker";

export default ChoroplethMarker;
