"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type EditorCamera,
  pickWorldTickInterval,
} from "@/editor/editor-camera";
import { cn } from "@/lib/utils";

function getWorldRange(length: number, view: EditorCamera, axis: "x" | "y") {
  const pan = axis === "x" ? view.x : view.y;
  const start = Math.floor((0 - pan) / view.zoom);
  const end = Math.ceil((length - pan) / view.zoom);
  return { start, end };
}

function CanvasRulerContent({
  length,
  orientation,
  view,
}: {
  length: number;
  orientation: "horizontal" | "vertical";
  view: EditorCamera;
}) {
  const axis = orientation === "horizontal" ? "x" : "y";
  const pan = axis === "x" ? view.x : view.y;
  const interval = pickWorldTickInterval(view.zoom);
  const { end } = getWorldRange(length, view, axis);
  const firstTick =
    Math.floor(getWorldRange(length, view, axis).start / interval) * interval;
  const isHorizontal = orientation === "horizontal";

  const ticks = useMemo(() => {
    const items: number[] = [];
    for (let value = firstTick; value <= end; value += interval) {
      items.push(value);
    }
    return items;
  }, [end, firstTick, interval]);

  return (
    <>
      {ticks.map((value) => {
        const screen = value * view.zoom + pan;
        if (screen < -2 || screen > length + 2) {
          return null;
        }

        const isMajor = value % (interval * 2) === 0 || interval >= 100;

        return (
          <RulerTickMark
            isHorizontal={isHorizontal}
            isMajor={isMajor}
            key={`${orientation}-${value}`}
            screen={screen}
            value={value}
          />
        );
      })}
    </>
  );
}

function RulerTickMark({
  isHorizontal,
  isMajor,
  screen,
  value,
}: {
  isHorizontal: boolean;
  isMajor: boolean;
  screen: number;
  value: number;
}) {
  return (
    <div>
      <div
        className={cn(
          "absolute bg-foreground/25",
          isMajor && "bg-foreground/40"
        )}
        style={
          isHorizontal
            ? {
                left: screen,
                bottom: 0,
                width: 1,
                height: isMajor ? 10 : 6,
              }
            : {
                top: screen,
                right: 0,
                height: 1,
                width: isMajor ? 10 : 6,
              }
        }
      />
      {isMajor ? (
        <span
          className={cn(
            "absolute font-mono text-[9px] text-foreground/45 tabular-nums",
            isHorizontal ? "top-0.5" : "left-2"
          )}
          style={
            isHorizontal
              ? { left: screen + 2 }
              : {
                  top: screen + 4,
                  writingMode: "vertical-lr",
                }
          }
        >
          {value}
        </span>
      ) : null}
    </div>
  );
}

function StaticRulerContent({
  length,
  orientation,
}: {
  length: number;
  orientation: "horizontal" | "vertical";
}) {
  const tickInterval = 20;
  const labelInterval = 100;
  const ticks = Math.ceil(length / tickInterval);
  const isHorizontal = orientation === "horizontal";

  return (
    <>
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const position = index * tickInterval;
        const isMajor = position % labelInterval === 0;

        return (
          <div key={`${orientation}-${position}`}>
            <div
              className={cn(
                "absolute bg-foreground/25",
                isMajor && "bg-foreground/40"
              )}
              style={
                isHorizontal
                  ? {
                      left: position,
                      bottom: 0,
                      width: 1,
                      height: isMajor ? 10 : 6,
                    }
                  : {
                      top: position,
                      right: 0,
                      height: 1,
                      width: isMajor ? 10 : 6,
                    }
              }
            />
            {isMajor ? (
              <span
                className={cn(
                  "absolute font-mono text-[9px] text-foreground/45 tabular-nums",
                  isHorizontal ? "top-0.5" : "left-2"
                )}
                style={
                  isHorizontal
                    ? { left: position + 2 }
                    : {
                        top: position + 4,
                        writingMode: "vertical-lr",
                      }
                }
              >
                {position}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function EditorRuler({
  orientation,
  className,
  canvasView,
}: {
  orientation: "horizontal" | "vertical";
  className?: string;
  canvasView?: EditorCamera;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const update = () => {
      setLength(
        orientation === "horizontal"
          ? element.clientWidth
          : element.clientHeight
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [orientation]);

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "relative shrink-0 bg-muted/30",
        isHorizontal
          ? "h-6 overflow-hidden border-border border-b"
          : "w-8 overflow-hidden border-border border-r",
        className
      )}
      ref={ref}
    >
      {canvasView ? (
        <CanvasRulerContent
          length={length}
          orientation={orientation}
          view={canvasView}
        />
      ) : (
        <StaticRulerContent length={length} orientation={orientation} />
      )}
    </div>
  );
}

export function EditorRulerCorner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-8 shrink-0 border-border border-r border-b bg-muted/40",
        className
      )}
    />
  );
}
