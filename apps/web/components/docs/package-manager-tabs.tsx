"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [copied, setCopied] = useState(false);

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

  // Check if this is a dependency-only install (starts with __deps:)
  const isDepsOnly = name.startsWith("__deps:");
  const depsString = isDepsOnly ? name.replace("__deps:", "") : "";

  const getCommand = (manager: PackageManager) => {
    if (isDepsOnly) {
      return `${PM_ADD_COMMANDS[manager]} ${depsString}`;
    }
    const registryUrl = `https://ui.bklit.com/r/${name}.json`;
    return `${PM_SHADCN_COMMANDS[manager]} ${registryUrl}`;
  };

  const command = getCommand(pm);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <figure className="not-prose relative my-4 overflow-hidden rounded-lg border border-fd-border bg-fd-secondary">
      <Tabs onValueChange={handleValueChange} value={pm}>
        {/* Header with terminal icon and tabs */}
        <div className="flex items-center gap-2 border-fd-border/50 border-b px-3 py-1">
          <div className="flex size-4 items-center justify-center rounded-[1px] bg-fd-foreground opacity-70">
            <Terminal className="size-3 text-fd-secondary" />
          </div>
          <TabsList
            className="h-auto gap-0 rounded-none bg-transparent p-0"
            variant="line"
          >
            {(["pnpm", "npm", "yarn", "bun"] as const).map((manager) => (
              <TabsTrigger
                className={cn(
                  "h-7 border border-transparent px-2 pt-0.5 shadow-none",
                  "data-[state=active]:border-fd-input data-[state=active]:bg-fd-background"
                )}
                key={manager}
                value={manager}
              >
                {manager}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Code content */}
        <div className="overflow-x-auto">
          {(["pnpm", "npm", "yarn", "bun"] as const).map((manager) => (
            <TabsContent
              className="mt-0 px-4 py-3.5"
              key={manager}
              value={manager}
            >
              <pre>
                <code className="relative font-mono text-fd-foreground text-sm leading-none">
                  {getCommand(manager)}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Copy button */}
      <button
        className={cn(
          "absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-md",
          "opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100",
          "hover:bg-fd-accent hover:text-fd-accent-foreground",
          copied && "text-green-400"
        )}
        onClick={handleCopy}
        type="button"
      >
        <span className="sr-only">Copy</span>
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </figure>
  );
}
