"use client";

import { Icon } from "@bklitui/icons";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useStudioTheme } from "@/providers/studio-theme-provider";
import { Button } from "@/ui/button";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function EditorThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useStudioTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "d" && event.key !== "D") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      toggleTheme();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, toggleTheme]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      aria-keyshortcuts="D"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("size-8", className)}
      disabled={!mounted}
      onClick={toggleTheme}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {isDark ? (
        <Icon className="size-4" name="IconSun" />
      ) : (
        <Icon className="size-4" name="IconMoon" />
      )}
    </Button>
  );
}
