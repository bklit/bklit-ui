"use client";

import { PatternLines } from "@bklitui/ui/charts";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";

export type PieFillMode = "solid" | "lines";

function SolidSwatch() {
  return <span className="block size-full rounded-sm bg-[var(--chart-1)]" />;
}

function LinesSwatch() {
  const id = "pie-fill-lines-swatch";
  return (
    <svg
      aria-hidden={true}
      className="size-full rounded-sm"
      viewBox="0 0 24 24"
    >
      <defs>
        <PatternLines
          height={6}
          id={id}
          orientation={["diagonal"]}
          stroke="var(--chart-1)"
          strokeWidth={1}
          width={6}
        />
      </defs>
      <rect fill={`url(#${id})`} height={24} width={24} />
    </svg>
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
