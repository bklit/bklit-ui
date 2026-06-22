"use client";

import {
  ChartPickersDemo,
  ChromeDemo,
  ColorPickerDemo,
  ComponentsPanelDemo,
  CustomComponentsDemo,
  EditorCanvasDemo,
  EditorMenuBarDemo,
  FeedbackDemo,
  FieldsDemo,
  MotionBezierDemo,
  MotionControlDemo,
  MotionEasePresetsDemo,
  OverlaysDemo,
  PatternsDemo,
  PickersDemo,
  PrimitivesDemo,
  ShimmerTextDemo,
  SliderInputGroupDemo,
  SurfacesDemo,
  ToggleGroupDemo,
} from "@bklitui/studio/dev/ui-demos";
import type { ComponentType, ReactNode } from "react";
import { CatalogChartPreviewGrid } from "@/components/catalog/catalog-chart-preview-grid";
import { CatalogThemePanel } from "@/components/catalog/catalog-theme-panel";
import {
  CatalogThemeProvider,
  useCatalogTheme,
} from "@/components/catalog/catalog-theme-provider";
import { CatalogSourceMenu } from "@/components/catalog-source-menu";
import { HighlightedCodeBlock } from "@/components/highlighted-code-block";
import { CATALOG_TILE_SOURCES } from "@/lib/catalog-tile-sources";
import type { RepoRelativePath } from "@/lib/open-in-cursor";
import { StudioThemeProvider } from "@/providers/studio-theme-provider";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";

interface CatalogTile {
  id: string;
  title: string;
  description: string;
  Demo: ComponentType;
  sources: RepoRelativePath[];
}

const CATALOG_TILES: CatalogTile[] = [
  {
    id: "chrome",
    title: "Section chrome",
    description: "Collapsible groups, scramble, and reset actions.",
    Demo: ChromeDemo,
    sources: CATALOG_TILE_SOURCES.chrome ?? [],
  },
  {
    id: "surfaces",
    title: "Chart selector",
    description: "Sidebar chart type picker.",
    Demo: SurfacesDemo,
    sources: CATALOG_TILE_SOURCES.surfaces ?? [],
  },
  {
    id: "menu-bar",
    title: "Canvas toolbar",
    description: "Sidebar toggle, zoom, center, replay, and dimensions.",
    Demo: EditorMenuBarDemo,
    sources: CATALOG_TILE_SOURCES["menu-bar"] ?? [],
  },
  {
    id: "canvas",
    title: "Editor canvas",
    description: "Pan/zoom surface with axis rulers and dot grid.",
    Demo: EditorCanvasDemo,
    sources: CATALOG_TILE_SOURCES.canvas ?? [],
  },
  {
    id: "components-tree",
    title: "Components tree",
    description: "Layer list with icons, selection, and visibility.",
    Demo: ComponentsPanelDemo,
    sources: CATALOG_TILE_SOURCES["components-tree"] ?? [],
  },
  {
    id: "slider-input",
    title: "Slider input rows",
    description: "Series and points scrub fields.",
    Demo: SliderInputGroupDemo,
    sources: CATALOG_TILE_SOURCES["slider-input"] ?? [],
  },
  {
    id: "custom-controls",
    title: "Custom controls",
    description: "YesNoSwitch, scrub fields, StudioSlider.",
    Demo: CustomComponentsDemo,
    sources: CATALOG_TILE_SOURCES["custom-controls"] ?? [],
  },
  {
    id: "motion-full",
    title: "Motion panel",
    description: "Ease/spring, duration, curve, and presets.",
    Demo: MotionControlDemo,
    sources: CATALOG_TILE_SOURCES["motion-full"] ?? [],
  },
  {
    id: "motion-bezier",
    title: "Motion curve",
    description: "Inline bezier editor trigger.",
    Demo: MotionBezierDemo,
    sources: CATALOG_TILE_SOURCES["motion-bezier"] ?? [],
  },
  {
    id: "motion-presets",
    title: "Ease presets",
    description: "Preset icon grid.",
    Demo: MotionEasePresetsDemo,
    sources: CATALOG_TILE_SOURCES["motion-presets"] ?? [],
  },
  {
    id: "toggle-groups",
    title: "Toggle groups",
    description: "Segmented, icon, and card layouts.",
    Demo: ToggleGroupDemo,
    sources: CATALOG_TILE_SOURCES["toggle-groups"] ?? [],
  },
  {
    id: "fields",
    title: "Control fields",
    description: "Opacity, stroke, and fill picker rows.",
    Demo: FieldsDemo,
    sources: CATALOG_TILE_SOURCES.fields ?? [],
  },
  {
    id: "chart-pickers",
    title: "Chart pickers",
    description: "Curve, line cap, orientation, chart state.",
    Demo: ChartPickersDemo,
    sources: CATALOG_TILE_SOURCES["chart-pickers"] ?? [],
  },
  {
    id: "pickers",
    title: "Legend picker",
    description: "Legend placement grid.",
    Demo: PickersDemo,
    sources: CATALOG_TILE_SOURCES.pickers ?? [],
  },
  {
    id: "patterns",
    title: "Patterns",
    description: "Pattern swatch grid.",
    Demo: PatternsDemo,
    sources: CATALOG_TILE_SOURCES.patterns ?? [],
  },
  {
    id: "color-picker",
    title: "Color picker",
    description: "OKLCH area and channel sliders.",
    Demo: ColorPickerDemo,
    sources: CATALOG_TILE_SOURCES["color-picker"] ?? [],
  },
  {
    id: "primitives",
    title: "Primitives",
    description: "Button, input, select, switch.",
    Demo: PrimitivesDemo,
    sources: CATALOG_TILE_SOURCES.primitives ?? [],
  },
  {
    id: "overlays",
    title: "Overlays",
    description: "Dialog, sheet, and popover.",
    Demo: OverlaysDemo,
    sources: CATALOG_TILE_SOURCES.overlays ?? [],
  },
  {
    id: "shimmer-text",
    title: "Shimmer text",
    description: "Loading label shimmer.",
    Demo: ShimmerTextDemo,
    sources: CATALOG_TILE_SOURCES["shimmer-text"] ?? [],
  },
  {
    id: "feedback",
    title: "Feedback",
    description: "Alert, spinner, and tooltip.",
    Demo: FeedbackDemo,
    sources: CATALOG_TILE_SOURCES.feedback ?? [],
  },
];

function CatalogTileCard({
  title,
  description,
  sources,
  children,
}: {
  title: string;
  description: string;
  sources: RepoRelativePath[];
  children: ReactNode;
}) {
  return (
    <Card className="mb-5 inline-block w-full break-inside-avoid" size="sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
        <CardAction>
          <CatalogSourceMenu sources={sources} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="w-full min-w-0">{children}</div>
      </CardContent>
    </Card>
  );
}

export function StudioCatalogGrid() {
  return (
    <StudioThemeProvider embedded>
      <CatalogThemeProvider>
        <div className="flex min-h-[calc(100dvh-3.5rem)] w-full border-t">
          <CatalogThemePanel
            renderHighlightedCode={(code) => (
              <HighlightedCodeBlock code={code} lang="css" />
            )}
          />
          <CatalogMainContent />
        </div>
      </CatalogThemeProvider>
    </StudioThemeProvider>
  );
}

function CatalogMainContent() {
  const { tokenGroup } = useCatalogTheme();
  const isChartMode = tokenGroup === "chart";

  return (
    <div className="min-w-0 flex-1 bg-background px-6 py-8">
      <div className="mb-8">
        <h1 className="font-semibold text-2xl tracking-tight">
          {isChartMode ? "Chart catalog" : "Component catalog"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          {isChartMode ? (
            <>
              Live previews for every chart type. Tweak chart semantic tokens in
              the left panel, or edit{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                packages/studio/src/styles/bklit-tokens.css
              </code>{" "}
              directly.
            </>
          ) : (
            <>
              Every Studio UI surface in one grid. Tweak shadcn theme tokens in
              the left panel for live preview, or edit{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                packages/studio/src/styles/bklit-tokens.css
              </code>{" "}
              directly.
            </>
          )}{" "}
          Toggle light/dark with{" "}
          <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
            D
          </kbd>
          {isChartMode
            ? "."
            : ". Use the file menu on each card to open sources in Cursor."}
        </p>
      </div>

      {isChartMode ? (
        <CatalogChartPreviewGrid />
      ) : (
        <div className="w-full columns-[360px] gap-5">
          {CATALOG_TILES.map(({ id, title, description, Demo, sources }) => (
            <CatalogTileCard
              description={description}
              key={id}
              sources={sources}
              title={title}
            >
              <Demo />
            </CatalogTileCard>
          ))}
        </div>
      )}
    </div>
  );
}
