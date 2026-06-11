"use client";

import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useStudioTheme } from "@/providers/studio-theme-provider";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useStudioTheme();

  return (
    <Sonner
      className="toaster group"
      icons={{
        error: (
          <HugeiconsIcon
            className="size-4"
            icon={MultiplicationSignCircleIcon}
            strokeWidth={2}
          />
        ),
        info: (
          <HugeiconsIcon
            className="size-4"
            icon={InformationCircleIcon}
            strokeWidth={2}
          />
        ),
        loading: (
          <HugeiconsIcon
            className="size-4 animate-spin"
            icon={Loading03Icon}
            strokeWidth={2}
          />
        ),
        success: (
          <HugeiconsIcon
            className="size-4"
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
          />
        ),
        warning: (
          <HugeiconsIcon
            className="size-4"
            icon={Alert02Icon}
            strokeWidth={2}
          />
        ),
      }}
      style={
        {
          "--border-radius": "var(--radius)",
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      theme={resolvedTheme}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
