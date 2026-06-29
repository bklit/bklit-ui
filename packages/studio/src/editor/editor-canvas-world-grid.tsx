"use client";

/** Infinite dot grid in world space — scales with canvas zoom (react-flow style). */
export function EditorCanvasWorldGrid() {
  const dot = 1;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-0 bg-muted/30 bg-size-[var(--studio-canvas-grid-gap)_var(--studio-canvas-grid-gap)] dark:bg-background"
      style={{
        top: -100_000,
        left: -100_000,
        width: 200_000,
        height: 200_000,
        backgroundImage: `radial-gradient(circle, color-mix(in oklch, var(--foreground) 12%, transparent) ${dot}px, transparent 0)`,
        backgroundPosition: "0 0",
      }}
    />
  );
}
