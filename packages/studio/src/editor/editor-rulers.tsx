"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TICK_INTERVAL = 20;
const LABEL_INTERVAL = 100;

const rulerTickClass = "absolute bg-foreground/25";
const rulerMajorTickClass = "absolute bg-foreground/40";

function RulerTicks({
  length,
  orientation,
}: {
  length: number;
  orientation: "horizontal" | "vertical";
}) {
  const ticks = Math.ceil(length / TICK_INTERVAL);
  const isHorizontal = orientation === "horizontal";

  return (
    <>
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const position = index * TICK_INTERVAL;
        const isMajor = position % LABEL_INTERVAL === 0;

        return (
          <div
            className={isMajor ? rulerMajorTickClass : rulerTickClass}
            key={`${orientation}-${position}`}
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
        );
      })}
    </>
  );
}

function RulerLabels({
  length,
  orientation,
}: {
  length: number;
  orientation: "horizontal" | "vertical";
}) {
  const labels = Math.ceil(length / LABEL_INTERVAL);
  const isHorizontal = orientation === "horizontal";

  return (
    <>
      {Array.from({ length: labels + 1 }, (_, index) => {
        const position = index * LABEL_INTERVAL;

        if (isHorizontal) {
          return (
            <span
              className="absolute top-0.5 font-mono text-[9px] text-foreground/45 tabular-nums"
              key={`${orientation}-label-${position}`}
              style={{ left: position + 2 }}
            >
              {position}
            </span>
          );
        }

        return (
          <span
            className="absolute left-2 font-mono text-[9px] text-foreground/45 tabular-nums"
            key={`${orientation}-label-${position}`}
            style={{
              top: position + 4,
              writingMode: "vertical-lr",
            }}
          >
            {position}
          </span>
        );
      })}
    </>
  );
}

export function EditorRuler({
  orientation,
  className,
}: {
  orientation: "horizontal" | "vertical";
  className?: string;
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
      <RulerTicks length={length} orientation={orientation} />
      <RulerLabels length={length} orientation={orientation} />
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
