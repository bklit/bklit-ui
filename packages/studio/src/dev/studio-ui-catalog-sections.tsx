"use client";

import { ShimmeringText } from "@bklitui/ui/components/shimmering-text";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChartTypeSelector } from "@/components/chart-type-selector";
import { ChartStateToggle } from "@/components/controls/chart-state-toggle";
import { StudioControlRow } from "@/components/controls/control-field-helpers";
import { CurvePicker } from "@/components/controls/curve-picker";
import { FillPicker } from "@/components/controls/fill-picker";
import {
  IconToggleButton,
  IconToggleGroup,
} from "@/components/controls/icon-toggle-group";
import { LegendPositionPicker } from "@/components/controls/legend-position-picker";
import { LineCapPicker } from "@/components/controls/line-cap-picker";
import { MotionControl } from "@/components/controls/motion-control";
import { MotionCurveEditor } from "@/components/controls/motion-curve-editor";
import { MotionEasePresetGrid } from "@/components/controls/motion-ease-preset-grid";
import { MotionResetButton } from "@/components/controls/motion-reset-button";
import { OpacityControl } from "@/components/controls/opacity-control";
import { OrientationPicker } from "@/components/controls/orientation-picker";
import { PatternPicker } from "@/components/controls/pattern-picker";
import { ScrubNumberField } from "@/components/controls/scrub-number-field";
import { SliderInputGroup } from "@/components/controls/slider-input-group";
import { StudioColorPicker } from "@/components/controls/studio-color-picker";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { CurvePreviewIcon } from "@/components/curve-preview-icons";
import { StudioComponentsPanel } from "@/components/studio-components-panel";
import { StudioControlGroup } from "@/components/studio-control-group";
import { StudioScrambleDataButton } from "@/components/studio-scramble-data-button";
import { EditorCanvas } from "@/editor/editor-canvas";
import {
  EditorGridaRuler,
  EditorGridaRulerCorner,
} from "@/editor/editor-grida-rulers";
import { EditorMenuBar } from "@/editor/editor-menu-bar";
import { useEditorCamera } from "@/editor/use-editor-canvas-view";
import type { CurveId } from "@/lib/curves";
import { motionEasePresetUpdates } from "@/lib/motion-config";
import type { PatternPresetId } from "@/lib/pattern-presets";
import { getStudioConfig } from "@/lib/registry";
import {
  studioMotionSectionClass,
  studioPreviewCanvasClass,
  studioSectionLabelClass,
} from "@/lib/studio-chrome-classes";
import {
  defaultStudioComponentId,
  getStudioComponents,
} from "@/lib/studio-components";
import { defaultStudioState, type StudioUrlState } from "@/lib/studio-parsers";
import type { ChartSlug } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
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

function DemoPanel({ children }: { children: ReactNode }) {
  return <div className="flex w-full min-w-0 flex-col gap-4">{children}</div>;
}

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

  const onBatchChange = useCallback((updates: Partial<StudioUrlState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    onChange: setParam,
    onPreview: setParam,
    onCommit: setParam,
    onBatchChange,
  };
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

const MENU_BAR_ZOOM_FACTOR = 1.12;
const MENU_BAR_MIN_ZOOM = 0.25;
const MENU_BAR_MAX_ZOOM = 4;

export function EditorMenuBarDemo() {
  const [sidebarsOpen, setSidebarsOpen] = useState(true);
  const [canvasScale, setCanvasScale] = useState(1);

  const zoomBy = useCallback((factor: number) => {
    setCanvasScale((current) =>
      Math.min(MENU_BAR_MAX_ZOOM, Math.max(MENU_BAR_MIN_ZOOM, current * factor))
    );
  }, []);

  return (
    <div
      className={cn(
        studioPreviewCanvasClass,
        "flex min-h-[120px] w-full items-end justify-center overflow-x-auto p-6 pb-8"
      )}
    >
      <EditorMenuBar
        canvasScale={canvasScale}
        height={400}
        onCenterOnContent={() => undefined}
        onReplay={() => undefined}
        onResetZoom={() => setCanvasScale(1)}
        onSidebarsOpenChange={setSidebarsOpen}
        onZoomIn={() => zoomBy(MENU_BAR_ZOOM_FACTOR)}
        onZoomOut={() => zoomBy(1 / MENU_BAR_ZOOM_FACTOR)}
        showDimensions
        showFitView={false}
        showShare={false}
        showSidebarToggle
        showThemeToggle={false}
        showZoomControls
        sidebarsOpen={sidebarsOpen}
        width={720}
      />
    </div>
  );
}

export function EditorCanvasDemo() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const getContentBounds = useCallback(
    () => ({ x: 0, y: 0, width: 0, height: 0 }),
    []
  );

  const camera = useEditorCamera({
    defaultZoom: 1,
    enabled: true,
    getContentBounds,
    persist: false,
    viewportRef,
  });

  return (
    <div className="flex h-[200px] w-full overflow-hidden rounded-lg border border-border">
      <div className="flex h-full w-8 shrink-0 flex-col border-border/60 border-r">
        <EditorGridaRulerCorner />
        <EditorGridaRuler
          axis="y"
          camera={camera.camera}
          className="min-h-0 flex-1"
          viewportRef={viewportRef}
        />
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <EditorGridaRuler
          axis="x"
          camera={camera.camera}
          className="border-border/60 border-b"
          viewportRef={viewportRef}
        />

        <div className="relative min-h-0 flex-1">
          <EditorCanvas
            camera={camera.camera}
            className="absolute inset-0"
            enabled
            onDoubleClick={camera.onDoubleClick}
            onPointerDown={camera.onPointerDown}
            onPointerMove={camera.onPointerMove}
            onPointerUp={camera.onPointerUp}
            registerPinchHandlers={camera.registerPinchHandlers}
            spacePressed={camera.spacePressed}
            viewportRef={viewportRef}
          >
            <div
              aria-hidden
              className="absolute top-12 left-12 h-24 w-40 rounded-md border border-border/70 border-dashed bg-muted/30"
            />
          </EditorCanvas>
        </div>
      </div>
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

export function ComponentsPanelDemo() {
  const { state, onChange, onBatchChange } = useCatalogUrlState();
  const config = useMemo(() => getStudioConfig(state.chart), [state.chart]);
  const components = useMemo(
    () => getStudioComponents(config, state),
    [config, state]
  );
  const [selectedId, setSelectedId] = useState(() =>
    defaultStudioComponentId(components)
  );

  useEffect(() => {
    setSelectedId((current) => {
      if (components.some((component) => component.id === current)) {
        return current;
      }
      return defaultStudioComponentId(components);
    });
  }, [components]);

  return (
    <DemoControlGroups>
      <StudioComponentsPanel
        components={components}
        onBatchChange={onBatchChange}
        onChange={onChange}
        onSelect={setSelectedId}
        selectedId={selectedId}
        state={state}
      />
    </DemoControlGroups>
  );
}

export function ComponentsPanelSection() {
  return (
    <CatalogSection
      description="Nested layer tree with icons, selection, visibility toggles, and context menu actions."
      id="components-tree"
      title="Components tree"
    >
      <ComponentsPanelDemo />
    </CatalogSection>
  );
}

export function ToggleGroupDemo() {
  const [segmented, setSegmented] = useState("solid");
  const [icons, setIcons] = useState("moon");
  const [curve, setCurve] = useState<CurveId>("natural");

  return (
    <DemoPanel>
      <div className="space-y-2">
        <p className={studioSectionLabelClass}>Segmented</p>
        <StudioToggleGroup
          layout="segmented"
          onValueChange={setSegmented}
          value={segmented}
        >
          <StudioToggleGroupItem value="solid">Solid</StudioToggleGroupItem>
          <StudioToggleGroupItem value="pattern">Pattern</StudioToggleGroupItem>
        </StudioToggleGroup>
      </div>
      <div className="space-y-2">
        <p className={studioSectionLabelClass}>Icons</p>
        <IconToggleGroup onValueChange={setIcons} value={icons}>
          <IconToggleButton icon="IconMoon" label="Moon" value="moon" />
          <IconToggleButton icon="IconGauge" label="Gauge" value="gauge" />
          <IconToggleButton icon="IconRadar" label="Radar" value="radar" />
        </IconToggleGroup>
      </div>
      <div className="space-y-2">
        <p className={studioSectionLabelClass}>Cards (2 col)</p>
        <StudioToggleGroup
          layout="cards-2"
          onValueChange={(v) => setCurve(v as CurveId)}
          value={curve}
        >
          {(["natural", "linear", "step", "basis"] as const).map((id) => (
            <StudioToggleGroupItem key={id} value={id}>
              <CurvePreviewIcon className="mx-auto text-current" curveId={id} />
              <span className="mt-1 text-[10px] capitalize">{id}</span>
            </StudioToggleGroupItem>
          ))}
        </StudioToggleGroup>
      </div>
    </DemoPanel>
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
    <DemoPanel>
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
    </DemoPanel>
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
    <DemoPanel>
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
    </DemoPanel>
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
    <DemoPanel>
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
          <Label className="w-28 shrink-0 font-medium text-xs">Animated</Label>
          <YesNoSwitch
            className="min-w-0 flex-1"
            onValueChange={setAnimated}
            value={animated}
          />
        </div>
      </div>
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
    </DemoPanel>
  );
}

export function MotionBezierDemo() {
  const { state, onPreview, onCommit } = useCatalogUrlState();

  return (
    <div className={studioMotionSectionClass}>
      <MotionCurveEditor
        layout="inline"
        onCommit={onCommit}
        onPreview={onPreview}
        state={motionSlice(state)}
      />
    </div>
  );
}

export function MotionEasePresetsDemo() {
  const { state, onChange } = useCatalogUrlState();

  return (
    <MotionEasePresetGrid
      onSelect={(id) => {
        const preset = motionEasePresetUpdates(id);
        onChange("motionEase", preset.motionEase);
        onChange("motionBezier", preset.motionBezier);
      }}
      value={state.motionEase}
    />
  );
}

export function MotionControlDemo() {
  const { state, onChange, onPreview, onCommit } = useCatalogUrlState();

  return (
    <div className={studioMotionSectionClass}>
      <MotionControl
        onChange={onChange}
        onCommit={onCommit}
        onPreview={onPreview}
        showStaggerScale
        state={state}
      />
    </div>
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
  return <PatternPicker onChange={setPattern} value={pattern} />;
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
    <LegendPositionPicker
      align={align}
      onChange={(nextPlacement, nextAlign) => {
        setPlacement(nextPlacement);
        setAlign(nextAlign);
      }}
      placement={placement}
    />
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
    <DemoPanel>
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
    </DemoPanel>
  );
}

export function FeedbackDemo() {
  return (
    <DemoPanel>
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
    </DemoPanel>
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

export function ChromeDemo() {
  const { state, onCommit } = useCatalogUrlState();

  return (
    <DemoControlGroups>
      <StudioControlGroup
        collapsible
        defaultOpen
        title="Data"
        titleTrailing={
          <StudioScrambleDataButton onScramble={() => undefined} />
        }
      >
        <SliderInputGroup
          label="Series"
          max={8}
          min={1}
          onCommit={() => undefined}
          onPreview={() => undefined}
          value={2}
        />
      </StudioControlGroup>
      <StudioControlGroup
        collapsible
        defaultOpen
        title="Animation"
        titleTrailing={<MotionResetButton onCommit={onCommit} state={state} />}
      >
        <p className="text-muted-foreground text-xs leading-relaxed">
          Section headers, collapse chevrons, and trailing actions.
        </p>
      </StudioControlGroup>
    </DemoControlGroups>
  );
}

export function SliderInputGroupDemo() {
  const [series, setSeries] = useState(2);
  const [points, setPoints] = useState(12);

  return (
    <DemoPanel>
      <SliderInputGroup
        label="Series"
        max={8}
        min={1}
        onCommit={setSeries}
        onPreview={setSeries}
        value={series}
      />
      <SliderInputGroup
        label="Points"
        max={48}
        min={4}
        onCommit={setPoints}
        onPreview={setPoints}
        step={1}
        value={points}
      />
    </DemoPanel>
  );
}

export function ColorPickerDemo() {
  const [color, setColor] = useState("oklch(0.62 0.19 250)");

  return (
    <StudioColorPicker color={color} onChange={setColor} onPreview={setColor} />
  );
}

export function ChartPickersDemo() {
  const [curve, setCurve] = useState<CurveId>("natural");
  const [lineCap, setLineCap] = useState<"round" | "butt">("round");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical"
  );
  const [chartState, setChartState] = useState<"ready" | "loading">("ready");

  return (
    <DemoPanel>
      <CurvePicker onChange={setCurve} value={curve} />
      <LineCapPicker onChange={setLineCap} value={lineCap} />
      <OrientationPicker onChange={setOrientation} value={orientation} />
      <ChartStateToggle onChange={setChartState} value={chartState} />
    </DemoPanel>
  );
}

export function OverlaysDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog</DialogTitle>
            <DialogDescription>
              Modal overlay for confirmations and forms.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Sheet>
        <SheetTrigger render={<Button size="sm" variant="outline" />}>
          Sheet
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Sheet</SheetTitle>
            <SheetDescription>
              Slide-over panel for mobile sidebars.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Popover>
        <PopoverTrigger render={<Button size="sm" variant="outline" />}>
          Popover
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <p className="text-sm">Floating panel anchored to a trigger.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function CustomComponentsSection() {
  return (
    <CatalogSection
      description="YesNoSwitch, scrub number fields, and StudioSlider."
      id="custom-components"
      title="Custom controls"
    >
      <CustomComponentsDemo />
    </CatalogSection>
  );
}

export function ShimmerTextSection() {
  return (
    <CatalogSection
      description="Loading shimmer labels used in chart chrome."
      id="shimmer-text"
      title="Shimmer text"
    >
      <ShimmerTextDemo />
    </CatalogSection>
  );
}

export function EditorMenuBarSection() {
  return (
    <CatalogSection
      description="Floating canvas toolbar with sidebar toggle, zoom, center, replay, and frame dimensions."
      id="menu-bar"
      title="Canvas toolbar"
      wide
    >
      <EditorMenuBarDemo />
    </CatalogSection>
  );
}

export function EditorCanvasSection() {
  return (
    <CatalogSection
      description="Pan/zoom surface with axis rulers and infinite dot grid."
      id="canvas"
      title="Editor canvas"
      wide
    >
      <EditorCanvasDemo />
    </CatalogSection>
  );
}

export const CATALOG_SECTIONS = [
  { id: "surfaces", label: "Surfaces" },
  { id: "canvas", label: "Editor canvas" },
  { id: "menu-bar", label: "Canvas toolbar" },
  { id: "components-tree", label: "Components tree" },
  { id: "toggle-groups", label: "Toggle groups" },
  { id: "primitives", label: "Primitives" },
  { id: "fields", label: "Fields" },
  { id: "custom-components", label: "Custom controls" },
  { id: "chrome", label: "Section chrome" },
  { id: "slider-input", label: "Slider input rows" },
  { id: "motion", label: "Motion" },
  { id: "patterns", label: "Patterns" },
  { id: "pickers", label: "Pickers" },
  { id: "chart-pickers", label: "Chart pickers" },
  { id: "color-picker", label: "Color picker" },
  { id: "overlays", label: "Overlays" },
  { id: "shimmer-text", label: "Shimmer text" },
  { id: "feedback", label: "Feedback" },
] as const;
