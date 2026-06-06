"use client";

import { Share03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ParticleBadge } from "@/components/onboarding/particle-badge";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

export function StudioShareButton({
  className,
  onCopiedChange,
}: {
  className?: string;
  onCopiedChange?: (copied: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    if (copied) {
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
    setCopied(true);
    onCopiedChange?.(true);
    window.setTimeout(() => {
      setCopied(false);
      onCopiedChange?.(false);
    }, 2000);
  }, [copied, onCopiedChange]);

  return (
    <ParticleBadge>
      <Button
        aria-label={copied ? "Copied" : "Share chart"}
        className={cn("size-8", className)}
        onClick={copyLink}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <span className="relative block size-4">
          <HugeiconsIcon
            className="absolute inset-0 transition-all duration-300 ease-out"
            icon={Share03Icon}
            strokeWidth={1.75}
            style={{
              filter: copied ? "blur(4px)" : "blur(0px)",
              opacity: copied ? 0 : 1,
              transform: copied ? "scale(0.8)" : "scale(1)",
            }}
          />
          <CheckIcon
            className="absolute inset-0 size-4 transition-all duration-300 ease-out"
            style={{
              filter: copied ? "blur(0px)" : "blur(4px)",
              opacity: copied ? 1 : 0,
              transform: copied ? "scale(1)" : "scale(0.8)",
            }}
          />
        </span>
      </Button>
    </ParticleBadge>
  );
}
