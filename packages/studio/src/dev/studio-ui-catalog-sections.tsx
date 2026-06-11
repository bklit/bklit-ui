"use client";

import { ShimmeringText } from "@bklitui/ui/components/shimmering-text";
import { type ReactNode, useCallback, useState } from "react";
import { ChartTypeSelector } from "@/components/chart-type-selector";
import { StudioControlRow } from "@/components/controls/control-field-helpers";
import { FillPicker } from "@/components/controls/fill-picker";
import {
  IconToggleButton,
  IconToggleGroup,
} from "@/components/controls/icon-toggle-group";
import { LegendPositionPicker } from "@/components/controls/legend-position-picker";
import { MotionControl } from "@/components/controls/motion-control";
import { MotionCurveEditor } from "@/components/controls/motion-curve-editor";
import { MotionEasePresetGrid } from "@/components/controls/motion-ease-preset-grid";
import { OpacityControl } from "@/components/controls/opacity-control";
import { PatternPicker } from "@/components/controls/pattern-picker";
import { ScrubNumberField } from "@/components/controls/scrub-number-field";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { CurvePreviewIcon } from "@/components/curve-preview-icons";
import { StudioControlGroup } from "@/components/studio-control-group";
import type { CurveId } from "@/lib/curves";
import { motionEasePresetUpdates } from "@/lib/motion-config";
import type { PatternPresetId } from "@/lib/pattern-presets";
import {
  studioMotionSectionClass,
  studioSectionLabelClass,
} from "@/lib/studio-chrome-classes";
import { defaultStudioState, type StudioUrlState } from "@/lib/studio-parsers";
import type { ChartSlug } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Spinner } from "@/ui/spinner";
import { StudioSlider } from "@/ui/studio-slider";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip";
import { YesNoSwitch } from "@/ui/yes-no-switch";

const SIDEBAR_WIDTH = "w-[280px]";

function DemoControlGroups({ children }: { children: ReactNode }) {
  return (
    <div className="studio-control-groups w-full min-w-0 space-y-0 pb-4">
      {children}
    </div>
  );
}

function useCatalogUrlState() {
  const [state, setState] = useState(defaultStudioState);

  const setParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return { state, onChange: setParam, onPreview: setParam, onCommit: setParam };
}

function motionSlice(state: StudioUrlState) {
  return {
    motionType: state.motionType,
    motionDuration: state.motionDuration,
    motionBounce: state.motionBounce,
    motionEase: state.motionEase,
    motionBezier: state.motionBezier,
  };
}

export function CatalogSection({
  id,
  title,
  description,
  children,
  wide,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      className="scroll-mt-6 space-y-4 border-border border-b pb-10 last:border-b-0"
      id={id}
    >
      <div>
        <h2 className="font-semibold text-base tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className={wide ? "max-w-xl" : SIDEBAR_WIDTH}>{children}</div>
    </section>
  );
}

export function SurfacesDemo() {
  const [chart, setChart] = useState<ChartSlug>("area-chart");

  return (
    <div className="studio-control-groups w-full min-w-0 pb-4">
      <ChartTypeSelector onChange={setChart} value={chart} />
    </div>
  );
}

export function SurfacesSection() {
  return (
    <CatalogSection
      description="Chart type picker at the top of the Studio sidebar — outline trigger opens a 2-column icon grid."
      id="surfaces"
      title="Sidebar controls"
    >
      <SurfacesDemo />
    </CatalogSection>
  );
}

export function ToggleGroupDemo() {
  const [segmented, setSegmented] = useState("solid");
  const [icons, setIcons] = useState("moon");
  const [curve, setCurve] = useState<CurveId>("natural");

  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Segmented">
        <StudioToggleGroup
          layout="segmented"
          onValueChange={setSegmented}
          value={segmented}
        >
          <StudioToggleGroupItem value="solid">Solid</StudioToggleGroupItem>
          <StudioToggleGroupItem value="pattern">Pattern</StudioToggleGroupItem>
        </StudioToggleGroup>
      </StudioControlGroup>
      <StudioControlGroup collapsible defaultOpen title="Icons">
        <IconToggleGroup onValueChange={setIcons} value={icons}>
          <IconToggleButton icon="IconMoon" label="Moon" value="moon" />
          <IconToggleButton icon="IconGauge" label="Gauge" value="gauge" />
          <IconToggleButton icon="IconRadar" label="Radar" value="radar" />
        </IconToggleGroup>
      </StudioControlGroup>
      <StudioControlGroup collapsible defaultOpen title="Cards (2 col)">
        <StudioToggleGroup
          layout="cards-2"
          onValueChange={(v) => setCurve(v as CurveId)}
          value={curve}
        >
          {(["natural", "linear", "step", "basis"] as const).map((id) => (
            <StudioToggleGroupItem key={id} value={id}>
              <CurvePreviewIcon className="mx-auto" curveId={id} />
              <span className="mt-1 text-[10px] capitalize">{id}</span>
            </StudioToggleGroupItem>
          ))}
        </StudioToggleGroup>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function ToggleGroupSection() {
  return (
    <CatalogSection
      description="shadcn ToggleGroup layouts used across property controls."
      id="toggle-groups"
      title="Toggle groups"
    >
      <ToggleGroupDemo />
    </CatalogSection>
  );
}

/** @deprecated Use `ToggleGroupDemo`. */
export const TabsDemo = ToggleGroupDemo;

/** @deprecated Use `ToggleGroupSection`. */
export const TabsSection = ToggleGroupSection;

export function PrimitivesDemo() {
  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Primitives">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <Input placeholder="Input" />
          <Textarea placeholder="Textarea" rows={3} />
          <Select defaultValue="a">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Option A</SelectItem>
              <SelectItem value="b">Option B</SelectItem>
            </SelectContent>
          </Select>
          <StudioControlRow label="Switch">
            <Switch defaultChecked />
          </StudioControlRow>
        </div>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function PrimitivesSection() {
  return (
    <CatalogSection
      description="Shadcn primitives from packages/studio/src/ui — add more with pnpm ui:add."
      id="primitives"
      title="Primitives"
      wide
    >
      <PrimitivesDemo />
    </CatalogSection>
  );
}

export function FieldsDemo() {
  const [opacity, setOpacity] = useState(0.72);
  const [stroke, setStroke] = useState(2);
  const [color, setColor] = useState("oklch(0.62 0.19 250)");
  const [fillMode, setFillMode] = useState<"solid" | "pattern">("solid");

  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Fill">
        <div className="flex flex-col gap-1.5">
          <OpacityControl
            color={color}
            label="Opacity"
            max={1}
            min={0}
            onCommit={setOpacity}
            onPreview={setOpacity}
            step={0.05}
            value={opacity}
          />
          <div className="flex min-w-0 items-center gap-2.5">
            <Label className="w-28 shrink-0 font-medium text-xs">Stroke</Label>
            <ScrubNumberField
              max={8}
              min={0}
              onCommit={setStroke}
              onPreview={setStroke}
              step={0.5}
              unit="px"
              value={stroke}
            />
          </div>
          <FillPicker
            color={color}
            fillMode={fillMode}
            label="Fill"
            onColorChange={setColor}
            onColorPreview={setColor}
            onFillModeChange={setFillMode}
            onPatternChange={() => undefined}
            pattern="none"
            supportsPattern
          />
        </div>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function FieldsSection() {
  return (
    <CatalogSection
      description="Property row patterns — label + control, scrub inputs, fill picker."
      id="fields"
      title="Control fields"
    >
      <FieldsDemo />
    </CatalogSection>
  );
}

export function CustomComponentsDemo() {
  const [visible, setVisible] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [duration, setDuration] = useState(1.1);
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(49);
  const [saturation, setSaturation] = useState(8);

  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Yes / No">
        <div className="flex flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Label className="w-28 shrink-0 font-medium text-xs">Visible</Label>
            <YesNoSwitch
              className="min-w-0 flex-1"
              onValueChange={setVisible}
              value={visible}
            />
          </div>
          <div className="flex min-w-0 items-center gap-2.5">
            <Label className="w-28 shrink-0 font-medium text-xs">
              Animated
            </Label>
            <YesNoSwitch
              className="min-w-0 flex-1"
              onValueChange={setAnimated}
              value={animated}
            />
          </div>
        </div>
      </StudioControlGroup>
      <StudioControlGroup collapsible defaultOpen title="Scrub number">
        <div className="flex min-w-0 items-center gap-2.5">
          <Label className="w-28 shrink-0 font-medium text-xs">Duration</Label>
          <ScrubNumberField
            max={5}
            min={0}
            onCommit={setDuration}
            onPreview={setDuration}
            step={0.1}
            unit="s"
            value={duration}
          />
        </div>
      </StudioControlGroup>
      <StudioControlGroup collapsible defaultOpen title="Sliders">
        <div className="flex flex-col gap-1.5">
          <StudioSlider
            format={(v) => v.toFixed(2)}
            label="Opacity"
            max={1}
            min={0}
            onCommit={setOpacity}
            onPreview={setOpacity}
            step={0.01}
            value={opacity}
          />
          <StudioSlider
            label="Blur"
            max={100}
            min={0}
            onCommit={setBlur}
            onPreview={setBlur}
            step={1}
            unit="px"
            value={blur}
          />
          <StudioSlider
            format={(v) => v.toFixed(1)}
            label="Saturation"
            max={10}
            min={0}
            onCommit={setSaturation}
            onPreview={setSaturation}
            step={0.1}
            value={saturation}
          />
        </div>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function MotionBezierDemo() {
  const { state, onPreview, onCommit } = useCatalogUrlState();

  return (
    <DemoControlGroups>
      <StudioControlGroup
        className={studioMotionSectionClass}
        collapsible
        defaultOpen
        title="Curve"
      >
        <MotionCurveEditor
          layout="inline"
          onCommit={onCommit}
          onPreview={onPreview}
          state={motionSlice(state)}
        />
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function MotionEasePresetsDemo() {
  const { state, onChange } = useCatalogUrlState();

  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Presets">
        <MotionEasePresetGrid
          onSelect={(id) => {
            const preset = motionEasePresetUpdates(id);
            onChange("motionEase", preset.motionEase);
            onChange("motionBezier", preset.motionBezier);
          }}
          value={state.motionEase}
        />
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function MotionControlDemo() {
  const { state, onChange, onPreview, onCommit } = useCatalogUrlState();

  return (
    <DemoControlGroups>
      <StudioControlGroup
        className={studioMotionSectionClass}
        collapsible
        defaultOpen
        title="Motion"
      >
        <MotionControl
          onChange={onChange}
          onCommit={onCommit}
          onPreview={onPreview}
          showStaggerScale
          state={state}
        />
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function MotionSection() {
  return (
    <CatalogSection
      description="Bezier curve editor, ease/spring toggle, duration scrubbers, and preset grid."
      id="motion"
      title="Motion"
    >
      <div className={cn(studioMotionSectionClass, "flex flex-col gap-8")}>
        <div className="space-y-2">
          <p className={studioSectionLabelClass}>Bezier editor</p>
          <MotionBezierDemo />
        </div>
        <div className="space-y-2">
          <p className={studioSectionLabelClass}>Ease presets</p>
          <MotionEasePresetsDemo />
        </div>
        <div className="space-y-2">
          <p className={studioSectionLabelClass}>Full motion panel</p>
          <MotionControlDemo />
        </div>
      </div>
    </CatalogSection>
  );
}

export function PatternsDemo() {
  const [pattern, setPattern] = useState<PatternPresetId>("diagonal");
  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Pattern">
        <PatternPicker onChange={setPattern} value={pattern} />
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function PatternsSection() {
  return (
    <CatalogSection
      description="Pattern swatch grid for series fill mode."
      id="patterns"
      title="Patterns"
    >
      <PatternsDemo />
    </CatalogSection>
  );
}

export function PickersDemo() {
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [align, setAlign] = useState<"start" | "center" | "end">("center");

  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Legend">
        <LegendPositionPicker
          align={align}
          onChange={(nextPlacement, nextAlign) => {
            setPlacement(nextPlacement);
            setAlign(nextAlign);
          }}
          placement={placement}
        />
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function PickersSection() {
  return (
    <CatalogSection
      description="Legend position and icon pickers built on ToggleGroup layouts."
      id="pickers"
      title="Pickers"
    >
      <PickersDemo />
    </CatalogSection>
  );
}

export function ShimmerTextDemo() {
  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Shimmer text">
        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1">
            <p className="m-0 text-muted-foreground text-xs">Loading label</p>
            <ShimmeringText className="text-sm" text="Loading" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="m-0 text-muted-foreground text-xs">Version pill</p>
            <ShimmeringText className="text-xs" text="Version 2" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="m-0 text-muted-foreground text-xs">Custom colors</p>
            <ShimmeringText
              className="text-sm [--color:var(--chart-4)] [--shimmering-color:var(--foreground)]"
              text="Custom shimmer"
            />
          </div>
        </div>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function FeedbackDemo() {
  return (
    <DemoControlGroups>
      <StudioControlGroup collapsible defaultOpen title="Feedback">
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>Studio UI</AlertTitle>
            <AlertDescription>
              Alerts, spinners, and tooltips for editor chrome.
            </AlertDescription>
          </Alert>
          <div className="flex items-center gap-3">
            <Spinner />
            <span className="text-muted-foreground text-sm">Loading</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button size="sm" variant="outline" />}>
                Hover me
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function FeedbackSection() {
  return (
    <CatalogSection
      description="Alerts, spinners, and tooltips inside the studio shell."
      id="feedback"
      title="Feedback"
      wide
    >
      <FeedbackDemo />
    </CatalogSection>
  );
}

export const CATALOG_SECTIONS = [
  { id: "surfaces", label: "Surfaces" },
  { id: "toggle-groups", label: "Toggle groups" },
  { id: "primitives", label: "Primitives" },
  { id: "fields", label: "Fields" },
  { id: "motion", label: "Motion" },
  { id: "patterns", label: "Patterns" },
  { id: "pickers", label: "Pickers" },
  { id: "feedback", label: "Feedback" },
] as const;
