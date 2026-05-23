"use client";

import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
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
  return <div className="mx-auto flex w-fit">{children}</div>;
}

export function HeroStudioPill() {
  return (
    <Button
      className="h-auto rounded-full px-0.5 py-0.5"
      nativeButton={false}
      render={<Link href="/studio" title="Studio" />}
      size="lg"
      variant="outline"
    >
      <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
        Introducing
      </span>
      <span className="flex items-center gap-1 px-2.5 py-1 text-xs">
        Studio
        <HugeiconsIcon icon={ArrowRightIcon} size={14} />
      </span>
    </Button>
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
