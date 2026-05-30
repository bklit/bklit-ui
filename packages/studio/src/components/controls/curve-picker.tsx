"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { CURVE_OPTIONS, type CurveId } from "@/lib/curves";
import { CurvePreviewIcon } from "../curve-preview-icons";

export function CurvePicker({
  value,
  onChange,
}: {
  value: CurveId;
  onChange: (v: CurveId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {CURVE_OPTIONS.map((opt) => (
        <button
          aria-label={opt.label}
          className={cn(
            "flex flex-col items-center gap-1 rounded-md border px-1 py-2 transition-colors",
            value === opt.value
              ? "border-accent bg-background/80 text-foreground shadow-sm"
              : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-background/50 hover:text-foreground"
          )}
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          type="button"
        >
          <CurvePreviewIcon className="text-current" curveId={opt.value} />
          <span className="text-center text-[10px] leading-tight">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
