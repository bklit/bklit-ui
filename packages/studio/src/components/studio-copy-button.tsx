"use client";

import { Icon } from "@bklitui/icons";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { InputGroupButton } from "@/ui/input-group";

export function StudioCopyButton({
  text,
  className,
  onCopied,
  "aria-label": ariaLabel,
}: {
  text: string;
  className?: string;
  onCopied?: () => void;
  "aria-label"?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 2000);
  }, [onCopied, text]);

  return (
    <InputGroupButton
      aria-label={ariaLabel ?? (copied ? "Copied" : "Copy")}
      className={className}
      onClick={copy}
      size="icon-xs"
      title={copied ? "Copied" : "Copy"}
      type="button"
    >
      <span className="relative block size-3.5">
        <Icon
          className="absolute inset-0 size-3.5 transition-all duration-300 ease-out"
          name="IconClipboard2"
          style={{
            filter: copied ? "blur(4px)" : "blur(0px)",
            opacity: copied ? 0 : 1,
            transform: copied ? "scale(0.8)" : "scale(1)",
          }}
        />
        <Icon
          className={cn(
            "absolute inset-0 size-3.5 transition-all duration-300 ease-out"
          )}
          name="IconCheckmark1"
          style={{
            filter: copied ? "blur(0px)" : "blur(4px)",
            opacity: copied ? 1 : 0,
            transform: copied ? "scale(1)" : "scale(0.8)",
          }}
        />
      </span>
    </InputGroupButton>
  );
}
