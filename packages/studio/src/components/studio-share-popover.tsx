"use client";

import { Icon } from "@bklitui/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StudioShareCopyField } from "@/components/studio-share-copy-field";
import {
  useStudioToolbarMounted,
  useStudioToolbarTooltipSide,
} from "@/components/studio-toolbar-tooltips";
import { useStudioShellState } from "@/components/use-studio-state";
import {
  studioEmbedIframeMarkup,
  studioShareStudioUrl,
} from "@/lib/chart-links";
import { studioRelativeStateHref } from "@/lib/studio-url-codec";
import { studioSerializedParam } from "@/lib/studio-url-loader";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { toastManager } from "@/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip";

export function StudioSharePopover({
  className,
  onOpenChange,
}: {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const { state } = useStudioShellState();
  const [open, setOpen] = useState(false);
  const toolbarMounted = useStudioToolbarMounted();
  const tooltipSide = useStudioToolbarTooltipSide();

  const [pageOrigin, setPageOrigin] = useState<string | null>(null);

  useEffect(() => {
    setPageOrigin(window.location.origin);
  }, []);

  const studioUrl = useMemo(
    () =>
      pageOrigin
        ? studioShareStudioUrl(state, pageOrigin)
        : studioRelativeStateHref(state),
    [pageOrigin, state]
  );
  const embedMarkup = useMemo(
    () =>
      pageOrigin
        ? studioEmbedIframeMarkup(state, { origin: pageOrigin })
        : studioEmbedIframeMarkup(state),
    [pageOrigin, state]
  );

  const prefetchOgImage = useCallback(() => {
    const origin = pageOrigin ?? window.location.origin;
    const ogUrl = new URL("/api/og/studio", origin);
    ogUrl.searchParams.set("s", studioSerializedParam(state));
    fetch(ogUrl.toString()).catch(() => undefined);
  }, [pageOrigin, state]);

  const notifyCopied = useCallback((message: string) => {
    toastManager.add({ title: message, type: "success" });
  }, []);

  const shareButton = (
    <Button
      aria-label="Share chart"
      className={className}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Icon className="size-4" name="IconShareOs" />
    </Button>
  );

  if (!toolbarMounted) {
    return shareButton;
  }

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        onOpenChange?.(nextOpen);
      }}
      open={open}
    >
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <PopoverTrigger
            render={
              <Button
                aria-expanded={open}
                aria-label="Share chart"
                className={className}
                size="icon"
                type="button"
                variant="ghost"
              />
            }
          >
            <Icon className="size-4" name="IconShareOs" />
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>Share</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        className="w-[min(24rem,calc(100vw-2rem))]"
        side="top"
        sideOffset={10}
        viewportClassName="flex flex-col gap-4 p-4"
      >
        <p className="font-medium text-sm">Share chart</p>

        <StudioShareCopyField
          id="studio-share-link"
          label="Studio link"
          onCopied={() => {
            prefetchOgImage();
            notifyCopied("Studio link copied to clipboard");
          }}
          value={studioUrl}
        />

        <StudioShareCopyField
          id="studio-share-embed"
          label="Embed code"
          onCopied={() => notifyCopied("Embed code copied to clipboard")}
          value={embedMarkup}
        />
      </PopoverContent>
    </Popover>
  );
}
