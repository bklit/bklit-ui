"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
} from "react";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function useSurfacePointer({
  disabled = false,
  axis = "xy",
  onPick,
  onPickEnd,
}: {
  disabled?: boolean;
  axis?: "x" | "xy";
  onPick: (x: number, y: number) => void;
  /** Fired on pointer up after an active drag (or click) on the surface. */
  onPickEnd?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const pick = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }
      const x = clamp01((clientX - rect.left) / rect.width);
      const y =
        axis === "xy" && rect.height > 0
          ? clamp01((clientY - rect.top) / rect.height)
          : 0;
      onPick(x, y);
    },
    [axis, onPick]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pick(event.clientX, event.clientY);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    pick(event.clientX, event.clientY);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      onPickEnd?.();
    }
  };

  return { ref, onPointerDown, onPointerMove, onPointerUp };
}
