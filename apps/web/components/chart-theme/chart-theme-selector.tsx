"use client";

import { Icon } from "@bklitui/icons";
import {
  ChartPaletteEditor,
  ChartPaletteStrip,
} from "@bklitui/studio/chart-palette-editor";
import type { ChartPalette } from "@bklitui/studio/chart-palettes";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChartThemeExportDialog } from "@/components/chart-theme/chart-theme-export-dialog";
import { useChartTheme } from "@/components/chart-theme/chart-theme-provider";
import { ChartThemeSwatchIcon } from "@/components/chart-theme/chart-theme-swatch-icon";
import { Button } from "@/components/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { CUSTOM_CHART_THEME_ID } from "@/lib/chart-themes";
import { cn } from "@/lib/utils";

const STRIP_VARS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

/**
 * Back dots get a transparent gap punched out where the next dot overlaps, so
 * the strip looks the same on the popover and on a hovered (`bg-accent`) row.
 * Next dot centre: size 10px − overlap 4px + radius 5px = 11px; gap 1.5px.
 */
const STRIP_DOT_CLASS =
  "shadow-none not-last:[mask-image:radial-gradient(circle_at_11px_50%,transparent_6.25px,#000_6.75px)]";

/** Strong ease-out — UI responds instantly, then settles. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const HEIGHT_TRANSITION: Transition = { duration: 0.22, ease: EASE_OUT };
const VIEW_ENTER_TRANSITION: Transition = { duration: 0.2, ease: EASE_OUT };
const VIEW_EXIT_TRANSITION: Transition = { duration: 0.12, ease: EASE_OUT };
const VIEW_OFFSET_PX = 24;

type View = "list" | "customize";

const viewVariants = {
  enter: ({ direction, reduce }: { direction: number; reduce: boolean }) => ({
    opacity: 0,
    x: reduce ? 0 : direction * VIEW_OFFSET_PX,
    filter: reduce ? "blur(0px)" : "blur(2px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: VIEW_ENTER_TRANSITION,
  },
  exit: ({ direction, reduce }: { direction: number; reduce: boolean }) => ({
    opacity: 0,
    x: reduce ? 0 : direction * -VIEW_OFFSET_PX,
    filter: reduce ? "blur(0px)" : "blur(2px)",
    transition: VIEW_EXIT_TRANSITION,
  }),
};

function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry?.borderBoxSize[0]?.blockSize ?? node.offsetHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}

/**
 * Animates popover height between views and slides/crossfades the content.
 * The negative margin + padding pair gives focus rings room inside the clip.
 */
function AnimatedViews({
  view,
  direction,
  children,
}: {
  view: View;
  direction: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const [measureRef, height] = useMeasuredHeight<HTMLDivElement>();
  const custom = { direction, reduce };

  return (
    <motion.div
      animate={{ height: height ?? "auto" }}
      className="-mx-1 -my-3 overflow-hidden"
      initial={false}
      transition={reduce ? { duration: 0 } : HEIGHT_TRANSITION}
    >
      <div className="relative p-1" ref={measureRef}>
        <AnimatePresence custom={custom} initial={false} mode="popLayout">
          <motion.div
            animate="center"
            custom={custom}
            exit="exit"
            initial="enter"
            key={view}
            variants={viewVariants}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

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
      <ChartPaletteStrip
        colors={stripColors(palette, mode)}
        dotClassName={STRIP_DOT_CLASS}
      />
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
  const [view, setView] = useState<View>("list");
  const [direction, setDirection] = useState(1);
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

  const goTo = (next: View) => {
    setDirection(next === "customize" ? 1 : -1);
    setView(next);
  };

  const openExport = () => {
    setOpen(false);
    setExportOpen(true);
  };

  return (
    <>
      <Popover
        onOpenChange={setOpen}
        onOpenChangeComplete={(nextOpen) => {
          // Reset after the exit animation so the closing popover doesn't
          // morph back to the list view on its way out.
          if (!nextOpen) {
            setView("list");
            setDirection(1);
          }
        }}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              aria-label="Chart palette"
              size="default"
              title="Chart palette"
              variant="ghost"
            />
          }
        >
          <ChartThemeSwatchIcon
            colors={stripColors(theme, editMode).slice(0, 3)}
          />
        </PopoverTrigger>
        <PopoverPopup
          align="end"
          className="w-64 text-xs ease-[cubic-bezier(0.23,1,0.32,1)] [--viewport-inline-padding:--spacing(2)] data-ending-style:scale-98 data-starting-style:scale-96 data-ending-style:opacity-0 data-ending-style:duration-100 data-starting-style:duration-200 motion-reduce:data-ending-style:scale-100 motion-reduce:data-starting-style:scale-100"
        >
          <AnimatedViews direction={direction} view={view}>
            {view === "list" ? (
              <div className="flex flex-col gap-1">
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
                    onClick={() => goTo("customize")}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    <Icon name="IconEditSmall1" />
                    Customize
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={openExport}
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
              <div className="flex flex-col gap-3 px-1">
                <div className="flex items-center gap-1">
                  <Button
                    aria-label="Back to palettes"
                    onClick={() => goTo("list")}
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
                  onClick={openExport}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  <Icon name="IconCode" />
                  Export CSS
                </Button>
              </div>
            )}
          </AnimatedViews>
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
