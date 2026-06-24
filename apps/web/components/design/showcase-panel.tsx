"use client";

import { Icon } from "@bklitui/icons";
import { studioChartDocsHref, studioChartHref } from "@bklitui/studio";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { Button } from "@/components/ui/button";
import { useInViewOnce } from "@/lib/use-in-view-once";
import { cn } from "@/lib/utils";
import { GridCornerDots } from "./line-grid";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const actionEnterDuration = 0.2;
const actionExitDuration = 0.16;
const actionStagger = 0.04;

function ShowcaseReplayAction({
  index,
  visible,
  reducedMotion,
  onReplay,
}: {
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
  onReplay: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: actionEnterDuration,
                    ease: easeOutQuint,
                    delay: index * actionStagger,
                  },
                }
          }
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 4,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            aria-label="Replay animation"
            className="size-7 [&_svg]:size-4"
            onClick={onReplay}
            size="icon"
            title="Replay animation"
            type="button"
            variant="outline"
          >
            <Icon className="size-4" name="IconArrowRotateClockwise" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardAction({
  href,
  label,
  variant,
  index,
  visible,
  reducedMotion,
}: {
  href: string;
  label: string;
  variant: "outline" | "default";
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: actionEnterDuration,
                    ease: easeOutQuint,
                    delay: index * actionStagger,
                  },
                }
          }
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 4,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            size="sm"
            variant={variant}
          >
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DesignShowcasePanel({
  chart,
  children,
  className,
}: {
  chart: ChartSlug;
  children?: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const { ref: chartViewportRef, inView: chartInView } = useInViewOnce({
    rootMargin: "120px",
  });
  const [hoverFine, setHoverFine] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const replay = useCallback(() => {
    setReplayKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showActions =
    reducedMotion === true || coarsePointer || hoverFine || focused;

  return (
    <div
      className={cn(
        "relative flex min-h-[280px] flex-col overflow-visible border-border border-r border-b md:overflow-hidden",
        className
      )}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHoverFine(true)}
      onPointerLeave={() => setHoverFine(false)}
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-white dark:bg-black"
      />
      <GridCornerDots className="z-3 md:hidden" columns={1} rows={1} />
      <div className="absolute top-3 left-3 z-10">
        <ShowcaseReplayAction
          index={0}
          onReplay={replay}
          reducedMotion={reducedMotion}
          visible={showActions}
        />
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <CardAction
          href={studioChartDocsHref(chart)}
          index={1}
          label="Docs"
          reducedMotion={reducedMotion}
          variant="outline"
          visible={showActions}
        />
        <CardAction
          href={studioChartHref(chart)}
          index={2}
          label="Open in Studio"
          reducedMotion={reducedMotion}
          variant="default"
          visible={showActions}
        />
      </div>
      <div className="absolute inset-0 z-2 flex items-center justify-center p-5 pt-14 sm:p-6 sm:pt-14 md:p-8 md:pt-16">
        <div
          className="flex size-full max-h-full min-w-0 items-center justify-center"
          key={replayKey}
          ref={chartViewportRef}
        >
          {chartInView ? children : null}
        </div>
      </div>
    </div>
  );
}
