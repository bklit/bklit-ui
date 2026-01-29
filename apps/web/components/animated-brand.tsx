"use client";

import { motion, useAnimationControls } from "motion/react";
import { useEffect, useState } from "react";

interface AnimatedBrandProps {
  onAnimationComplete?: () => void;
  className?: string;
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

  useEffect(() => {
    const runAnimation = async () => {
      // Wait a moment before starting
      await new Promise((resolve) => setTimeout(resolve, 800));

      setPhase("morphing");

      // 1. Fade out "ac"
      // Duration 0.8s
      const acFade = acControls.start({
        opacity: 0,
        filter: "blur(2px)",
        rotateX: 30,
        rotateY: 30,
        transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
      });

      // 2. Shrink "ac" width to pull "klit" left
      // Starts 0.4s into the fade (halfway)
      await new Promise((resolve) => setTimeout(resolve, 400));
      const acShrink = acControls.start({
        width: 0,
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
      });

      // 3. Reveal "UI"
      // Starts 0.4s into the shrink (0.8s from start)
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPhase("complete");

      const uiReveal = uiControls.start({
        opacity: 1,
        filter: "blur(0px)",
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      });

      // Wait for UI to be almost done before signaling completion
      // Signaling at 75% of the UI reveal (0.8s * 0.75 = 0.6s)
      await new Promise((resolve) => setTimeout(resolve, 400));
      onAnimationComplete?.();

      await Promise.all([acFade, acShrink, uiReveal]);
    };

    runAnimation();
  }, [acControls, uiControls, onAnimationComplete]);

  return (
    <motion.h1
      className={`font-bold text-2xl sm:text-4xl ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.span
        animate={phase === "initial" ? { x: 20 } : { x: 0 }}
        className="inline-flex items-baseline"
        initial={{ x: 20 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="flex items-baseline">
          {/* "B" - fixed position relative to container start */}
          <span>B</span>

          {/* "ac" - fades out and shrinks width to pull klit left */}
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

          {/* "klit" - moves left naturally as ac shrinks */}
          <span>klit</span>
        </div>

        {/* Space and UI - always in DOM but invisible until phase complete */}
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
