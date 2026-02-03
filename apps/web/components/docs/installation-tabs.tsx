"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
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

  return (
    <Collapsible
      className="group/collapsible relative overflow-hidden rounded-lg border border-fd-border"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      {/* Header with filename */}
      <div className="flex items-center justify-between border-fd-border border-b bg-fd-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-fd-muted-foreground text-xs">TS</span>
          <span className="font-mono text-sm">{file.target}</span>
        </div>
        <CollapsibleTrigger className="font-medium text-fd-muted-foreground text-xs hover:text-fd-foreground">
          {isOpen ? "Collapse" : "Expand"}
        </CollapsibleTrigger>
      </div>

      {/* Code content */}
      <CollapsibleContent
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "data-[state=closed]:max-h-[180px]",
          "[&_figure]:!my-0 [&_figure]:!rounded-none [&_figure]:!border-0",
          "[&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0",
          "[&_[data-rehype-pretty-code-figure]]:!mt-0"
        )}
        forceMount
      >
        <DynamicCodeBlock
          code={file.content}
          lang="tsx"
          options={{ themes: codeThemes }}
        />
      </CollapsibleContent>

      {/* Gradient overlay when collapsed */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-16",
          "bg-gradient-to-t from-fd-secondary via-fd-secondary/80 to-transparent",
          "group-data-[state=open]/collapsible:hidden"
        )}
      />
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
      <div className="flex h-24 items-center justify-center rounded-lg border border-fd-border bg-fd-muted/30">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegistry() {
      try {
        const res = await fetch(`/r/${name}.json`);
        if (res.ok) {
          const data = await res.json();
          setRegistryData(data);
        }
      } catch {
        // Silently fail - we'll use the provided dependencies prop as fallback
      } finally {
        setLoading(false);
      }
    }

    fetchRegistry();
  }, [name]);

  // Use registry dependencies if available, otherwise fall back to prop
  const deps = registryData?.dependencies || dependencies || [];
  const files = registryData?.files || [];

  return (
    <CodeTabs>
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
