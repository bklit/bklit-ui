"use client";

import { Icon } from "@bklitui/icons";
import { shadcnAddItem } from "@bklitui/studio";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { codeThemes } from "@/lib/code-theme";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bklit-package-manager";

type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

const PM_SHADCN_COMMANDS: Record<PackageManager, string> = {
  pnpm: "pnpm dlx shadcn@latest add",
  npm: "npx shadcn@latest add",
  yarn: "npx shadcn@latest add",
  bun: "bunx --bun shadcn@latest add",
};

const PM_ADD_COMMANDS: Record<PackageManager, string> = {
  pnpm: "pnpm add",
  npm: "npm install",
  yarn: "yarn add",
  bun: "bun add",
};

interface PackageManagerTabsProps {
  name: string;
  className?: string;
}

export function PackageManagerTabs({
  name,
  className,
}: PackageManagerTabsProps) {
  const [pm, setPm] = useState<PackageManager>("pnpm");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as PackageManager | null;
    if (stored && PM_SHADCN_COMMANDS[stored]) {
      setPm(stored);
    }
  }, []);

  const handleValueChange = (newValue: string) => {
    setPm(newValue as PackageManager);
    localStorage.setItem(STORAGE_KEY, newValue);
  };

  const isDepsOnly = name.startsWith("__deps:");
  const depsString = isDepsOnly ? name.replace("__deps:", "") : "";

  const getCommand = (manager: PackageManager) => {
    if (isDepsOnly) {
      return `${PM_ADD_COMMANDS[manager]} ${depsString}`;
    }
    return `${PM_SHADCN_COMMANDS[manager]} ${shadcnAddItem(name)}`;
  };

  const command = getCommand(pm);

  // Adapted from coss ui code-block-command (https://coss.com/ui, MIT).
  return (
    <figure
      className={cn(
        "not-prose relative my-4 overflow-hidden rounded-xl border border-border bg-code text-code-foreground",
        className
      )}
    >
      <Tabs className="gap-0" onValueChange={handleValueChange} value={pm}>
        <div className="flex items-center gap-2 border-border/64 border-b px-3 py-1 font-mono">
          <Icon
            className="size-4 shrink-0 text-muted-foreground"
            name="IconConsole"
          />
          <TabsList className={commandTabsListClassName}>
            {(["pnpm", "npm", "yarn", "bun"] as const).map((manager) => (
              <TabsTrigger
                className="h-7 rounded-lg px-2 font-mono text-[0.8125rem] sm:h-7"
                key={manager}
                value={manager}
              >
                {manager}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="overflow-x-auto">
          {(["pnpm", "npm", "yarn", "bun"] as const).map((manager) => (
            <TabsContent className="mt-0" key={manager} value={manager}>
              <DynamicCodeBlock
                code={getCommand(manager)}
                codeblock={{
                  allowCopy: false,
                  className:
                    "my-0 rounded-none border-0 bg-transparent shadow-none [&_pre]:bg-transparent",
                  viewportProps: { className: "py-3 text-[0.8125rem]" },
                }}
                lang="bash"
                options={{ themes: codeThemes }}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <CopyButton
        className="absolute top-1.5 right-1.5 z-10 opacity-72 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        text={command}
      />
    </figure>
  );
}

/** coss transparent tab list with a soft accent pill indicator. */
export const commandTabsListClassName =
  "gap-0.5 bg-transparent p-0 *:data-[slot=tab-indicator]:rounded-lg *:data-[slot=tab-indicator]:bg-accent *:data-[slot=tab-indicator]:shadow-none dark:*:data-[slot=tab-indicator]:bg-accent";
