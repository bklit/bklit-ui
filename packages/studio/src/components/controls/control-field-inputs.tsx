"use client";

import { cn } from "@bklitui/ui/lib/utils";
import type { CurveId } from "@/lib/curves";
import type { PatternPresetId } from "@/lib/patterns";
import type { StudioUrlState } from "@/lib/studio-parsers";
import type { StudioControl } from "@/lib/types";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Switch } from "@/ui/switch";
import { studioControlInputClass } from "./control-field-helpers";
import { CrosshairFadePicker } from "./crosshair-fade-picker";
import { CurvePicker } from "./curve-picker";
import { type FadeEdgesOption, FadeEdgesPicker } from "./fade-edges-picker";
import { FunnelEdgesPicker } from "./funnel-edges-picker";
import { GraticuleToggle } from "./graticule-toggle";
import { LineCapPicker } from "./line-cap-picker";
import { OrientationPicker } from "./orientation-picker";
import { PatternPicker } from "./pattern-picker";
import { PieFillPicker } from "./pie-fill-picker";
import { PieHoverEffectPicker } from "./pie-hover-effect-picker";
import { StrokeStylePicker } from "./stroke-style-picker";

export function ControlFieldInputs({
  control,
  value,
  onChange,
}: {
  control: StudioControl;
  value: unknown;
  onChange: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
}) {
  switch (control.type) {
    case "boolean":
      return (
        <Switch
          checked={Boolean(value)}
          id={String(control.key)}
          onCheckedChange={(checked) =>
            onChange(control.key, checked as StudioUrlState[typeof control.key])
          }
        />
      );
    case "text":
      return (
        <Input
          className={cn("h-8 w-full", studioControlInputClass)}
          id={String(control.key)}
          onChange={(e) =>
            onChange(
              control.key,
              e.target.value as StudioUrlState[typeof control.key]
            )
          }
          value={String(value ?? "")}
        />
      );
    case "select":
      return (
        <Select
          onValueChange={(v) =>
            onChange(control.key, v as StudioUrlState[typeof control.key])
          }
          value={String(value)}
        >
          <SelectTrigger
            className="h-8 w-full text-xs"
            id={String(control.key)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "curve":
      return (
        <CurvePicker
          onChange={(v) => onChange(control.key, v as StudioUrlState["curve"])}
          value={value as CurveId}
        />
      );
    case "pattern":
      return (
        <PatternPicker
          onChange={(v) =>
            onChange(control.key, v as StudioUrlState[typeof control.key])
          }
          value={value as PatternPresetId}
        />
      );
    case "pieFill":
      return (
        <PieFillPicker
          onChange={(v) =>
            onChange(control.key, v as StudioUrlState["pieFillMode"])
          }
          value={value as "solid" | "lines"}
        />
      );
    case "orientation":
      return (
        <OrientationPicker
          onChange={(v) =>
            onChange(control.key, v as StudioUrlState[typeof control.key])
          }
          value={value as "vertical" | "horizontal"}
        />
      );
    case "lineCap":
      return (
        <LineCapPicker
          onChange={(v) => onChange("barLineCap", v)}
          value={value as "round" | "butt"}
        />
      );
    case "pieHoverEffect":
      return (
        <PieHoverEffectPicker
          onChange={(v) => onChange("pieHoverEffect", v)}
          value={value as "translate" | "grow" | "none"}
        />
      );
    case "funnelEdges":
      return (
        <FunnelEdgesPicker
          onChange={(v) => onChange("funnelEdges", v)}
          value={value as "curved" | "straight"}
        />
      );
    case "fadeEdges":
      return (
        <FadeEdgesPicker
          onChange={(v) => onChange("fadeEdges", v)}
          value={value as FadeEdgesOption}
        />
      );
    case "graticuleToggle":
      return (
        <GraticuleToggle
          onChange={(v) => onChange("showGraticule", v)}
          value={Boolean(value)}
        />
      );
    case "strokeStyle":
      return (
        <StrokeStylePicker
          onChange={(v) =>
            onChange(control.key, v as StudioUrlState[typeof control.key])
          }
          value={value as "solid" | "dashed"}
        />
      );
    case "crosshairFade":
      return (
        <CrosshairFadePicker
          onChange={(v) =>
            onChange(control.key, v as StudioUrlState[typeof control.key])
          }
          value={value as "both" | "none" | "top" | "bottom"}
        />
      );
    default:
      return null;
  }
}
