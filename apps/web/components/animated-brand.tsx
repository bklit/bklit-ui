"use client";

import { motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroTitleClassName } from "@/components/hero";
import { cn } from "@/lib/utils";

interface AnimatedBrandProps {
  onAnimationComplete?: () => void;
  className?: string;
}

function delay(ms: number, signal: { cancelled: boolean; timeouts: number[] }) {
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      if (!signal.cancelled) {
        resolve();
      }
    }, ms);
    signal.timeouts.push(id);
  });
}

export function AnimatedBrand({
  onAnimationComplete,
  className = "",
}: AnimatedBrandProps) {
  const [phase, setPhase] = useState<"initial" | "morphing" | "complete">(
    "initial"
  );
  const acControls = useAnimationControls();
  const uiControls = useAnimationControls();
  const onCompleteRef = useRef(onAnimationComplete);
  onCompleteRef.current = onAnimationComplete;

  useEffect(() => {
    const signal = { cancelled: false, timeouts: [] as number[] };

    const runAnimation = async () => {
      await delay(800, signal);
      if (signal.cancelled) {
        return;
      }

      setPhase("morphing");

      const acFade = acControls.start({
        opacity: 0,
        filter: "blur(2px)",
        rotateX: 30,
        rotateY: 30,
        transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
      });

      await delay(400, signal);
      if (signal.cancelled) {
        return;
      }

      const acShrink = acControls.start({
        width: 0,
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
      });

      await delay(400, signal);
      if (signal.cancelled) {
        return;
      }

      setPhase("complete");

      const uiReveal = uiControls.start({
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      await delay(400, signal);
      if (signal.cancelled) {
        return;
      }

      onCompleteRef.current?.();

      await Promise.all([acFade, acShrink, uiReveal]);
    };

    const frame = requestAnimationFrame(() => {
      runAnimation().catch(() => undefined);
    });

    return () => {
      signal.cancelled = true;
      cancelAnimationFrame(frame);
      for (const id of signal.timeouts) {
        clearTimeout(id);
      }
      acControls.stop();
      uiControls.stop();
    };
  }, [acControls, uiControls]);

  return (
    <motion.h1
      className={cn(heroTitleClassName, className)}
      style={{ perspective: "1000px" }}
    >
      <motion.span
        animate={phase === "initial" ? { x: 20 } : { x: 0 }}
        className="inline-flex items-baseline"
        initial={{ x: 20 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-baseline">
          <span>B</span>

          <motion.span
            animate={acControls}
            className="inline-block overflow-hidden whitespace-nowrap"
            initial={{
              opacity: 1,
              filter: "blur(0px)",
              rotateX: 0,
              rotateY: 0,
              width: "auto",
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            ac
          </motion.span>

          <span>klit</span>
        </div>

        <div className="flex items-baseline">
          <motion.span
            animate={phase === "complete" ? { opacity: 1 } : { opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            &nbsp;
          </motion.span>

          <motion.span
            animate={uiControls}
            className="inline-block origin-center"
            initial={{
              opacity: 0,
              filter: "blur(2px)",
              rotateX: 30,
              rotateY: 30,
              scale: 1.2,
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            UI
          </motion.span>
        </div>
      </motion.span>
    </motion.h1>
  );
}
