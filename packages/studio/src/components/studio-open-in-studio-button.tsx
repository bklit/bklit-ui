"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BklitLogo } from "@/components/bklit-logo";
import { Button } from "@/ui/button";

export function StudioOpenInStudioButton({ href }: { href: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoTheme = mounted && resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      className="h-8 gap-1.5 rounded-full px-3 font-semibold text-xs"
      nativeButton={false}
      render={
        <a href={href} rel="noopener noreferrer" target="_blank">
          <BklitLogo size={14} theme={logoTheme} />
          Studio
        </a>
      }
      size="sm"
      variant="white"
    />
  );
}
