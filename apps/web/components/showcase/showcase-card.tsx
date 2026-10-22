"use client";

import { Icon } from "@bklitui/icons";
import Link from "fumadocs-core/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Frame, FramePanel } from "@/components/ui/frame";
import type { ShowcaseProject } from "@/lib/showcase/projects";
import { getShowcaseImageTransform } from "@/lib/showcase/transform";
import { cn } from "@/lib/utils";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const actionEnterDuration = 0.2;
const actionExitDuration = 0.16;

function ViewProjectAction({
  visible,
  reducedMotion,
}: {
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
                  },
                }
          }
          className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center"
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 8,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        >
          <Button size="sm" tabIndex={-1} variant="white">
            View project
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ShowcaseCard({ project }: { project: ShowcaseProject }) {
  const reducedMotion = useReducedMotion();
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

  const showAction =
    reducedMotion === true || coarsePointer || hoverFine || focused;

  const imageHovered =
    !reducedMotion && (hoverFine || focused || coarsePointer);

  return (
    <Link
      aria-label={`View ${project.title}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      external
      href={project.url}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocusCapture={() => setFocused(true)}
      onPointerEnter={() => setHoverFine(true)}
      onPointerLeave={() => setHoverFine(false)}
    >
      <Frame>
        <FramePanel className="relative aspect-4/3 w-full overflow-hidden p-0 [perspective:1400px]">
          {/* biome-ignore lint/performance/noImgElement: external showcase thumbnail */}
          <img
            alt={project.imageAlt}
            className={cn(
              "absolute inset-0 size-full origin-center object-cover",
              !reducedMotion &&
                "transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            )}
            height={900}
            src={project.image}
            style={{
              transform: reducedMotion
                ? undefined
                : getShowcaseImageTransform(imageHovered),
            }}
            width={1200}
          />

          <ViewProjectAction
            reducedMotion={reducedMotion}
            visible={showAction}
          />
        </FramePanel>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="truncate font-semibold text-sm">{project.title}</p>
          <Icon
            className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
            name="IconArrowUpRight"
          />
        </div>
      </Frame>
    </Link>
  );
}
