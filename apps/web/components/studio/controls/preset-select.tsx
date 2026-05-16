"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  COLOR_PRESETS,
  type ColorPresetId,
  presetSwatchColor,
} from "@/lib/studio/color-presets";

function PresetSwatch({ id }: { id: ColorPresetId }) {
  return (
    <span
      className="size-3 shrink-0 rounded-full ring-1 ring-border"
      style={{ background: presetSwatchColor(id) }}
    />
  );
}

export function PresetSelect({
  value,
  onChange,
}: {
  value: ColorPresetId;
  onChange: (id: ColorPresetId) => void;
}) {
  return (
    <Select onValueChange={(v) => onChange(v as ColorPresetId)} value={value}>
      <SelectTrigger
        aria-label="Color preset"
        className="h-10 min-w-[9rem] gap-2 px-2.5 text-sm"
      >
        <PresetSwatch id={value} />
        <span className="truncate">
          {COLOR_PRESETS.find((p) => p.id === value)?.label ?? "Colors"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {COLOR_PRESETS.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="flex items-center gap-2">
              <PresetSwatch id={p.id} />
              {p.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
