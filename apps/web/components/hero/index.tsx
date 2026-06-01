"use client";

import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ParticleBadge } from "@/components/particle-badge";
import { ShimmeringText } from "@/components/shimmering-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const heroTitleClassName = "font-bold text-2xl sm:text-4xl";
export const heroDescriptionClassName = "text-lg sm:text-xl";
export const heroActionsClassName =
  "flex flex-col items-center justify-center gap-1 sm:flex-row";

export function HeroShell({ children }: { children: ReactNode }) {
  return <div className="max-w-xl space-y-5">{children}</div>;
}

export function HeroBadgeRow({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-fit overflow-visible">{children}</div>;
}

export function HeroStudioPill() {
  return (
    <ParticleBadge>
      <Button
        className="relative isolate inline-flex h-auto items-center gap-0 rounded-full bg-background px-0.5 py-0.5 text-xs"
        nativeButton={false}
        render={<Link aria-label="Studio Version 2" href="/studio" />}
        variant="outline"
      >
        <span className="flex h-6 items-center rounded-full bg-muted px-2.5 text-xs leading-none">
          Studio
        </span>
        <span className="flex h-6 items-center gap-1 px-2.5 text-xs leading-none">
          <ShimmeringText className="leading-none" text="Version 2" />
          <HugeiconsIcon className="size-3.5" icon={ArrowRightIcon} />
        </span>
      </Button>
    </ParticleBadge>
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
