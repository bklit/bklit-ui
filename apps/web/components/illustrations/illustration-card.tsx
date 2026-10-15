/**
 * Index-grid card: title + description over a framed illustration panel.
 * Adapted from coss ui's category card (apps/ui/app/page.tsx, MIT).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardFrame,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function IllustrationCard({
  className,
  description,
  href,
  illustration,
  title,
}: {
  className?: string;
  description?: string;
  href: string;
  illustration?: ReactNode;
  title: string;
}) {
  return (
    <CardFrame
      className={cn(
        "group/illustration w-full after:pointer-events-none after:absolute after:-inset-[5px] after:-z-1 after:rounded-[calc(var(--radius-2xl)+4px)] after:border after:border-border/64",
        className
      )}
    >
      <CardFrameHeader className="static grid grid-rows-[auto_1fr] px-5">
        <CardFrameTitle
          render={
            <h2>
              <Link
                className="before:absolute before:inset-0 before:z-10 before:rounded-2xl focus-visible:outline-none focus-visible:before:ring-2 focus-visible:before:ring-ring"
                href={href}
              >
                {title}
              </Link>
            </h2>
          }
        />
        <CardFrameDescription
          className="line-clamp-2 sm:h-[2lh]"
          render={<p />}
        >
          {description || " "}
        </CardFrameDescription>
      </CardFrameHeader>
      <Card className="pointer-events-none h-52 flex-none flex-col overflow-hidden bg-[color-mix(in_srgb,var(--color-card),var(--color-sidebar))] dark:bg-background">
        <CardPanel className="flex flex-1 items-center justify-center px-6 [--btn-from:--alpha(var(--color-primary)/90%)] [--btn-to:var(--color-primary)] *:transition-transform *:duration-200 *:ease-out group-has-[a:hover]/illustration:*:-translate-y-0.5 motion-reduce:*:transition-none dark:[--btn-from:var(--color-primary)] dark:[--btn-to:--alpha(var(--color-primary)/90%)]">
          {illustration}
        </CardPanel>
      </Card>
    </CardFrame>
  );
}
