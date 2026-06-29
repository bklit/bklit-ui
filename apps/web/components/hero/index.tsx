"use client";

import { Icon } from "@bklitui/icons";
import { ShimmeringText } from "@bklitui/ui/components/shimmering-text";
import type { ComponentProps, ReactNode } from "react";
import { useHeroMotionPaused } from "@/components/design/home-hero-section";
import { GradientBorderPill } from "@/components/hero/gradient-border-pill";
import { StaticBorderPill } from "@/components/hero/static-border-pill";
import { ParticleBadge } from "@/components/particle-badge";
import { cn } from "@/lib/utils";

export const heroTitleClassName = "font-bold text-2xl sm:text-4xl";
export const heroDescriptionClassName =
  "font-light text-lg text-muted-foreground";
export const heroActionsClassName =
  "flex flex-col items-center justify-center gap-1 sm:flex-row";

export function HeroShell({ children }: { children: ReactNode }) {
  return <div className="max-w-xl space-y-5">{children}</div>;
}

export function HeroBadgeRow({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-fit overflow-visible">{children}</div>;
}

export function HeroStudioPill() {
  const paused = useHeroMotionPaused();

  return (
    <ParticleBadge paused={paused}>
      <GradientBorderPill
        aria-label="Studio Version 2"
        href="/studio"
        paused={paused}
      >
        <span className="flex h-6 items-center rounded-full bg-muted px-2.5 text-xs leading-none">
          Studio
        </span>
        <span className="flex h-6 items-center gap-1 px-2.5 text-xs leading-none">
          <ShimmeringText
            className="leading-none"
            paused={paused}
            text="Version 2"
          />
          <Icon className="size-3.5" name="IconArrowRight" />
        </span>
      </GradientBorderPill>
    </ParticleBadge>
  );
}

export function HeroPlayPill({
  onClick,
  ...props
}: Omit<ComponentProps<typeof StaticBorderPill>, "children">) {
  return (
    <StaticBorderPill
      aria-label="Play Studio video"
      onClick={onClick}
      {...props}
    >
      <span className="flex size-6 items-center justify-center">
        <Icon className="size-3.5" name="IconPlay" />
      </span>
    </StaticBorderPill>
  );
}

export function HeroTitle({
  children,
  className,
  ...props
}: ComponentProps<"h1">) {
  return (
    <h1 className={cn(heroTitleClassName, className)} {...props}>
      {children}
    </h1>
  );
}

export function HeroDescription({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p className={cn(heroDescriptionClassName, className)} {...props}>
      {children}
    </p>
  );
}

export function HeroActions({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn(heroActionsClassName, className)} {...props}>
      {children}
    </div>
  );
}
