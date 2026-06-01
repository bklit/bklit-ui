"use client";

import { PatternLines } from "@bklitui/ui/charts";
import {
  StudioSingleToggleGroup,
  ToggleGroupItem,
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
    <StudioSingleToggleGroup
      className="grid w-full grid-cols-2 gap-2"
      onValueChange={onChange}
      size="default"
      spacing={2}
      value={value}
      variant="studio"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          className="h-9 min-h-9 flex-row justify-start gap-2 px-2.5 font-normal text-xs"
          key={opt.id}
          value={opt.id}
        >
          <span className="size-5 shrink-0 overflow-hidden rounded ring-1 ring-border">
            {opt.swatch}
          </span>
          {opt.label}
        </ToggleGroupItem>
      ))}
    </StudioSingleToggleGroup>
  );
}
