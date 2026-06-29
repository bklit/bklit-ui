import Link from "next/link";
import type { FocusEvent, PointerEvent, ReactNode } from "react";
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
    <div
      className={cn(
        "relative w-full min-w-0 overflow-visible border-border border-r border-b",
        className
      )}
      style={{ minHeight }}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-white dark:bg-black"
      />
      {variant === "placeholder" ? (
        <SponsorPlaceholderPattern reversed={patternReversed} />
      ) : null}
      <div
        className={cn(
          "relative z-2 flex h-full min-w-0 flex-col",
          variant === "placeholder" ? "p-0" : "items-center justify-center p-8"
        )}
        style={{ minHeight: minHeight - 1 }}
      >
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        aria-label={
          ariaLabel ??
          (variant === "placeholder" ? "Become a sponsor" : undefined)
        }
        className="group block w-full min-w-0"
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
