"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsiblePrimitive,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TabsContent } from "@/components/ui/tabs";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";
import { CodeTabs } from "./code-tabs";
import { PackageManagerTabs } from "./package-manager-tabs";

interface RegistryFile {
  path: string;
  content: string;
  type: string;
  target: string;
}

interface RegistryData {
  name: string;
  dependencies?: string[];
  files: RegistryFile[];
}

interface InstallationTabsProps {
  name: string;
  dependencies?: string[];
}

function CodeFileBlock({
  file,
  defaultOpen = false,
}: {
  file: RegistryFile;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Title bar + expand fade adapted from coss ui code-collapsible-wrapper
  // (https://coss.com/ui, MIT).
  return (
    <Collapsible
      className="group/collapsible relative overflow-hidden rounded-xl border border-border bg-code text-code-foreground"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <div className="relative z-10 flex min-h-11 items-center justify-between gap-3 border-border/64 border-b ps-4 pe-1.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[0.8125rem]">
          <span className="shrink-0 text-muted-foreground text-xs">TS</span>
          <span className="truncate text-foreground">{file.target}</span>
        </div>
        <CollapsibleTrigger
          render={
            <Button
              className="text-muted-foreground"
              size="sm"
              variant="ghost"
            />
          }
        >
          {isOpen ? "Collapse" : "Expand"}
        </CollapsibleTrigger>
      </div>

      {/* Unstyled, always-rendered panel: collapsed state is a max-height peek (coss pattern) */}
      <CollapsiblePrimitive.Panel
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "data-closed:max-h-64",
          "[&_figure]:!my-0 [&_figure]:!rounded-none [&_figure]:!border-0 [&_figure]:!bg-transparent [&_figure]:!shadow-none",
          "[&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0",
          "[&_[data-rehype-pretty-code-figure]]:!mt-0"
        )}
        hidden={false}
        keepMounted
      >
        <DynamicCodeBlock
          code={file.content}
          lang="tsx"
          options={{ themes: codeThemes }}
        />
      </CollapsiblePrimitive.Panel>

      {isOpen ? null : (
        <CollapsibleTrigger className="absolute inset-x-0 bottom-0 z-10 flex h-20 cursor-pointer items-end justify-center bg-linear-to-b from-transparent via-50% via-code to-code pb-3 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground">
          Expand
        </CollapsibleTrigger>
      )}
    </Collapsible>
  );
}

function CodeFilesContent({
  files,
  loading,
  name,
}: {
  files: RegistryFile[];
  loading: boolean;
  name: string;
}) {
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-muted/40">
        <span className="text-muted-foreground text-sm">
          Loading component source...
        </span>
      </div>
    );
  }

  if (files.length > 0) {
    return (
      <>
        {files.map((file) => (
          <CodeFileBlock defaultOpen={false} file={file} key={file.path} />
        ))}
      </>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Visit the{" "}
      <a
        className="font-medium underline underline-offset-4"
        href={`https://ui.bklit.com/r/${name}.json`}
        rel="noopener noreferrer"
        target="_blank"
      >
        registry file
      </a>{" "}
      to view the component source code.
    </p>
  );
}

export function InstallationTabs({
  name,
  dependencies,
}: InstallationTabsProps) {
  const [registryData, setRegistryData] = useState<RegistryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [installTab, setInstallTab] = useState<"cli" | "manual">("cli");

  useEffect(() => {
    if (installTab !== "manual") {
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchRegistry() {
      try {
        const res = await fetch(`/r/${name}.json`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setRegistryData(data);
          }
        }
      } catch {
        // Silently fail - we'll use the provided dependencies prop as fallback
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRegistry();

    return () => {
      cancelled = true;
    };
  }, [installTab, name]);

  // Use registry dependencies if available, otherwise fall back to prop
  const deps = registryData?.dependencies || dependencies || [];
  const files = registryData?.files || [];

  return (
    <CodeTabs onTabChange={setInstallTab}>
      <TabsContent value="cli">
        <PackageManagerTabs name={name} />
      </TabsContent>
      <TabsContent value="manual">
        <div className="mt-4">
          <Steps>
            <Step>
              <h4 className="font-medium">
                Install the following dependencies:
              </h4>
              {deps.length > 0 ? (
                <PackageManagerTabs name={`__deps:${deps.join(" ")}`} />
              ) : (
                <p className="mt-2 text-muted-foreground text-sm">
                  No additional dependencies required.
                </p>
              )}
            </Step>

            <Step>
              <h4 className="font-medium">
                Copy and paste the following code into your project.
              </h4>
              <div className="mt-3 space-y-3">
                <CodeFilesContent files={files} loading={loading} name={name} />
              </div>
            </Step>

            <Step>
              <h4 className="font-medium">
                Update the import paths to match your project setup.
              </h4>
            </Step>
          </Steps>
        </div>
      </TabsContent>
    </CodeTabs>
  );
}
