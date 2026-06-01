"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { StudioSingleToggleGroup } from "@/components/controls/studio-toggle-group";
import { ToggleGroupItem } from "@/ui/toggle-group";

export function IconToggleGroup<T extends string>({
  value,
  onValueChange,
  className,
  children,
}: {
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <StudioSingleToggleGroup
      className={className}
      onValueChange={onValueChange}
      size="icon"
      value={value}
      variant="studio"
    >
      {children}
    </StudioSingleToggleGroup>
  );
}

export function IconToggleButton({
  value,
  label,
  icon,
  children,
  className,
}: {
  value: string;
  label: string;
  icon?: IconSvgElement;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ToggleGroupItem
      aria-label={label}
      className={className}
      title={label}
      value={value}
    >
      {children ??
        (icon ? (
          <HugeiconsIcon className="size-5" icon={icon} strokeWidth={1.75} />
        ) : null)}
    </ToggleGroupItem>
  );
}
