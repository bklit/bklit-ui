"use client";

import { PatternSwatch } from "@/components/controls/pattern-picker";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { studioPieSlicePattern } from "@/lib/patterns";

export type PieFillMode = "solid" | "lines";

function SolidSwatch() {
  return <span className="block size-full rounded-sm bg-[var(--chart-1)]" />;
}

function LinesSwatch() {
  return (
    <span className="block size-full text-[var(--chart-1)]">
      <PatternSwatch preset={studioPieSlicePattern(0)} />
    </span>
  );
}

export function PieFillPicker({
  value,
  onChange,
}: {
  value: PieFillMode;
  onChange: (v: PieFillMode) => void;
}) {
  const options: { id: PieFillMode; label: string; swatch: React.ReactNode }[] =
    [
      { id: "solid", label: "Solid", swatch: <SolidSwatch /> },
      { id: "lines", label: "Lines", swatch: <LinesSwatch /> },
    ];

  return (
    <StudioToggleGroup layout="swatch" onValueChange={onChange} value={value}>
      {options.map((opt) => (
        <StudioToggleGroupItem key={opt.id} value={opt.id}>
          <span className="size-5 shrink-0 overflow-hidden rounded">
            {opt.swatch}
          </span>
          {opt.label}
        </StudioToggleGroupItem>
      ))}
    </StudioToggleGroup>
  );
}
