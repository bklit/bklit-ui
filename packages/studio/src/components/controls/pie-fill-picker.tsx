"use client";

import { PatternLines } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";

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
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border px-2.5 transition-colors",
            value === opt.id
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
          key={opt.id}
          onClick={() => onChange(opt.id)}
          type="button"
        >
          <span className="size-5 shrink-0 overflow-hidden rounded ring-1 ring-border">
            {opt.swatch}
          </span>
          <span className="text-xs">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
