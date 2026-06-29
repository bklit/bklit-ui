"use client";

import { Icon } from "@bklitui/icons";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";

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

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    // Studio toolbar owns the D shortcut on /studio.
    if (pathname?.startsWith("/studio")) {
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
  }, [mounted, pathname, toggleTheme]);

  if (!mounted) {
    return (
      <Button aria-label="Toggle theme" size="default" variant="ghost">
        <div className="size-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-keyshortcuts="D"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      size="default"
      title={`Switch to ${isDark ? "light" : "dark"} mode (D)`}
      variant="ghost"
    >
      {isDark ? (
        <Icon className="size-5" name="IconSun" />
      ) : (
        <Icon className="size-5" name="IconMoon" />
      )}
    </Button>
  );
}
