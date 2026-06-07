"use client";

import { Share03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ParticleBadge } from "@/components/onboarding/particle-badge";
import { StudioShareCopyField } from "@/components/studio-share-copy-field";
import { useStudioToolbarTooltipSide } from "@/components/studio-toolbar-tooltips";
import { useStudioShellState } from "@/components/use-studio-state";
import {
  studioEmbedIframeMarkup,
  studioShareStudioUrl,
} from "@/lib/chart-links";
import { studioRelativeStateHref } from "@/lib/studio-url-codec";
import { studioSerializedParam } from "@/lib/studio-url-loader";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
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
    toast.success(message);
  }, []);

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
                className={cn("size-8", className)}
                size="icon-sm"
                type="button"
                variant="ghost"
              />
            }
          >
            <ParticleBadge>
              <HugeiconsIcon icon={Share03Icon} strokeWidth={1.75} />
            </ParticleBadge>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>Share</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        className="w-[min(24rem,calc(100vw-2rem))] space-y-4 p-4"
        side="top"
        sideOffset={10}
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
