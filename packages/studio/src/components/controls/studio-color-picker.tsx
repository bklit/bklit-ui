"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { studioInputSurfaceClass } from "@/components/controls/control-field-helpers";
import { isValidOklchColor, parseColorMix } from "@/lib/chart-theme-color";
import { isValidOklchBody } from "@/lib/oklch-color";
import {
  clampPickerState,
  type OklchPickerState,
  oklchFieldToPickerState,
  oklchFieldToStudioColor,
  pickerStateToStudioColor,
  studioColorToOklchField,
  studioColorToPickerState,
} from "@/lib/studio-color-picker-value";
import { OklchColorArea } from "@/ui/color-picker/oklch-color-area";
import {
  OklchAlphaSlider,
  OklchHueSlider,
} from "@/ui/color-picker/oklch-color-slider";

const OKLCH_PREFIX_RE = /^oklch\(/i;

function commitOklchDraft(
  raw: string,
  state: OklchPickerState,
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
  if (!isValidOklchBody(body)) {
    return;
  }

  const studioColor = oklchFieldToStudioColor(body, state.alpha);
  if (studioColor === null) {
    return;
  }
  onChange(studioColor);
}

export function StudioColorPicker({
  color,
  disabled = false,
  onChange,
  onPreview,
}: {
  color: string;
  disabled?: boolean;
  /** Commits to URL / parent state (e.g. pointer up, blur, Enter). */
  onChange: (value: string) => void;
  /** Live chart preview while dragging; does not update the URL. */
  onPreview?: (value: string) => void;
}) {
  const [draft, setDraft] = useState(() => studioColorToOklchField(color));
  const [pickerState, setPickerState] = useState(() =>
    studioColorToPickerState(color)
  );
  const pickerStateRef = useRef(pickerState);
  pickerStateRef.current = pickerState;

  useEffect(() => {
    setDraft(studioColorToOklchField(color));
    setPickerState(studioColorToPickerState(color));
  }, [color]);

  const applyState = (next: OklchPickerState, mode: "preview" | "commit") => {
    const clamped = clampPickerState(next);
    pickerStateRef.current = clamped;
    setPickerState(clamped);
    const studioColor = pickerStateToStudioColor(clamped);
    setDraft(studioColorToOklchField(studioColor));
    if (mode === "commit") {
      onChange(studioColor);
    } else {
      onPreview?.(studioColor);
    }
  };

  const previewPartial = (partial: Partial<OklchPickerState>) => {
    applyState({ ...pickerStateRef.current, ...partial }, "preview");
  };

  const commitCurrent = () => {
    applyState(pickerStateRef.current, "commit");
  };

  const commitDraft = (raw: string) => {
    const body = raw.trim();
    if (!body) {
      onChange("");
      return;
    }

    const nextState = oklchFieldToPickerState(body, pickerStateRef.current);
    if (nextState) {
      applyState(nextState, "commit");
      return;
    }

    commitOklchDraft(raw, pickerStateRef.current, onChange);
  };

  const opacity = Math.round(pickerState.alpha * 100);

  return (
    <div className="flex flex-col gap-3">
      <OklchColorArea
        disabled={disabled}
        onChange={previewPartial}
        onChangeEnd={commitCurrent}
        value={pickerState}
      />

      <div className="flex flex-col gap-2">
        <OklchHueSlider
          disabled={disabled}
          onChange={previewPartial}
          onChangeEnd={commitCurrent}
          value={pickerState}
        />
        <OklchAlphaSlider
          disabled={disabled}
          onChange={previewPartial}
          onChangeEnd={commitCurrent}
          value={pickerState}
        />
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
            applyState(
              { ...pickerStateRef.current, alpha: opacity / 100 },
              "commit"
            );
          }}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (Number.isFinite(next)) {
              const clamped = Math.min(100, Math.max(0, next));
              setPickerState({
                ...pickerStateRef.current,
                alpha: clamped / 100,
              });
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyState(
                { ...pickerStateRef.current, alpha: opacity / 100 },
                "commit"
              );
            }
          }}
          value={opacity}
        />
      </div>
    </div>
  );
}
