"use client";

import { Icon } from "@bklitui/icons";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({
  text,
  className,
  "aria-label": ariaLabel,
}: {
  text: string;
  className?: string;
  "aria-label"?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      aria-label={ariaLabel ?? (copied ? "Copied" : "Copy")}
      className={className}
      onClick={copy}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <span className="relative block size-3">
        <Icon
          className="absolute inset-0 size-3 transition-all duration-300 ease-out"
          name="IconClipboard2"
          style={{
            opacity: copied ? 0 : 1,
            filter: copied ? "blur(4px)" : "blur(0px)",
            transform: copied ? "scale(0.8)" : "scale(1)",
          }}
        />
        <Icon
          className="absolute inset-0 size-3 transition-all duration-300 ease-out"
          name="IconCheckmark1"
          style={{
            opacity: copied ? 1 : 0,
            filter: copied ? "blur(0px)" : "blur(4px)",
            transform: copied ? "scale(1)" : "scale(0.8)",
          }}
        />
      </span>
    </Button>
  );
}
