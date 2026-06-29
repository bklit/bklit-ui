"use client";

import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export const EDITOR_PANE_COLLAPSED_WIDTH = 40;
export const EDITOR_PANE_MAX_WIDTH = 360;
export const EDITOR_PANE_MIN_WIDTH = 200;
export const EDITOR_PANE_DEFAULT_WIDTH = 280;

const DRAG_THRESHOLD_PX = 4;

function clampPaneWidth(width: number) {
  return Math.round(
    Math.min(EDITOR_PANE_MAX_WIDTH, Math.max(EDITOR_PANE_MIN_WIDTH, width))
  );
}

export function EditorCollapsiblePane({
  side,
  label,
  className,
  children,
}: {
  side: "left" | "right";
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(EDITOR_PANE_DEFAULT_WIDTH);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startWidth: EDITOR_PANE_DEFAULT_WIDTH,
    dragged: false,
  });

  const paneWidth = collapsed ? EDITOR_PANE_COLLAPSED_WIDTH : width;

  const onHandlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: width,
        dragged: false,
      };

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const drag = dragRef.current;
        if (drag.pointerId !== moveEvent.pointerId) {
          return;
        }

        const delta =
          side === "left"
            ? moveEvent.clientX - drag.startX
            : drag.startX - moveEvent.clientX;

        if (Math.abs(delta) >= DRAG_THRESHOLD_PX) {
          drag.dragged = true;
          if (collapsed) {
            setCollapsed(false);
          }
          setWidth(clampPaneWidth(drag.startWidth + delta));
        }
      };

      const onPointerUp = (upEvent: globalThis.PointerEvent) => {
        const drag = dragRef.current;
        if (drag.pointerId !== upEvent.pointerId) {
          return;
        }

        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);

        if (!drag.dragged) {
          setCollapsed((value) => !value);
        }
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
    },
    [collapsed, side, width]
  );

  return (
    <aside
      className={cn(
        "group/pane relative flex h-full shrink-0 flex-col overflow-hidden border-border bg-card",
        side === "left" ? "border-r" : "border-l",
        className
      )}
      style={{ width: paneWidth }}
    >
      {collapsed ? (
        <div
          aria-hidden
          className="flex min-h-0 flex-1 items-center justify-center"
        >
          <span
            className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider [writing-mode:vertical-lr]"
            style={{
              transform: side === "right" ? "rotate(180deg)" : undefined,
            }}
          >
            {label}
          </span>
        </div>
      ) : (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </div>
      )}

      <button
        aria-expanded={!collapsed}
        aria-label={
          collapsed ? `Expand ${label} panel` : `Collapse ${label} panel`
        }
        className={cn(
          "absolute top-0 z-30 h-full w-2 touch-none select-none border-0 bg-transparent p-0 hover:bg-foreground/[0.04]",
          side === "left"
            ? "right-0 translate-x-1/2 cursor-col-resize"
            : "left-0 -translate-x-1/2 cursor-col-resize"
        )}
        onPointerDown={onHandlePointerDown}
        type="button"
      />
    </aside>
  );
}
