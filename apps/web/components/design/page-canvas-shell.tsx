"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { DecorativeRuler } from "@/components/design/decorative-ruler";
import { cn } from "@/lib/utils";

export const canvasFadeClass =
  "[mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_82%,transparent_100%)]";

function CanvasTopRulers() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-16 hidden h-0 md:block"
      data-grid-rulers
    >
      <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
      <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />
    </div>
  );
}

export function PageCanvasShell({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      setHeight(element.offsetHeight);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
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
        <CanvasTopRulers />
      </div>
      <div className="relative z-1 px-4 sm:px-0">{children}</div>
    </div>
  );
}
