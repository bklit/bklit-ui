"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import {
  StudioTab,
  StudioTabs,
} from "@/components/controls/studio-toggle-group";

export function IconToggleGroup<T extends string>({
  value,
  onValueChange,
  children,
}: {
  value: T;
  onValueChange: (value: T) => void;
  children: ReactNode;
}) {
  return (
    <StudioTabs layout="icons" onValueChange={onValueChange} value={value}>
      {children}
    </StudioTabs>
  );
}

export function IconToggleButton({
  value,
  label,
  icon,
  children,
}: {
  value: string;
  label: string;
  icon?: IconSvgElement;
  children?: ReactNode;
}) {
  return (
    <StudioTab aria-label={label} title={label} value={value}>
      {children ??
        (icon ? (
          <HugeiconsIcon className="size-5" icon={icon} strokeWidth={1.75} />
        ) : null)}
    </StudioTab>
  );
}
