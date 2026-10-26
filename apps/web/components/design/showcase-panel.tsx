"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChartMountPlaceholder } from "@/components/design/chart-mount-placeholder";
import {
  ShowcaseReplayAction,
  showcaseActionEase,
  showcaseActionEnterDuration,
  showcaseActionExitDuration,
  showcaseActionStagger,
} from "@/components/showcase-replay-action";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import { useDeferredInViewOnce } from "@/lib/use-deferred-in-view-once";
import { cn } from "@/lib/utils";

const easeOutQuint = showcaseActionEase;
const actionEnterDuration = showcaseActionEnterDuration;
const actionExitDuration = showcaseActionExitDuration;
const actionStagger = showcaseActionStagger;

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
          <Button render={<Link href={href} />} size="sm" variant={variant}>
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DesignShowcasePanel({
  children,
  className,
  docsHref,
  mountKey,
  studioHref,
}: {
  children?: React.ReactNode;
  className?: string;
  docsHref: string;
  /** Built on the server so the Studio URL codec isn't shipped to the client. */
  studioHref: string;
  /** Serial homepage mount slot (pass `showcase-${id}` from the grid). */
  mountKey: string;
}) {
  const reducedMotion = useReducedMotion();
  const { ref: chartViewportRef, mounted: chartMounted } =
    useDeferredInViewOnce({
      mountKey,
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
    <Frame
      className={cn("min-h-[280px]", className)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHoverFine(true)}
      onPointerLeave={() => setHoverFine(false)}
    >
      <FramePanel className="flex-1 overflow-visible p-0">
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
            href={docsHref}
            index={1}
            label="Docs"
            reducedMotion={reducedMotion}
            variant="outline"
            visible={showActions}
          />
          <CardAction
            href={studioHref}
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
            {chartMounted ? children : <ChartMountPlaceholder />}
          </div>
        </div>
      </FramePanel>
    </Frame>
  );
}
