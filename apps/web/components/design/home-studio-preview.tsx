"use client";

import { StudioDisplayShell, type StudioUrlState } from "@bklitui/studio";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DesignSectionRulers } from "@/components/design/design-section-rulers";
import { Button } from "@/components/ui/button";
import { useInViewOnce } from "@/lib/use-in-view-once";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const hoverEnterDuration = 0.35;
const hoverExitDuration = 0.24;

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
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-background/25 backdrop-blur-[1px]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: hoverExitDuration, ease: easeOutQuint }
          }
        >
          <motion.div
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="pointer-events-auto"
            exit={{ opacity: 0, filter: "blur(1px)" }}
            initial={
              reducedMotion ? false : { opacity: 0, filter: "blur(1px)" }
            }
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
  const { ref: viewportRef, inView } = useInViewOnce({ rootMargin: "120px" });
  const [hoverFine, setHoverFine] = useState(false);
  const [focused, setFocused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showButton =
    reducedMotion === true || coarsePointer || hoverFine || focused;

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
          {inView ? (
            <StudioDisplayShell initialState={homeStudioPreviewState} />
          ) : null}
        </div>

        <StudioHoverButton reducedMotion={reducedMotion} visible={showButton} />
      </div>

      <DesignSectionRulers />
    </div>
  );
}
