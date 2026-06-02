"use client";

import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioTab } from "@/components/controls/studio-toggle-group";

function FunnelStraightIcon() {
  return (
    <svg aria-hidden={true} className="size-5" viewBox="0 0 20 20">
      <path className="fill-current opacity-30" d="M4 4h12L10 9H6L4 4Z" />
      <path className="fill-current opacity-50" d="M6 9h8L9 14H7L6 9Z" />
      <path className="fill-current" d="M7 14h6L8 17H7L7 14Z" />
    </svg>
  );
}

function FunnelCurvedIcon() {
  return (
    <svg aria-hidden={true} className="size-5" viewBox="0 0 20 20">
      <path className="fill-current opacity-30" d="M4 4h12q-1 2.5-2 5H6L4 4Z" />
      <path className="fill-current opacity-50" d="M6 9h8q-0.5 2-1 5H7L6 9Z" />
      <path className="fill-current" d="M7 14h6q-0.25 1.5-0.5 3H7.5L7 14Z" />
    </svg>
  );
}

export function FunnelEdgesPicker({
  value,
  onChange,
}: {
  value: "curved" | "straight";
  onChange: (v: "curved" | "straight") => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      <StudioTab aria-label="Curved edges" title="Curved edges" value="curved">
        <FunnelCurvedIcon />
      </StudioTab>
      <StudioTab
        aria-label="Straight edges"
        title="Straight edges"
        value="straight"
      >
        <FunnelStraightIcon />
      </StudioTab>
    </IconToggleGroup>
  );
}
