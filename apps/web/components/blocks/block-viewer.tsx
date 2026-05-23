"use client";

import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Monitor, Smartphone, Terminal } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { BlockFileTree } from "@/components/blocks/block-file-tree";
import { CopyButton } from "@/components/copy-button";
import { V0Icon } from "@/components/icons/v0";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  blockOpenInV0Href,
  blockShadcnAddCommand,
} from "@/lib/blocks/block-links";
import { getDefaultSelectedFile } from "@/lib/blocks/build-file-tree";
import type { BlockDefinition } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

const BlockCodeBlock = dynamic(
  () =>
    import("@/components/blocks/block-code-block").then(
      (mod) => mod.BlockCodeBlock
    ),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-lg border bg-muted/30 p-4 font-mono text-muted-foreground text-sm">
        Loading…
      </div>
    ),
  }
);

type BlockView = "preview" | "code";
type BlockViewport = "desktop" | "mobile";

const DEFAULT_PREVIEW_HEIGHT = 720;
const DEFAULT_MOBILE_WIDTH = 390;

function DeviceToggle({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button
          aria-label={label}
          aria-pressed={active}
          className={cn("size-8", active && "bg-muted text-foreground")}
          onClick={onClick}
          size="icon"
          type="button"
          variant="ghost"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function BlockViewer({
  name,
  description,
  registryName,
  files,
  preview,
  previewHeight = DEFAULT_PREVIEW_HEIGHT,
  mobilePreviewWidth = DEFAULT_MOBILE_WIDTH,
}: BlockDefinition) {
  const [view, setView] = useState<BlockView>("preview");
  const [viewport, setViewport] = useState<BlockViewport>("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const defaultFile = useMemo(() => getDefaultSelectedFile(files), [files]);
  const [selectedPath, setSelectedPath] = useState(
    () => defaultFile?.path ?? files[0]?.path ?? ""
  );

  const selectedFile =
    files.find((file) => file.path === selectedPath) ?? defaultFile ?? files[0];
  const installCommand = blockShadcnAddCommand(registryName);

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-xl border border-border bg-card/70">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Tabs
              className="shrink-0"
              onValueChange={(value) => setView(value as BlockView)}
              value={view}
            >
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
            </Tabs>

            <p className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-nowrap">
            {view === "preview" ? (
              <div className="flex items-center gap-0.5 rounded-md border border-border/60 bg-muted/20 p-0.5">
                <DeviceToggle
                  active={viewport === "desktop"}
                  label="Desktop"
                  onClick={() => setViewport("desktop")}
                >
                  <Monitor />
                </DeviceToggle>
                <DeviceToggle
                  active={viewport === "mobile"}
                  label="Mobile"
                  onClick={() => setViewport("mobile")}
                >
                  <Smartphone />
                </DeviceToggle>
              </div>
            ) : null}

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
                  <HugeiconsIcon
                    icon={Refresh01Icon}
                    size={16}
                    strokeWidth={1.75}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restart animation</TooltipContent>
            </Tooltip>

            <div className="hidden h-9 min-w-0 max-w-[300px] items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 font-mono text-[11px] text-muted-foreground lg:flex">
              <Terminal className="size-3.5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{installCommand}</span>
              <CopyButton
                aria-label="Copy install command"
                className="size-7 shrink-0"
                text={installCommand}
              />
            </div>

            <Button asChild className="gap-1.5 px-3 text-xs" variant="white">
              <a
                href={blockOpenInV0Href(registryName)}
                rel="noreferrer"
                target="_blank"
              >
                Open in <V0Icon className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        {view === "preview" ? (
          <div
            className="studio-preview-canvas flex items-center justify-center overflow-auto border-t px-6 py-[90px]"
            style={{ height: previewHeight }}
          >
            <div
              className={cn(
                "flex w-full items-center justify-center transition-[max-width] duration-300 ease-out",
                viewport === "mobile" && "mx-auto"
              )}
              key={previewKey}
              style={{
                maxWidth:
                  viewport === "mobile" ? mobilePreviewWidth : undefined,
              }}
            >
              {preview}
            </div>
          </div>
        ) : (
          <div
            className="grid min-h-0 grid-cols-1 overflow-hidden border-t lg:grid-cols-[240px_minmax(0,1fr)]"
            style={{ height: previewHeight }}
          >
            <BlockFileTree
              files={files}
              onSelect={setSelectedPath}
              selectedPath={selectedPath}
            />

            <div className="flex h-full min-h-0 min-w-0 flex-col">
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between gap-3 border-border border-b px-4 py-2.5">
                    <p className="truncate font-mono text-muted-foreground text-xs">
                      {selectedFile.path}
                    </p>
                    <CopyButton
                      aria-label="Copy file"
                      text={selectedFile.content}
                    />
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto">
                    <BlockCodeBlock
                      code={selectedFile.content}
                      lang={selectedFile.language ?? "tsx"}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
                  No files available.
                </div>
              )}
            </div>
          </div>
        )}

        <span className="sr-only">{name}</span>
      </div>
    </TooltipProvider>
  );
}
