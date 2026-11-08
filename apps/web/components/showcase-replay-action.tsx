"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";

export const showcaseActionEase = [0.23, 1, 0.32, 1] as const;
export const showcaseActionEnterDuration = 0.2;
export const showcaseActionExitDuration = 0.16;
export const showcaseActionStagger = 0.04;

/**
 * Icon-only showcase control (fades in when `visible` flips true). Shared by
 * the Replay and Present actions so they animate and size identically.
 */
export function ShowcaseIconAction({
  index,
  visible,
  reducedMotion,
  label,
  icon,
  onClick,
}: {
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
  label: string;
  icon: IconName;
  onClick: () => void;
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
                    duration: showcaseActionEnterDuration,
                    ease: showcaseActionEase,
                    delay: index * showcaseActionStagger,
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
                    duration: showcaseActionExitDuration,
                    ease: showcaseActionEase,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            aria-label={label}
            className="size-7 [&_svg]:size-4"
            onClick={onClick}
            size="icon"
            title={label}
            type="button"
            variant="outline"
          >
            <Icon className="size-4" name={icon} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Icon-only "Replay animation" button used on homepage / design showcase
 * cards and chart gallery previews. Fades in when `visible` flips true.
 */
export function ShowcaseReplayAction({
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
    <ShowcaseIconAction
      icon="IconArrowRotateClockwise"
      index={index}
      label="Replay animation"
      onClick={onReplay}
      reducedMotion={reducedMotion}
      visible={visible}
    />
  );
}
