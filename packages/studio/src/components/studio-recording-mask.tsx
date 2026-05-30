"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

/** Highlights the chart frame during recording (full-canvas dim is handled separately). */
export function StudioRecordingMask({
  containerRef,
  targetRef,
  active,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  targetRef: React.RefObject<HTMLElement | null>;
  active: boolean;
}) {
  const [hole, setHole] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      setHole(null);
      return;
    }

    const update = () => {
      const container = containerRef.current;
      const target = targetRef.current;
      if (!container) {
        return;
      }
      if (!target) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setHole({
        top: targetRect.top - containerRect.top,
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [active, containerRef, targetRef]);

  if (!active) {
    return null;
  }
  if (!hole) {
    return null;
  }

  const { top, left, width, height } = hole;

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      aria-hidden
      className="pointer-events-none absolute z-[6] ring-2 ring-white/20"
      initial={{ opacity: 0.5, scale: 0.99 }}
      style={{ top, left, width, height }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
