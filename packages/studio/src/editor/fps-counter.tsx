"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

function fpsTone(fps: number) {
  if (fps >= 55) {
    return "text-emerald-500";
  }
  if (fps >= 30) {
    return "text-amber-500";
  }
  return "text-red-500";
}

export function FpsCounter({ className }: { className?: string }) {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (delta > 0) {
        const samples = frameTimesRef.current;
        samples.push(1000 / delta);
        if (samples.length > 30) {
          samples.shift();
        }
        const average =
          samples.reduce((sum, value) => sum + value, 0) / samples.length;
        setFps(Math.round(average));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "rounded-md border border-border/60 bg-background/90 px-2 py-1 font-mono text-xs tabular-nums backdrop-blur-sm",
        className
      )}
    >
      <span className="text-muted-foreground">FPS </span>
      <span className={fpsTone(fps)}>{fps}</span>
    </div>
  );
}
