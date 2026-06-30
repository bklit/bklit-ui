"use client";

import { memo, type ReactNode } from "react";
import type { ArcDatum, Focus } from "./sunburst";
import { useSunburstHover, useSunburstStable } from "./sunburst-context";

export interface SunburstHintContext {
  hintText: string;
  hoveredArc: ArcDatum | null;
  focus: Focus;
}

export interface SunburstHintProps {
  className?: string;
  children?: ReactNode | ((context: SunburstHintContext) => ReactNode);
}

export const SunburstHint = memo(function SunburstHint({
  className,
  children,
}: SunburstHintProps) {
  const { focus } = useSunburstStable();
  const { hoveredArc } = useSunburstHover();

  const hintText = (() => {
    if (hoveredArc) {
      return hoveredArc.trail.join("  ›  ");
    }
    if (focus.depth === 0) {
      return "Click a segment to zoom in · hover to inspect";
    }
    return "Click the center to zoom out";
  })();

  const context: SunburstHintContext = { hintText, hoveredArc, focus };

  let content: ReactNode;
  if (typeof children === "function") {
    content = children(context);
  } else if (children == null) {
    content = hintText;
  } else {
    content = children;
  }

  return (
    <div
      aria-live="polite"
      className={
        className ?? "mt-3 min-h-5 text-center text-muted-foreground text-sm"
      }
      style={{ minHeight: 20 }}
    >
      {content}
    </div>
  );
});

SunburstHint.displayName = "SunburstHint";
