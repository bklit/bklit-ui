"use client";

import { shadcnAddItem } from "@bklitui/studio";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Terminal } from "lucide-react";
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
}

export function PackageManagerTabs({ name }: PackageManagerTabsProps) {
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

  return (
    <figure className="not-prose relative my-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Tabs onValueChange={handleValueChange} value={pm}>
        <div className="flex items-center gap-2 border-border border-b bg-muted/40 px-3 py-1.5">
          <div className="flex size-4 items-center justify-center rounded-[1px] bg-foreground/80">
            <Terminal className="size-3 text-background" />
          </div>
          <TabsList
            className="h-auto gap-0 rounded-none bg-transparent p-0"
            variant="line"
          >
            {(["pnpm", "npm", "yarn", "bun"] as const).map((manager) => (
              <TabsTrigger
                className={cn(
                  "h-7 border border-transparent px-2 pt-0.5 shadow-none",
                  "data-[state=active]:border-border data-[state=active]:bg-background"
                )}
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
                    "my-0 rounded-none border-0 bg-transparent [&_pre]:bg-transparent",
                }}
                lang="bash"
                options={{ themes: codeThemes }}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <CopyButton className="absolute top-2 right-2 z-10" text={command} />
    </figure>
  );
}
