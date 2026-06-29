"use client";

import { Icon } from "@bklitui/icons";
import { type ReactNode, useMemo, useState } from "react";
import {
  type CatalogThemeTokenGroup,
  useCatalogTheme,
} from "@/components/catalog/catalog-theme-provider";
import { studioControlInputClass } from "@/components/controls/control-field-helpers";
import { StudioColorPicker } from "@/components/controls/studio-color-picker";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import { StudioCopyButton } from "@/components/studio-copy-button";
import { StudioScrollArea } from "@/components/studio-scroll-area";
import { BKLIT_CHART_THEME_TOKEN_NAMES } from "@/lib/bklit-chart-theme-tokens";
import { BKLIT_SHADCN_THEME_TOKEN_NAMES } from "@/lib/bklit-shadcn-theme-tokens";
import {
  isThemeColorToken,
  normalizeThemeTokenColor,
} from "@/lib/chart-theme-color";
import {
  studioScrubSurfaceClass,
  studioSectionLabelClass,
  studioSidebarScrollClass,
} from "@/lib/studio-chrome-classes";
import {
  pickerStatePreviewCss,
  studioColorToOklchField,
  studioColorToPickerState,
} from "@/lib/studio-color-picker-value";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  studioSidebarPopoverCollisionAvoidance,
  studioSidebarPopoverSideOffset,
} from "@/ui/studio-sidebar-popover";

const PANEL_WIDTH = 280;
const PANEL_COLLAPSED_WIDTH = 40;

function formatTokenLabel(name: string): string {
  return name.replaceAll("-", " ");
}

function ThemeTokenSwatch({ value }: { value: string }) {
  const preview = useMemo(() => {
    const trimmed = value.trim();
    if (trimmed.startsWith("oklch(")) {
      return pickerStatePreviewCss(studioColorToPickerState(trimmed));
    }
    return trimmed || "transparent";
  }, [value]);

  return (
    <span
      className="block size-full rounded-[3px] border border-border/60"
      style={{ background: preview }}
    />
  );
}

function ThemeTokenRow({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pickerColor = useMemo(() => normalizeThemeTokenColor(value), [value]);
  const isColor = isThemeColorToken(name, value);
  const oklchField = studioColorToOklchField(pickerColor);
  const triggerLabel = isColor && oklchField ? `oklch(${oklchField})` : value;

  if (!isColor) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="font-medium text-[11px] text-muted-foreground capitalize leading-tight">
          {formatTokenLabel(name)}
        </span>
        <Input
          className={cn(studioControlInputClass, "h-8 font-mono text-xs")}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-medium text-[11px] text-muted-foreground capitalize leading-tight">
        {formatTokenLabel(name)}
      </span>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-expanded={open}
          render={
            <button
              className={cn(
                "flex h-8 w-full min-w-0 items-center gap-2 px-2 text-left outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50",
                studioScrubSurfaceClass
              )}
              type="button"
            />
          }
        >
          <span className="flex size-3.5 shrink-0 items-center justify-center overflow-hidden rounded-[3px]">
            <ThemeTokenSwatch value={value} />
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground lowercase">
            {triggerLabel}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(calc(100vw-2rem),18rem)] gap-3 p-3"
          collisionAvoidance={studioSidebarPopoverCollisionAvoidance}
          positionMethod="fixed"
          side="right"
          sideOffset={studioSidebarPopoverSideOffset}
        >
          <StudioColorPicker
            color={pickerColor}
            onChange={onChange}
            onPreview={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CatalogThemeCodeDialog({
  open,
  onOpenChange,
  cssBlock,
  resolvedTheme,
  tokenGroup,
  renderHighlightedCode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cssBlock: string;
  resolvedTheme: "light" | "dark";
  tokenGroup: CatalogThemeTokenGroup;
  renderHighlightedCode?: (code: string) => ReactNode;
}) {
  const tokenLabel = tokenGroup === "chart" ? "Chart tokens" : "Theme tokens";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[min(90dvh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-border border-b px-6 py-4">
          <DialogTitle>{tokenLabel}</DialogTitle>
          <DialogDescription>
            Copy these CSS variables into{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
              bklit-tokens.css
            </code>{" "}
            for {resolvedTheme} mode.
          </DialogDescription>
        </DialogHeader>
        <div className="relative min-h-0 flex-1 overflow-auto">
          <div className="absolute top-3 right-3 z-10">
            <StudioCopyButton aria-label="Copy CSS" text={cssBlock} />
          </div>
          <div className="p-6 pt-10">
            {renderHighlightedCode ? (
              renderHighlightedCode(cssBlock)
            ) : (
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
                {cssBlock}
              </pre>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CatalogThemePanel({
  renderHighlightedCode,
}: {
  renderHighlightedCode?: (code: string) => ReactNode;
}) {
  const {
    open,
    toggleOpen,
    tokenGroup,
    setTokenGroup,
    resolvedTheme,
    shadcnTokens,
    chartTokens,
    setShadcnToken,
    setChartToken,
    resetTokens,
    cssBlock,
  } = useCatalogTheme();
  const [codeOpen, setCodeOpen] = useState(false);

  const tokenRows =
    tokenGroup === "chart"
      ? BKLIT_CHART_THEME_TOKEN_NAMES.map((name) => ({
          name,
          value: chartTokens[name],
          onChange: (value: string) => setChartToken(name, value),
        }))
      : BKLIT_SHADCN_THEME_TOKEN_NAMES.map((name) => ({
          name,
          value: shadcnTokens[name],
          onChange: (value: string) => setShadcnToken(name, value),
        }));

  return (
    <>
      <aside
        className="sticky top-14 z-20 flex h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-border border-r bg-card"
        style={{ width: open ? PANEL_WIDTH : PANEL_COLLAPSED_WIDTH }}
      >
        {open ? (
          <>
            <div className="flex flex-col gap-2.5 border-border border-b px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className={studioSectionLabelClass}>Theme</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">
                    {resolvedTheme} mode
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    aria-label="Reset theme tokens"
                    onClick={resetTokens}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <Icon
                      className="size-3.5"
                      name="IconArrowRotateLeftRight"
                    />
                  </Button>
                  <Button
                    aria-label="Collapse theme panel"
                    onClick={toggleOpen}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <Icon className="size-3.5" name="IconChevronLeft" />
                  </Button>
                </div>
              </div>

              <StudioToggleGroup
                layout="segmented"
                onValueChange={(value) =>
                  setTokenGroup(value as CatalogThemeTokenGroup)
                }
                value={tokenGroup}
              >
                <StudioToggleGroupItem value="shadcn">
                  Shadcn
                </StudioToggleGroupItem>
                <StudioToggleGroupItem value="chart">
                  Charts
                </StudioToggleGroupItem>
              </StudioToggleGroup>
            </div>

            <StudioScrollArea
              className={cn("min-h-0 flex-1", studioSidebarScrollClass)}
            >
              <div className="flex flex-col gap-3 px-3 py-3">
                {tokenRows.map(({ name, value, onChange }) => (
                  <ThemeTokenRow
                    key={name}
                    name={name}
                    onChange={onChange}
                    value={value}
                  />
                ))}
              </div>
            </StudioScrollArea>

            <div className="border-border border-t p-3">
              <Button
                className="w-full font-mono text-[11px]"
                onClick={() => setCodeOpen(true)}
                type="button"
              >
                Get code_
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center py-3">
            <Button
              aria-label="Expand theme panel"
              className="mb-3"
              onClick={toggleOpen}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <Icon className="size-3.5" name="IconChevronRight" />
            </Button>
            <span
              className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider [writing-mode:vertical-lr]"
              title="Theme tokens"
            >
              Theme
            </span>
          </div>
        )}
      </aside>

      <CatalogThemeCodeDialog
        cssBlock={cssBlock}
        onOpenChange={setCodeOpen}
        open={codeOpen}
        renderHighlightedCode={renderHighlightedCode}
        resolvedTheme={resolvedTheme}
        tokenGroup={tokenGroup}
      />
    </>
  );
}
