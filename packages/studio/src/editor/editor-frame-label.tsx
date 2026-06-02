"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export function EditorFrameLabel({
  title,
  originX,
  originY,
  canvasScaleRef,
  onPositionChange,
}: {
  title: string;
  originX: number;
  originY: number;
  canvasScaleRef: RefObject<number>;
  onPositionChange: (x: number, y: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX,
        originY,
      };
      setDragging(true);

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const session = dragRef.current;
        if (!session || session.pointerId !== moveEvent.pointerId) {
          return;
        }

        const zoom = Math.max(canvasScaleRef.current ?? 1, 0.01);
        const nextX =
          session.originX + (moveEvent.clientX - session.startX) / zoom;
        const nextY =
          session.originY + (moveEvent.clientY - session.startY) / zoom;
        onPositionChange(nextX, nextY);
      };

      const onPointerUp = (upEvent: globalThis.PointerEvent) => {
        const session = dragRef.current;
        if (!session || session.pointerId !== upEvent.pointerId) {
          return;
        }

        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        dragRef.current = null;
        setDragging(false);
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
    },
    [canvasScaleRef, onPositionChange, originX, originY]
  );

  return (
    <div
      className={cn(
        "mb-1.5 w-max max-w-full touch-none select-none font-medium text-foreground text-xs",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onPointerDown={onPointerDown}
    >
      {title}
    </div>
  );
}
