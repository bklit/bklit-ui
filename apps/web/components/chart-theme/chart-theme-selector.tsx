"use client";

import { useEffect, useState } from "react";
import { useChartTheme } from "@/components/chart-theme/chart-theme-provider";
import { ChartThemeSwatchIcon } from "@/components/chart-theme/chart-theme-swatch-icon";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu";

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
    <Menu>
      <MenuTrigger
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
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-36 text-xs">
        <MenuRadioGroup onValueChange={setThemeId} value={themeId}>
          {themes.map((entry) => (
            <MenuRadioItem className="text-xs" key={entry.id} value={entry.id}>
              <span className="flex items-center gap-2">
                <ChartThemeSwatchIcon
                  context="menu"
                  size="sm"
                  swatch={entry.swatch}
                />
                <span>{entry.name}</span>
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}
