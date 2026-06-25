"use client";

import { useEffect, useState } from "react";
import { useChartTheme } from "@/components/chart-theme/chart-theme-provider";
import { ChartThemeSwatchIcon } from "@/components/chart-theme/chart-theme-swatch-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChartThemeSelector() {
  const { themeId, theme, themes, setThemeId } = useChartTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button aria-label="Chart color theme" size="default" variant="ghost">
        <div className="size-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Chart color theme"
            className="group/chart-theme-trigger"
            size="default"
            title="Chart color theme"
            variant="ghost"
          />
        }
      >
        <ChartThemeSwatchIcon context="trigger" swatch={theme.swatch} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 text-xs">
        <DropdownMenuRadioGroup onValueChange={setThemeId} value={themeId}>
          {themes.map((entry) => (
            <DropdownMenuRadioItem
              className="text-xs"
              key={entry.id}
              value={entry.id}
            >
              <ChartThemeSwatchIcon
                context="menu"
                size="sm"
                swatch={entry.swatch}
              />
              <span>{entry.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
