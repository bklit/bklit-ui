"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useMemo, useState } from "react";
import { generateStudioCode } from "@/lib/codegen";
import type { StudioUrlState } from "@/lib/studio-parsers";
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

export function StudioCodeSheetTrigger({
  state,
  headerActions,
  installSection,
  renderUsageCode,
  renderDataCode,
}: {
  state: StudioUrlState;
  headerActions?: ReactNode;
  installSection?: ReactNode;
  renderUsageCode?: (code: string) => ReactNode;
  renderDataCode?: (data: string | undefined) => ReactNode;
}) {
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
            className="h-10 px-4 font-mono text-[11px]"
            type="button"
            variant="white"
          />
        }
      >
        Get code_
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
            <Alert variant="indigo">
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
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
                <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs">
                  {code}
                </pre>
              )}
            </section>
            <section className="space-y-2">
              <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Data
              </h3>
              {renderDataCode ? (
                renderDataCode(data)
              ) : (
                <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs">
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
