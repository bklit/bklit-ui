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
      <DecorativeRuler
        className={cn(
          "absolute top-0 left-0 z-10 hidden h-full md:block",
          canvasFadeClass
        )}
        length={height}
      />
      <div className="relative z-1 px-4 sm:px-0">{children}</div>
    </div>
  );
}
