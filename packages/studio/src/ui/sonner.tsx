"use client";

import { Icon } from "@bklitui/icons";
import { useTheme } from "next-themes";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <Icon className="size-4" name="IconCheckCircle2" />,
        info: <Icon className="size-4" name="IconCircleInfo" />,
        warning: <Icon className="size-4" name="IconBubbleAlert" />,
        error: <Icon className="size-4" name="IconCircleX" />,
        loading: (
          <Icon className="size-4 animate-spin" name="IconLoadingCircle" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
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
