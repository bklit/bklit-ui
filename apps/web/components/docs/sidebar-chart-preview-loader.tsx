import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/** Loading state for the docs sidebar preview card: a centred spinner. */
export function SidebarChartPreviewLoader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("flex size-full items-center justify-center", className)}
    >
      <Spinner className="size-4 text-muted-foreground" />
    </div>
  );
}
