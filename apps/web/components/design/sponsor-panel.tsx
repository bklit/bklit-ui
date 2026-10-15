import Link from "next/link";
import type { FocusEvent, PointerEvent, ReactNode } from "react";
import { FramePanel } from "@/components/ui/frame";
import { cn } from "@/lib/utils";
import { SponsorPlaceholderPattern } from "./sponsor-placeholder-pattern";

export function DesignSponsorPanel({
  ariaLabel,
  children,
  className,
  href,
  minHeight = 200,
  onBlur,
  onClick,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  patternReversed = false,
  variant = "default",
}: {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  href?: string;
  minHeight?: number;
  onBlur?: (event: FocusEvent<HTMLAnchorElement>) => void;
  onClick?: () => void;
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
  onPointerEnter?: (event: PointerEvent<HTMLAnchorElement>) => void;
  onPointerLeave?: (event: PointerEvent<HTMLAnchorElement>) => void;
  patternReversed?: boolean;
  variant?: "default" | "placeholder";
}) {
  const panel = (
    <FramePanel
      className={cn(
        "h-full w-full min-w-0 overflow-hidden p-0 transition-colors",
        href && "group-hover:bg-card group-focus-visible:bg-card",
        className
      )}
      style={{ minHeight }}
    >
      {variant === "placeholder" ? (
        <SponsorPlaceholderPattern reversed={patternReversed} />
      ) : null}
      <div
        className={cn(
          "relative z-2 flex h-full min-w-0 flex-col",
          variant === "placeholder" ? "p-0" : "items-center justify-center p-8"
        )}
        style={{ minHeight: minHeight - 2 }}
      >
        {children}
      </div>
    </FramePanel>
  );

  if (href) {
    return (
      <Link
        aria-label={
          ariaLabel ??
          (variant === "placeholder" ? "Become a sponsor" : undefined)
        }
        className="group block w-full min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={href}
        onBlur={onBlur}
        onClick={onClick}
        onFocus={onFocus}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        rel="noopener noreferrer"
        target="_blank"
      >
        {panel}
      </Link>
    );
  }

  return panel;
}
