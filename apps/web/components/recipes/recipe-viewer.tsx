"use client";

import { Icon } from "@bklitui/icons";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CODE_PANEL_HEADER_CLASS } from "@/components/blocks/block-code-panel-header";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { buildPrompt, type RecipePromptScope } from "@/lib/recipes/prompts";
import type { Recipe } from "@/lib/recipes/types";
import { cn } from "@/lib/utils";

const BlockCodeBlock = dynamic(
  () =>
    import("@/components/blocks/block-code-block").then(
      (mod) => mod.BlockCodeBlock
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 font-mono text-muted-foreground text-sm">
        Loading…
      </div>
    ),
  }
);

type RecipeView = "preview" | "code" | "prompt";

const PANEL_HEIGHT_CLASS = "h-[380px] md:h-[460px]";

function ScopeToggle({
  scope,
  onScopeChange,
  chartLabel,
}: {
  scope: RecipePromptScope;
  onScopeChange: (scope: RecipePromptScope) => void;
  chartLabel: string;
}) {
  return (
    <Tabs
      onValueChange={(value) => onScopeChange(value as RecipePromptScope)}
      value={scope}
    >
      <TabsList aria-label="Prompt scope" size="sm">
        <TabsTrigger value="chart">{chartLabel} chart</TabsTrigger>
        <TabsTrigger value="all">All charts</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function CopyPromptButton({
  scope,
  onScopeChange,
  chartLabel,
  chartCount,
  getPrompt,
  onCopied,
  onViewPrompt,
}: {
  scope: RecipePromptScope;
  onScopeChange: (scope: RecipePromptScope) => void;
  chartLabel: string;
  chartCount: number;
  getPrompt: (scope: RecipePromptScope) => string;
  onCopied: (scope: RecipePromptScope) => void;
  onViewPrompt: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const copy = useCallback(
    async (target: RecipePromptScope) => {
      try {
        await navigator.clipboard.writeText(getPrompt(target));
      } catch {
        // Clipboard permission denied (e.g. insecure context) — "View prompt" still works.
        return;
      }
      onCopied(target);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    },
    [getPrompt, onCopied]
  );

  const multiChart = chartCount > 1;

  return (
    <div className="inline-flex" data-slot="copy-prompt">
      <Button
        aria-label={
          scope === "all"
            ? "Copy prompt for all charts"
            : `Copy prompt for the ${chartLabel.toLowerCase()} chart`
        }
        className="rounded-e-none before:rounded-e-none"
        onClick={() => copy(scope)}
        size="sm"
        type="button"
        variant="outline"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy prompt"}</span>
        {multiChart ? (
          <span className="rounded-sm bg-muted px-1 font-normal text-[11px] text-muted-foreground leading-4">
            {scope === "all" ? "All" : chartLabel}
          </span>
        ) : null}
      </Button>
      <Menu>
        <MenuTrigger
          render={
            <Button
              aria-label="Prompt options"
              className="-ms-px rounded-s-none px-1.5 before:rounded-s-none"
              size="sm"
              type="button"
              variant="outline"
            />
          }
        >
          <Icon className="size-4" name="IconChevronDownSmall" />
        </MenuTrigger>
        <MenuPopup align="end" className="min-w-52">
          {multiChart ? (
            <>
              <MenuGroup>
                <MenuGroupLabel>Prompt for</MenuGroupLabel>
                <MenuRadioGroup
                  onValueChange={(value) =>
                    onScopeChange(value as RecipePromptScope)
                  }
                  value={scope}
                >
                  <MenuRadioItem value="chart">
                    This chart ({chartLabel})
                  </MenuRadioItem>
                  <MenuRadioItem value="all">
                    All charts ({chartCount})
                  </MenuRadioItem>
                </MenuRadioGroup>
              </MenuGroup>
              <MenuSeparator />
              <MenuItem onClick={() => copy("chart")}>
                Copy {chartLabel.toLowerCase()} chart prompt
              </MenuItem>
              <MenuItem onClick={() => copy("all")}>
                Copy all-charts prompt
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={() => copy("chart")}>Copy prompt</MenuItem>
          )}
          <MenuSeparator />
          <MenuItem onClick={onViewPrompt}>View prompt</MenuItem>
        </MenuPopup>
      </Menu>
    </div>
  );
}

export function RecipeViewer({ recipe }: { recipe: Recipe }) {
  const [view, setView] = useState<RecipeView>("preview");
  const [chartId, setChartId] = useState(recipe.charts[0]?.id ?? "");
  const [scope, setScope] = useState<RecipePromptScope>("chart");
  const [previewKey, setPreviewKey] = useState(0);
  const multiChart = recipe.charts.length > 1;
  const effectiveScope: RecipePromptScope = multiChart ? scope : "chart";

  const chart =
    recipe.charts.find((item) => item.id === chartId) ?? recipe.charts[0];

  const getPrompt = useCallback(
    (target: RecipePromptScope) =>
      chart ? buildPrompt(recipe, chart, target) : "",
    [recipe, chart]
  );
  const prompt = useMemo(
    () => getPrompt(effectiveScope),
    [getPrompt, effectiveScope]
  );

  const handleCopied = useCallback(
    (target: RecipePromptScope) => {
      trackEvent("recipes_copy_prompt", {
        recipe: recipe.id,
        chart: chart?.id,
        scope: target,
        url: getAnalyticsUrl(),
      });
    },
    [recipe.id, chart?.id]
  );

  if (!chart) {
    return null;
  }

  const { Preview } = chart;

  return (
    <TooltipProvider>
      <article
        aria-labelledby={`${recipe.id}-title`}
        className="flex scroll-mt-[calc(var(--site-header-height)+1rem)] flex-col gap-4"
        id={recipe.id}
      >
        <header className="flex flex-col gap-1 px-1">
          <h3
            className="font-heading font-semibold text-foreground text-xl tracking-tight"
            id={`${recipe.id}-title`}
          >
            <a className="hover:underline" href={`#${recipe.id}`}>
              {recipe.title}
            </a>
          </h3>
          <p className="text-muted-foreground text-sm">{recipe.description}</p>
        </header>

        <Frame className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 px-2 py-2 sm:px-3">
            <Tabs
              className="shrink-0"
              onValueChange={(value) => setView(value as RecipeView)}
              value={view}
            >
              <TabsList aria-label="View">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
              </TabsList>
            </Tabs>

            {multiChart ? (
              <Tabs
                className="shrink-0"
                onValueChange={(value) => setChartId(value as string)}
                value={chart.id}
              >
                <TabsList aria-label="Chart type" variant="underline">
                  {recipe.charts.map((item) => (
                    <TabsTrigger key={item.id} value={item.id}>
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            ) : null}

            <div className="ms-auto flex shrink-0 items-center gap-1.5">
              {view === "preview" ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button
                      aria-label="Restart animation"
                      className="size-8"
                      onClick={() => setPreviewKey((key) => key + 1)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Icon
                        className="size-4"
                        name="IconArrowRotateClockwise"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipPopup>Restart animation</TooltipPopup>
                </Tooltip>
              ) : null}

              <CopyPromptButton
                chartCount={recipe.charts.length}
                chartLabel={chart.label}
                getPrompt={getPrompt}
                onCopied={handleCopied}
                onScopeChange={setScope}
                onViewPrompt={() => setView("prompt")}
                scope={effectiveScope}
              />
            </div>
          </div>

          <FramePanel className="overflow-hidden p-0">
            {view === "preview" ? (
              <div
                className={cn(
                  "studio-preview-canvas flex items-center justify-center overflow-hidden rounded-[calc(var(--radius-xl)-1px)] px-3 py-8 sm:px-8 md:px-12",
                  PANEL_HEIGHT_CLASS
                )}
              >
                <div
                  className="w-full max-w-3xl"
                  key={`${chart.id}-${previewKey}`}
                >
                  <Preview />
                </div>
              </div>
            ) : null}

            {view === "code" ? (
              <div className={cn("flex min-h-0 flex-col", PANEL_HEIGHT_CLASS)}>
                <div
                  className={cn(
                    CODE_PANEL_HEADER_CLASS,
                    "justify-between gap-3"
                  )}
                >
                  <p className="truncate font-mono text-muted-foreground text-xs">
                    {`${recipe.id}-${chart.id}-chart.tsx`}
                  </p>
                  <CopyButton aria-label="Copy code" text={chart.code} />
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  <BlockCodeBlock code={chart.code} lang="tsx" />
                </div>
              </div>
            ) : null}

            {view === "prompt" ? (
              <div className={cn("flex min-h-0 flex-col", PANEL_HEIGHT_CLASS)}>
                <div
                  className={cn(
                    CODE_PANEL_HEADER_CLASS,
                    "h-auto min-h-10 flex-wrap justify-between gap-2 py-1.5"
                  )}
                >
                  {multiChart ? (
                    <ScopeToggle
                      chartLabel={chart.label}
                      onScopeChange={setScope}
                      scope={effectiveScope}
                    />
                  ) : (
                    <p className="font-mono text-muted-foreground text-xs">
                      {`${recipe.id}-prompt.md`}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <p className="hidden text-muted-foreground text-xs sm:block">
                      For agents using the{" "}
                      <a
                        className="underline underline-offset-2 hover:text-foreground"
                        href="/docs/skills"
                      >
                        bklit-ui skills
                      </a>
                    </p>
                    <CopyButton aria-label="Copy prompt" text={prompt} />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] text-foreground/88 leading-relaxed">
                    {prompt}
                  </pre>
                </div>
              </div>
            ) : null}
          </FramePanel>
        </Frame>
      </article>
    </TooltipProvider>
  );
}
