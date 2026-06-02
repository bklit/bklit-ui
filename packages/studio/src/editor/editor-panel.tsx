import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const editorPanelVariants = cva(
  "flex min-h-0 flex-col overflow-hidden border-border bg-card",
  {
    variants: {
      side: {
        left: "border-r",
        right: "border-l",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

export function EditorPanel({
  className,
  side,
  children,
}: {
  className?: string;
  side?: VariantProps<typeof editorPanelVariants>["side"];
  children: ReactNode;
}) {
  return (
    <div className={cn(editorPanelVariants({ side }), className)}>
      {children}
    </div>
  );
}

export function EditorPanelHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 border-border border-b px-3 py-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function EditorPanelContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "studio-sidebar-scroll min-h-0 flex-1 overflow-auto p-3",
        className
      )}
    >
      {children}
    </div>
  );
}
