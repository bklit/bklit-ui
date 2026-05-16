"use client";

import { CURVE_OPTIONS, type CurveId } from "@/lib/studio/curves";
import { cn } from "@/lib/utils";
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
            "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors",
            value === opt.value
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
