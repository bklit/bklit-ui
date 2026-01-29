"use client";

import Link from "fumadocs-core/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BklitLogo } from "../icons/bklit";

export function SiteFooter() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <footer className="py-8">
      <div className="mx-auto flex items-center justify-center gap-2 px-6">
        <BklitLogo size={16} theme={logoTheme} />
        <span className="text-muted-foreground text-sm">
          built by{" "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            external
            href="https://x.com/uixmat"
          >
            uixmat
          </Link>
        </span>
      </div>
    </footer>
  );
}
