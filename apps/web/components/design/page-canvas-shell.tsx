"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { DecorativeRuler } from "@/components/design/decorative-ruler";
import { cn } from "@/lib/utils";

export const canvasFadeClass =
  "[mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_82%,transparent_100%)]";

export function PageCanvasShell({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }

    let frameId: number | undefined;
    // Start below zero so the first measurement always syncs state (useState(0)).
    let lastHeight = -1;

    const update = () => {
      frameId = undefined;
      const nextHeight = element.offsetHeight;
      if (nextHeight !== lastHeight) {
        lastHeight = nextHeight;
        setHeight(nextHeight);
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== undefined) {
        return;
      }
      frameId = window.requestAnimationFrame(update);
    };

    update();
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div className="relative w-full" ref={contentRef}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 hidden md:block"
        style={{ viewTransitionName: "page-canvas-rulers" }}
      >
        <DecorativeRuler
          className={cn("absolute top-0 left-0 h-full", canvasFadeClass)}
          length={height}
        />
      </div>
      <div className="relative z-1 px-4 sm:px-0">{children}</div>
    </div>
  );
}
