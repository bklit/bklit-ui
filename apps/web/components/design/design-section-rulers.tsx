import { cn } from "@/lib/utils";

const hatchCornerClass =
  "bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80";

export function DesignSectionRulers({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      data-grid-rulers
    >
      <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
      <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />

      <div className="absolute -bottom-8 left-0 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute bottom-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
      <div className="absolute right-0 -bottom-8 block h-10 w-px bg-muted-foreground/40" />
      <div className="absolute -right-8 bottom-0 block h-px w-10 bg-muted-foreground/40" />

      <div
        className={cn(
          "absolute -top-8 -right-8 block h-6 w-6",
          hatchCornerClass
        )}
      />
      <div
        className={cn(
          "absolute -bottom-8 -left-8 block h-6 w-6",
          hatchCornerClass
        )}
      />
    </div>
  );
}
