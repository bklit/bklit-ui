import { cn } from "@/lib/utils";

export function DotGridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        "bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_0)]",
        "bg-size-[20px_20px]",
        className
      )}
    />
  );
}
