import { cn } from "@bklitui/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const studioPanelVariants = cva("flex min-h-0 flex-col overflow-hidden", {
  variants: {
    variant: {
      default:
        "rounded-lg bg-card text-card-foreground ring-1 ring-foreground/10",
      ghost:
        "overflow-x-visible bg-transparent text-foreground shadow-none ring-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function StudioPanel({
  className,
  variant,
  children,
}: {
  className?: string;
  variant?: VariantProps<typeof studioPanelVariants>["variant"];
  children: ReactNode;
}) {
  return (
    <div className={cn(studioPanelVariants({ variant }), className)}>
      {children}
    </div>
  );
}
