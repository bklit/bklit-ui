"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ComponentProps, useCallback } from "react";
import { cn } from "@/lib/utils";

const PERSIAN_TEXT_PATTERN = /[\u0600-\u06ff]/u;

export type ShimmeringTextProps = Omit<
  ComponentProps<typeof motion.span>,
  "children"
> & {
  /** The text to render with the shimmering effect. */
  text: string;
  /**
   * Duration in seconds for one shimmer cycle.
   * @defaultValue 1
   */
  duration?: number;
  /**
   * Pause the shimmer (e.g. when the hero leaves the viewport).
   * @defaultValue false
   */
  paused?: boolean;
  /**
   * Legacy alias for `paused`.
   * @defaultValue false
   */
  isStopped?: boolean;
};

export function ShimmeringText({
  text,
  duration = 1,
  isStopped = false,
  paused = false,
  className,
  ...props
}: ShimmeringTextProps) {
  const reducedMotion = useReducedMotion();
  const stopped = isStopped || paused || reducedMotion === true;

  const createCharVariants = useCallback(
    (charIndex: number): Variants => ({
      running: {
        color: ["var(--color)", "var(--shimmering-color)", "var(--color)"],
        transition: {
          duration,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          repeatDelay: text.length * 0.05,
          delay: (charIndex * duration) / text.length,
          ease: "easeInOut",
        },
      },
      stopped: {
        color: "var(--color)",
        transition: {
          duration: duration * 0.5,
          ease: "easeOut",
        },
      },
    }),
    [duration, text.length]
  );

  const containsPersian = PERSIAN_TEXT_PATTERN.test(text);

  if (containsPersian) {
    return (
      <motion.span
        animate={
          stopped
            ? { color: "var(--color)" }
            : {
                color: [
                  "var(--color)",
                  "var(--shimmering-color)",
                  "var(--color)",
                ],
              }
        }
        className={cn(
          "inline-block select-none whitespace-nowrap leading-none",
          className
        )}
        transition={{
          duration,
          ease: "easeInOut",
          repeat: stopped ? 0 : Number.POSITIVE_INFINITY,
        }}
        {...props}
      >
        {text}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={cn(
        "inline-flex select-none items-center leading-none",
        "[--color:var(--muted-foreground)] [--shimmering-color:var(--foreground)]",
        className
      )}
      {...props}
    >
      {text.split("").map((char, index) => (
        <motion.span
          animate={stopped ? "stopped" : "running"}
          aria-hidden
          className="inline-block whitespace-pre leading-none"
          initial="stopped"
          // biome-ignore lint/suspicious/noArrayIndexKey: static label text, order never changes
          key={index}
          variants={createCharVariants(index)}
        >
          {char}
        </motion.span>
      ))}
      <span className="sr-only">{text}</span>
    </motion.span>
  );
}
