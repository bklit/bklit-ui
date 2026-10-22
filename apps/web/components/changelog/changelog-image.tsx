import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Changelog cover art. The SVG is used as a mask over the foreground colour,
 * so one single-colour file (black strokes, opacity for depth) reads
 * correctly in light and dark themes. Art is drawn on a 1600×900 canvas.
 */
export function ChangelogImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const mask = `url("${src}")`;
  const style: CSSProperties = {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  return (
    <span
      className={cn(
        "not-prose block overflow-hidden rounded-xl border border-border/64 bg-muted/48 dark:bg-card",
        className
      )}
    >
      <span
        aria-label={alt}
        className="block aspect-[16/9] w-full bg-foreground/80"
        role="img"
        style={style}
      />
    </span>
  );
}
