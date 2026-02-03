"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STORAGE_KEY = "bklit-install-type";

interface CodeTabsProps {
  children: ReactNode;
  defaultValue?: "cli" | "manual";
}

export function CodeTabs({ children, defaultValue = "cli" }: CodeTabsProps) {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "cli" || stored === "manual") {
      setValue(stored);
    }
  }, []);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem(STORAGE_KEY, newValue);
  };

  return (
    <Tabs className="mt-6" onValueChange={handleValueChange} value={value}>
      <TabsList variant="line">
        <TabsTrigger value="cli">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
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
