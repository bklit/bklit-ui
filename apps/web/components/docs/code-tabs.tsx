"use client";

import { type ReactNode, useEffect, useState } from "react";
import { commandTabsListClassName } from "@/components/docs/package-manager-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STORAGE_KEY = "bklit-install-type";

interface CodeTabsProps {
  children: ReactNode;
  defaultValue?: "cli" | "manual";
  onTabChange?: (tab: "cli" | "manual") => void;
}

export function CodeTabs({
  children,
  defaultValue = "cli",
  onTabChange,
}: CodeTabsProps) {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "cli" || stored === "manual") {
      setValue(stored);
      onTabChange?.(stored);
    }
  }, [onTabChange]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem(STORAGE_KEY, newValue);
    if (newValue === "cli" || newValue === "manual") {
      onTabChange?.(newValue);
    }
  };

  return (
    <Tabs className="mt-6" onValueChange={handleValueChange} value={value}>
      <TabsList className={commandTabsListClassName}>
        <TabsTrigger className="rounded-lg" value="cli">
          Command
        </TabsTrigger>
        <TabsTrigger className="rounded-lg" value="manual">
          Manual
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}

export function CodeTabsContent({
  value,
  children,
}: {
  value: "cli" | "manual";
  children: ReactNode;
}) {
  return <TabsContent value={value}>{children}</TabsContent>;
}
