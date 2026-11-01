"use client";

import { Icon } from "@bklitui/icons";
import { StudioControlGroup } from "@/components/studio-control-group";
import { supportsStudioExportFeatures } from "@/lib/studio-runtime";
import { Button } from "@/ui/button";

export function EditorExportSection({
  controlsDisabled = false,
  onExportSvg,
}: {
  controlsDisabled?: boolean;
  onExportSvg: () => void;
}) {
  if (!supportsStudioExportFeatures()) {
    return null;
  }

  return (
    <StudioControlGroup
      className="shrink-0 border-border/60 border-t px-3 pb-3"
      collapsible
      defaultOpen={false}
      title="Export"
    >
      <Button
        className="w-full"
        disabled={controlsDisabled}
        onClick={onExportSvg}
        type="button"
      >
        <Icon className="mr-2 size-4" name="IconFileDownload" />
        Export SVG
      </Button>
    </StudioControlGroup>
  );
}
