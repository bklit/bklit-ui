"use client";

import { ChartBrush, useChoroplethZoom } from "@bklitui/ui/charts";
import { type ComponentProps, useEffect } from "react";
import {
  chartSvg,
  type InteractionScript,
  type InteractionStep,
  plotArea,
} from "../bench/interactions";
import { useLabProbe, useProbedCallback } from "../bench/probe";

/**
 * Interaction scripts + callback spies shared by the brush (line / area) and
 * zoom (choropleth) variants. Coordinates are layout-only (the strip svg
 * inset by its margins, fractions of the map svg), so the same script drives
 * the visx implementation today and the d3 rewrite later.
 */

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * `ChartBrush` with its `onSelectionChange` also emitted on the `selection`
 * probe channel (`{ start, end }` as ISO strings, or `null`). Stable wrapper:
 * adds no renders.
 */
export function ProbedChartBrush({
  onSelectionChange,
  ...props
}: ComponentProps<typeof ChartBrush>) {
  const probed = useProbedCallback("selection", onSelectionChange);
  return <ChartBrush {...props} onSelectionChange={probed} />;
}

/**
 * The brush strip script. The strip opens fully selected (the layout seeds
 * the whole extent), so the handles are exercised first, then the move, then
 * drag-to-create on the dimmed track, clicks without drag (inside: no-op,
 * outside: clear → layout falls back to the full extent), and a frame resize
 * (the brush is keyed on the plot width: remounts from the selection).
 */
export function brushScript(stripMargin: Margin): InteractionScript {
  const strip = plotArea(-1, stripMargin);
  const at = (fx: number, dx = 0) => ({ target: strip, fx, fy: 0.5, dx });
  return [
    {
      id: "resize-left",
      label: "Resize from the left handle (0 → 30%)",
      kind: "drag",
      from: at(0, 2),
      to: at(0.3),
    },
    {
      id: "resize-right",
      label: "Resize from the right handle (100 → 70%)",
      kind: "drag",
      from: at(1, -2),
      to: at(0.7),
    },
    {
      id: "move",
      label: "Move the selection (+10%)",
      kind: "drag",
      from: at(0.5),
      to: at(0.6),
    },
    {
      id: "create",
      label: "Drag to create on the track (8 → 30%)",
      kind: "drag",
      from: at(0.08),
      to: at(0.3),
    },
    {
      id: "click-inside",
      label: "Click without drag inside the selection",
      kind: "click",
      at: at(0.2),
    },
    {
      id: "click-outside",
      label: "Click without drag on the track (clears)",
      kind: "click",
      at: at(0.7),
    },
    {
      id: "create-again",
      label: "Drag to create (20 → 60%)",
      kind: "drag",
      from: at(0.2),
      to: at(0.6),
      moves: 12,
    },
    {
      id: "frame-narrow",
      label: "Resize the frame to 480 px (brush remounts)",
      kind: "resize",
      width: 480,
    },
    {
      id: "frame-restore",
      label: "Restore the frame width",
      kind: "resize",
    },
  ];
}

/**
 * Emits the zoom transform on the `zoom` probe channel whenever it changes
 * (initial transform included). Renders nothing: a non-SVG child, so the
 * chart puts it in the HTML overlay layer.
 */
export function ZoomProbe() {
  const { zoom } = useChoroplethZoom();
  const emit = useLabProbe();
  const matrix = zoom?.transformMatrix;
  useEffect(() => {
    if (matrix) {
      emit("zoom", matrix);
    }
  }, [emit, matrix]);
  return null;
}

/** Accessible names the lab gives the docs' icon-only zoom buttons. */
export const ZOOM_IN = "Zoom in";
export const ZOOM_OUT = "Zoom out";

/**
 * Choropleth zoom: wheel in ×3 / out ×2 at a point off-centre, drag-pan,
 * trackpad pinch in / out, then the +/- buttons when the variant has them.
 * There is no reset control in the chart or the demos.
 */
export function zoomScript({
  buttons,
}: {
  buttons: boolean;
}): InteractionScript {
  const map = chartSvg(0);
  const point = { target: map, fx: 0.55, fy: 0.4 };
  const wheel = (
    id: string,
    label: string,
    deltaY: number
  ): InteractionStep => ({
    id,
    label,
    kind: "wheel",
    at: point,
    deltaY,
  });
  return [
    wheel("wheel-in-1", "Wheel in #1", -100),
    wheel("wheel-in-2", "Wheel in #2", -100),
    wheel("wheel-in-3", "Wheel in #3", -100),
    wheel("wheel-out-1", "Wheel out #1", 100),
    wheel("wheel-out-2", "Wheel out #2", 100),
    {
      id: "pan",
      label: "Drag to pan (−15%, +20%)",
      kind: "drag",
      from: { target: map, fx: 0.5, fy: 0.5 },
      to: { target: map, fx: 0.35, fy: 0.7 },
    },
    {
      id: "pinch-in",
      label: "Trackpad pinch in (ctrl + wheel)",
      kind: "pinch",
      at: point,
      direction: "in",
    },
    {
      id: "pinch-out",
      label: "Trackpad pinch out (ctrl + wheel)",
      kind: "pinch",
      at: point,
      direction: "out",
    },
    ...(buttons
      ? ([
          {
            id: "button-in",
            label: "Zoom in button",
            kind: "button",
            name: ZOOM_IN,
          },
          {
            id: "button-in-2",
            label: "Zoom in button again",
            kind: "button",
            name: ZOOM_IN,
          },
          {
            id: "button-out",
            label: "Zoom out button",
            kind: "button",
            name: ZOOM_OUT,
          },
        ] satisfies InteractionStep[])
      : []),
  ];
}
