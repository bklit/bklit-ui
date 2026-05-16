"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      className="shrink-0 rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={copy}
      type="button"
    >
      <span className="relative block size-3">
        <CopyIcon
          className="absolute inset-0 size-3 transition-all duration-300 ease-out"
          style={{
            opacity: copied ? 0 : 1,
            filter: copied ? "blur(4px)" : "blur(0px)",
            transform: copied ? "scale(0.8)" : "scale(1)",
          }}
        />
        <CheckIcon
          className="absolute inset-0 size-3 transition-all duration-300 ease-out"
          style={{
            opacity: copied ? 1 : 0,
            filter: copied ? "blur(0px)" : "blur(4px)",
            transform: copied ? "scale(1)" : "scale(0.8)",
          }}
        />
      </span>
    </button>
  );
}
