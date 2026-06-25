import { cn } from "@/lib/utils";

export function ChartMountPlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "size-full min-h-[120px] animate-pulse rounded-md bg-muted/30",
        className
      )}
    />
  );
}
