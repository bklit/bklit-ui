"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useState } from "react";
import type { Color } from "react-aria-components";
import { ColorPicker as AriaColorPicker } from "react-aria-components";
import { studioInputSurfaceClass } from "@/components/controls/control-field-helpers";
import { isValidOklchColor, parseColorMix } from "@/lib/chart-theme-color";
import {
  pickerColorToStudioColor,
  studioColorToOklchField,
  studioColorToPickerColor,
} from "@/lib/studio-color-picker-value";
import { ColorArea } from "@/ui/color-picker/color-area";
import { ColorSlider } from "@/ui/color-picker/color-slider";

const OKLCH_PREFIX_RE = /^oklch\(/i;
const OKLCH_COMPONENTS_BODY_RE = /^[\d.]+\s+[\d.]+\s+[\d.]+/;

function commitOklchDraft(
  raw: string,
  pickerColor: Color,
  onChange: (value: string) => void
) {
  const body = raw.trim();
  if (!body) {
    onChange("");
    return;
  }
  if (OKLCH_PREFIX_RE.test(body)) {
    if (isValidOklchColor(body)) {
      onChange(body);
    }
    return;
  }
  if (parseColorMix(body)) {
    onChange(body);
    return;
  }
  if (!OKLCH_COMPONENTS_BODY_RE.test(body)) {
    return;
  }
  const alpha = pickerColor.getChannelValue("alpha");
  onChange(alpha >= 0.999 ? `oklch(${body})` : `oklch(${body} / ${alpha})`);
}

export function StudioColorPicker({
  color,
  disabled = false,
  onChange,
}: {
  color: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(() => studioColorToOklchField(color));
  const [pickerColor, setPickerColor] = useState(() =>
    studioColorToPickerColor(color)
  );

  useEffect(() => {
    setDraft(studioColorToOklchField(color));
    setPickerColor(studioColorToPickerColor(color));
  }, [color]);

  const commitPickerColor = (next: Color) => {
    setPickerColor(next);
    const studioColor = pickerColorToStudioColor(next);
    onChange(studioColor);
    setDraft(studioColorToOklchField(studioColor));
  };

  const commitDraft = (raw: string) => {
    commitOklchDraft(raw, pickerColor, onChange);
  };

  const opacity = Math.round(pickerColor.getChannelValue("alpha") * 100);

  return (
    <AriaColorPicker
      onChange={(next) => commitPickerColor(next)}
      value={pickerColor}
    >
      <div className="flex flex-col gap-3">
        <ColorArea
          colorSpace="hsb"
          isDisabled={disabled}
          xChannel="saturation"
          yChannel="brightness"
        />

        <div className="flex flex-col gap-2">
          <ColorSlider channel="hue" colorSpace="hsb" isDisabled={disabled} />
          <ColorSlider channel="alpha" isDisabled={disabled} />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="shrink-0 px-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
            oklch
          </span>
          <input
            className={cn(
              "h-8 min-w-0 flex-1 rounded-md px-2 font-mono text-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              studioInputSurfaceClass
            )}
            disabled={disabled}
            onBlur={() => commitDraft(draft)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitDraft(draft);
              }
            }}
            placeholder="0.865 0.127 207"
            value={draft}
          />
          <input
            aria-label="Fill opacity percent"
            className={cn(
              "h-8 w-14 rounded-md px-2 text-center font-mono text-muted-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              studioInputSurfaceClass
            )}
            disabled={disabled}
            max={100}
            min={0}
            onBlur={() => {
              const next = pickerColor.withChannelValue("alpha", opacity / 100);
              commitPickerColor(next);
            }}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value, 10);
              if (Number.isFinite(next)) {
                const clamped = Math.min(100, Math.max(0, next));
                setPickerColor(
                  pickerColor.withChannelValue("alpha", clamped / 100)
                );
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const next = pickerColor.withChannelValue(
                  "alpha",
                  opacity / 100
                );
                commitPickerColor(next);
              }
            }}
            value={opacity}
          />
        </div>
      </div>
    </AriaColorPicker>
  );
}
