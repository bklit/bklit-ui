"use client";

import { Icon, type IconName } from "@bklitui/icons";
import type { ReactNode } from "react";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
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
    <StudioToggleGroup
      layout="icons"
      onValueChange={onValueChange}
      value={value}
    >
      {children}
    </StudioToggleGroup>
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
  icon?: IconName;
  children?: ReactNode;
}) {
  return (
    <StudioToggleGroupItem aria-label={label} title={label} value={value}>
      {children ?? (icon ? <Icon className="size-5" name={icon} /> : null)}
    </StudioToggleGroupItem>
  );
}
