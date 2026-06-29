"use client";

import type { StudioUrlState } from "@bklitui/studio";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChartMountPlaceholder } from "@/components/design/chart-mount-placeholder";
import { DesignSectionRulers } from "@/components/design/design-section-rulers";
import { Button } from "@/components/ui/button";
import { useDeferredInViewOnce } from "@/lib/use-deferred-in-view-once";

const StudioDisplayShell = dynamic(
  () =>
    import("@bklitui/studio").then((mod) => ({
      default: mod.StudioDisplayShell,
    })),
  {
    loading: () => null,
    ssr: false,
  }
);

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const hoverEnterDuration = 0.35;
const hoverExitDuration = 0.24;
const studioRevealDuration = 0.55;

const homeStudioPreviewState = {
  chart: "area-chart",
  dataSeries: 2,
} as const satisfies Partial<StudioUrlState>;

function StudioHoverButton({
  reducedMotion,
  visible,
}: {
  reducedMotion: boolean | null;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-background/25"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: hoverExitDuration, ease: easeOutQuint }
          }
        >
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto"
            exit={{ opacity: 0, y: 4 }}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: hoverEnterDuration, ease: easeOutQuint }
            }
          >
            <Button
              nativeButton={false}
              render={<Link href="/studio" />}
              size="lg"
            >
              Open Studio
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function HomeStudioPreview() {
  const reducedMotion = useReducedMotion();
  const { ref: viewportRef, mounted } = useDeferredInViewOnce({
    mountKey: "studio",
    rootMargin: "120px",
  });
  const [studioReady, setStudioReady] = useState(false);
  const [hoverFine, setHoverFine] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  const handleStudioReadyChange = useCallback((ready: boolean) => {
    if (ready) {
      setStudioReady(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) {
      setStudioReady(false);
    }
  }, [mounted]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showButton =
    reducedMotion === true || coarsePointer || hoverFine || focused;

  const revealTransition = reducedMotion
    ? { duration: 0 }
    : { duration: studioRevealDuration, ease: easeOutQuint };

  const showPlaceholder = !(mounted && studioReady);

  return (
    <div
      className="group/studio relative w-full overflow-visible outline-none"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHoverFine(true)}
      onPointerLeave={() => setHoverFine(false)}
    >
      <div className="relative">
        <div
          className="relative h-[min(75vh,760px)] min-h-[480px] w-full overflow-hidden border border-border bg-background"
          ref={viewportRef}
        >
          <AnimatePresence>
            {showPlaceholder ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-1"
                exit={{ opacity: 0 }}
                initial={{ opacity: 1 }}
                key="studio-placeholder"
                transition={revealTransition}
              >
                <ChartMountPlaceholder className="min-h-[480px] rounded-none" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {mounted ? (
            <motion.div
              animate={{ opacity: studioReady ? 1 : 0 }}
              aria-hidden={!studioReady}
              className="absolute inset-0 size-full"
              initial={false}
              transition={revealTransition}
            >
              <StudioDisplayShell
                initialState={homeStudioPreviewState}
                onReadyChange={handleStudioReadyChange}
              />
            </motion.div>
          ) : null}
        </div>

        <StudioHoverButton reducedMotion={reducedMotion} visible={showButton} />
      </div>

      <DesignSectionRulers />
    </div>
  );
}
