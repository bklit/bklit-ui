"use client";

import {
  type ChartPalette,
  chartPaletteToCss,
} from "@bklitui/studio/chart-palettes";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@bklitui/studio/ui/dialog";
import { useMemo } from "react";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";

export function ChartThemeExportDialog({
  theme,
  open,
  onOpenChange,
}: {
  theme: ChartPalette;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const css = useMemo(() => chartPaletteToCss(theme), [theme]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Export {theme.name} palette</DialogTitle>
          <DialogDescription className="[&_code]:font-mono [&_code]:text-foreground">
            Paste into your global CSS. Charts read <code>--chart-1</code> …{" "}
            <code>--chart-5</code> for series and <code>--chart-positive</code>{" "}
            / <code>--chart-negative</code> for up / down values.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <DocsCodeBlock
            className="rounded-lg border bg-muted/40"
            code={css}
            lang="css"
          />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
