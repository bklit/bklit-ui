"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useState } from "react";
import type { Color } from "react-aria-components";
import { ColorPicker as AriaColorPicker } from "react-aria-components";
import {
  applyOpacityToColor,
  isValidOklchColor,
  normalizeColorInput,
  parseColorMix,
} from "@/lib/chart-theme-color";
import {
  pickerColorToStudioColor,
  studioColorHexField,
  studioColorToOklchField,
  studioColorToPickerColor,
  studioColorUsesOklchInput,
} from "@/lib/studio-color-picker-value";
import { ColorArea } from "@/ui/color-picker/color-area";
import { ColorSlider } from "@/ui/color-picker/color-slider";

type ColorInputMode = "hex" | "oklch";

const OKLCH_PREFIX_RE = /^oklch\(/i;
const OKLCH_COMPONENTS_BODY_RE = /^[\d.]+\s+[\d.]+\s+[\d.]+/;

function colorInputMode(color: string): ColorInputMode {
  return studioColorUsesOklchInput(color) ? "oklch" : "hex";
}

function formatInputField(color: string, mode: ColorInputMode): string {
  if (mode === "oklch") {
    return studioColorToOklchField(color);
  }
  return studioColorHexField(color);
}

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
  const [inputMode, setInputMode] = useState<ColorInputMode>(() =>
    colorInputMode(color)
  );
  const [draft, setDraft] = useState(() =>
    formatInputField(color, colorInputMode(color))
  );
  const [pickerColor, setPickerColor] = useState(() =>
    studioColorToPickerColor(color)
  );

  useEffect(() => {
    const mode = colorInputMode(color);
    setInputMode(mode);
    setDraft(formatInputField(color, mode));
    setPickerColor(studioColorToPickerColor(color));
  }, [color]);

  const commitPickerColor = (next: Color, mode: ColorInputMode = inputMode) => {
    setPickerColor(next);
    const studioColor = pickerColorToStudioColor(next, mode);
    onChange(studioColor);
    if (mode === "hex") {
      setDraft(next.toString("hex").replace("#", "").toUpperCase());
    } else {
      setDraft(formatInputField(studioColor, mode));
    }
    setInputMode(mode);
  };

  const commitDraft = (raw: string, mode: ColorInputMode) => {
    if (mode === "oklch") {
      commitOklchDraft(raw, pickerColor, onChange);
      return;
    }

    const normalized = normalizeColorInput(raw);
    if (!normalized) {
      return;
    }
    const opacity = Math.round(pickerColor.getChannelValue("alpha") * 100);
    onChange(applyOpacityToColor(normalized, opacity));
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
          <div className="flex rounded-md border border-input p-0.5">
            {(["hex", "oklch"] as const).map((mode) => (
              <button
                className={cn(
                  "rounded px-2 py-1 font-medium text-[10px] uppercase tracking-wide transition-colors",
                  inputMode === mode
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                disabled={disabled}
                key={mode}
                onClick={() => {
                  setInputMode(mode);
                  setDraft(formatInputField(color, mode));
                }}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          <input
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 font-mono text-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            disabled={disabled}
            onBlur={() => commitDraft(draft, inputMode)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitDraft(draft, inputMode);
              }
            }}
            placeholder={inputMode === "hex" ? "000000" : "0.84 0.18 128"}
            value={draft}
          />
          <input
            aria-label="Fill opacity percent"
            className="h-8 w-14 rounded-md border border-input bg-background px-2 text-center font-mono text-muted-foreground text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

export { colorInputMode };
