"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import type { toggleVariants } from "@/ui/toggle";
import { ToggleGroup } from "@/ui/toggle-group";

type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
type ToggleSize = VariantProps<typeof toggleVariants>["size"];

export function StudioSingleToggleGroup<T extends string>({
  value,
  onValueChange,
  className,
  spacing = 2,
  variant = "studio",
  size,
  children,
}: {
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  spacing?: number;
  variant?: ToggleVariant;
  size?: ToggleSize;
  children: ReactNode;
}) {
  return (
    <ToggleGroup
      className={cn("w-full", className)}
      onValueChange={(values) => {
        const next = values.at(-1) ?? values[0];
        if (next != null) {
          onValueChange(next as T);
        }
      }}
      size={size}
      spacing={spacing}
      value={[value]}
      variant={variant}
    >
      {children}
    </ToggleGroup>
  );
}
