"use client";

import { Icon } from "@bklitui/icons";
import { type ReactNode, useMemo, useState } from "react";
import { StudioCopyButton } from "@/components/studio-copy-button";
import { generateStudioCode } from "@/lib/codegen";
import { generateStudioPrompt } from "@/lib/prompt-gen";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { cn } from "@/lib/utils";
import { useStudioAnalytics } from "@/providers/studio-analytics-context";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";

/** Scrollable code card sunk below the drawer surface. */
const codeCardClass =
  "max-h-80 overflow-auto overscroll-contain rounded-xl border bg-[color-mix(in_srgb,var(--popover),var(--color-black)_3%)] p-4 font-mono text-xs dark:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_32%)]";

type TriggerSize = "sm" | "lg";

function triggerButtonClass(size: TriggerSize, className?: string) {
  return cn(
    "flex-1",
    size === "sm"
      ? "font-mono text-xs sm:text-xs"
      : "h-10 px-4 font-mono text-[11px] sm:h-10 sm:text-[11px]",
    className
  );
}

/** Side-by-side Code + Prompt export buttons, each opening its own sheet. */
export function StudioCodeSheetTrigger({
  className,
  ...props
}: StudioCodeSheetProps & { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StudioCodeSheet {...props} />
      <StudioPromptSheet
        headerActions={props.headerActions}
        state={props.state}
        triggerClassName={props.triggerClassName}
        triggerSize={props.triggerSize}
      />
    </div>
  );
}

interface StudioCodeSheetProps {
  state: StudioUrlState;
  headerActions?: ReactNode;
  triggerClassName?: string;
  triggerSize?: TriggerSize;
  installSection?: ReactNode;
  renderUsageCode?: (code: string) => ReactNode;
  renderDataCode?: (data: string | undefined) => ReactNode;
}

function StudioCodeSheet({
  state,
  headerActions,
  installSection,
  renderUsageCode,
  renderDataCode,
  triggerClassName,
  triggerSize = "lg",
}: StudioCodeSheetProps) {
  const { track, getUrl } = useStudioAnalytics();
  const [open, setOpen] = useState(false);
  const generated = useMemo(
    () => generateStudioCode(state.chart, state),
    [state]
  );
  const { code, data, title } = generated;

  return (
    <Sheet
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          track?.("studio_get_code", {
            chart: state.chart,
            url: getUrl?.(),
          });
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <SheetTrigger
        render={
          <Button
            className={triggerButtonClass(triggerSize, triggerClassName)}
            size={triggerSize}
            type="button"
            variant="default"
          />
        }
      >
        Code
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex flex-col gap-3 pr-8">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Install, then copy the snippet — props match your committed
                studio settings.
              </SheetDescription>
            </div>
            {headerActions ? (
              <div className="flex flex-wrap items-center gap-2">
                {headerActions}
              </div>
            ) : null}
          </div>
        </SheetHeader>
        {open ? (
          <div className="space-y-6 px-6 pb-6">
            <Alert>
              <Icon className="size-4" name="IconCircleInfo" />
              <AlertTitle>Motion settings not in snippet yet</AlertTitle>
              <AlertDescription>
                Enter animations from the Motion panel are not included in this
                code export yet. They will be added in a future update — copy
                duration and easing from the studio when wiring your chart.
              </AlertDescription>
            </Alert>
            {installSection ? (
              <section className="space-y-2">
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Install
                </h3>
                {installSection}
              </section>
            ) : null}
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Usage
              </h3>
              {renderUsageCode ? (
                renderUsageCode(code)
              ) : (
                <pre className={codeCardClass}>{code}</pre>
              )}
            </section>
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Data
              </h3>
              {renderDataCode ? (
                renderDataCode(data)
              ) : (
                <pre className={codeCardClass}>
                  {data ??
                    "// Example data for this chart is not available yet."}
                </pre>
              )}
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function StudioPromptSheet({
  state,
  headerActions,
  triggerClassName,
  triggerSize = "lg",
}: Pick<
  StudioCodeSheetProps,
  "state" | "headerActions" | "triggerClassName" | "triggerSize"
>) {
  const { track, getUrl } = useStudioAnalytics();
  const [open, setOpen] = useState(false);
  const prompt = useMemo(
    () => (open ? generateStudioPrompt(state) : ""),
    [open, state]
  );

  return (
    <Sheet
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          track?.("studio_get_prompt", {
            chart: state.chart,
            url: getUrl?.(),
          });
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <SheetTrigger
        render={
          <Button
            className={triggerButtonClass(triggerSize, triggerClassName)}
            size={triggerSize}
            type="button"
            variant="outline"
          />
        }
      >
        Prompt
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div className="flex flex-col gap-3 pr-8">
            <div>
              <SheetTitle>Prompt</SheetTitle>
              <SheetDescription>
                Paste into Claude Code, Cursor, v0 or any coding agent to
                recreate this exact chart — install steps, every changed
                setting, and the generated code.
              </SheetDescription>
            </div>
            {headerActions ? (
              <div className="flex flex-wrap items-center gap-2">
                {headerActions}
              </div>
            ) : null}
          </div>
        </SheetHeader>
        {open ? (
          <div className="space-y-6 px-6 pb-6">
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Prompt
                </h3>
                <StudioCopyButton
                  aria-label="Copy prompt"
                  onCopied={() =>
                    track?.("studio_copy_prompt", {
                      chart: state.chart,
                      url: getUrl?.(),
                    })
                  }
                  text={prompt}
                />
              </div>
              <pre
                className={cn(
                  codeCardClass,
                  "max-h-[60dvh] whitespace-pre-wrap break-words"
                )}
              >
                {prompt}
              </pre>
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
