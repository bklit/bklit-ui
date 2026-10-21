"use client";

import { Icon } from "@bklitui/icons";
import {
  ChartPaletteEditor,
  ChartPaletteStrip,
} from "@bklitui/studio/chart-palette-editor";
import type { ChartPalette } from "@bklitui/studio/chart-palettes";
import { useEffect, useState } from "react";
import { ChartThemeExportDialog } from "@/components/chart-theme/chart-theme-export-dialog";
import { useChartTheme } from "@/components/chart-theme/chart-theme-provider";
import { ChartThemeSwatchIcon } from "@/components/chart-theme/chart-theme-swatch-icon";
import { Button } from "@/components/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { CUSTOM_CHART_THEME_ID } from "@/lib/chart-themes";
import { cn } from "@/lib/utils";

const STRIP_VARS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

function stripColors(palette: ChartPalette, mode: "light" | "dark") {
  const colors = palette[mode];
  return STRIP_VARS.map((name) => colors[name as keyof typeof colors]);
}

function PaletteOption({
  palette,
  mode,
  selected,
  onSelect,
}: {
  palette: ChartPalette;
  mode: "light" | "dark";
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "text-foreground" : "text-muted-foreground"
      )}
      onClick={onSelect}
      type="button"
    >
      <ChartPaletteStrip colors={stripColors(palette, mode)} />
      <span className="flex-1 truncate">{palette.name}</span>
      {selected ? (
        <Icon className="size-3.5 shrink-0" name="IconCheckmark1" />
      ) : null}
    </button>
  );
}

export function ChartThemeSelector() {
  const {
    themeId,
    theme,
    themes,
    customTheme,
    editMode,
    setThemeId,
    previewColor,
    setColor,
    resetCustomTheme,
  } = useChartTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "customize">("list");
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button aria-label="Chart palette" size="default" variant="ghost">
        <div className="size-5" />
      </Button>
    );
  }

  const options = customTheme ? [...themes, customTheme] : themes;

  return (
    <>
      <Popover
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setView("list");
          }
        }}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              aria-label="Chart palette"
              className="group/chart-theme-trigger"
              size="default"
              title="Chart palette"
              variant="ghost"
            />
          }
        >
          <ChartThemeSwatchIcon
            colors={stripColors(theme, editMode).slice(0, 3)}
            context="trigger"
          />
        </PopoverTrigger>
        <PopoverPopup
          align="end"
          className="w-64 text-xs [--viewport-inline-padding:--spacing(2)]"
        >
          {view === "list" ? (
            <div className="-my-2 flex flex-col gap-1">
              <fieldset className="flex flex-col gap-0.5">
                <legend className="px-2 pt-1 pb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                  Chart palette
                </legend>
                {options.map((palette) => (
                  <PaletteOption
                    key={palette.id}
                    mode={editMode}
                    onSelect={() => setThemeId(palette.id)}
                    palette={palette}
                    selected={palette.id === themeId}
                  />
                ))}
              </fieldset>
              <div className="mt-1 flex items-center gap-1 border-t pt-2">
                <Button
                  className="flex-1"
                  onClick={() => setView("customize")}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <Icon name="IconEditSmall1" />
                  Customize
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setOpen(false);
                    setView("list");
                    setExportOpen(true);
                  }}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <Icon name="IconCode" />
                  Export
                </Button>
              </div>
            </div>
          ) : (
            <div className="-my-2 flex flex-col gap-3 px-1">
              <div className="flex items-center gap-1">
                <Button
                  aria-label="Back to palettes"
                  onClick={() => setView("list")}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Icon name="IconChevronLeft" />
                </Button>
                <p className="flex-1 font-medium text-foreground text-xs">
                  {theme.id === CUSTOM_CHART_THEME_ID
                    ? "Custom palette"
                    : `Customize ${theme.name}`}
                </p>
                {customTheme ? (
                  <Button
                    aria-label="Discard custom palette"
                    onClick={resetCustomTheme}
                    size="icon-xs"
                    title="Discard custom palette"
                    type="button"
                    variant="ghost"
                  >
                    <Icon name="IconArrowRotateClockwise" />
                  </Button>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Editing {editMode} mode colors. Switch the site theme to edit
                the {editMode === "dark" ? "light" : "dark"} mode values.
              </p>
              <ChartPaletteEditor
                colors={theme[editMode]}
                onChange={setColor}
                onPreview={previewColor}
              />
              <Button
                onClick={() => {
                  setOpen(false);
                  setView("list");
                  setExportOpen(true);
                }}
                size="xs"
                type="button"
                variant="outline"
              >
                <Icon name="IconCode" />
                Export CSS
              </Button>
            </div>
          )}
        </PopoverPopup>
      </Popover>
      <ChartThemeExportDialog
        onOpenChange={setExportOpen}
        open={exportOpen}
        theme={theme}
      />
    </>
  );
}
