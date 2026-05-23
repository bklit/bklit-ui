"use client";

import { ArrowRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedBrand } from "@/components/animated-brand";
import { Button } from "@/components/ui/button";

const staggerDelay = 0.12;

const fadeInBlur = {
  initial: { opacity: 0, filter: "blur(2px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
};

interface HomeHeroProps {
  onContentReady?: () => void;
}

function StudioPill() {
  return (
    <Button
      className="h-auto rounded-full px-0.5 py-0.5"
      nativeButton={false}
      render={<Link href="/studio" title="Studio" />}
      size="lg"
      variant="outline"
    >
      <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
        Introducing
      </span>
      <span className="flex items-center gap-1 px-2.5 py-1 text-xs">
        Studio
        <HugeiconsIcon icon={ArrowRightIcon} size={14} />
      </span>
    </Button>
  );
}

export function HomeHero({ onContentReady }: HomeHeroProps) {
  const [showContent, setShowContent] = useState(false);

  const handleAnimationComplete = () => {
    setShowContent(true);
    onContentReady?.();
  };

  return (
    <div className="max-w-xl space-y-5">
      <motion.div
        animate="animate"
        className="mx-auto flex w-fit"
        initial="initial"
        transition={{ duration: 0.5 }}
        variants={fadeInBlur}
      >
        <StudioPill />
      </motion.div>

      <AnimatedBrand onAnimationComplete={handleAnimationComplete} />

      <AnimatePresence>
        {showContent && (
          <>
            <motion.p
              animate="animate"
              className="text-lg sm:text-xl"
              initial="initial"
              transition={{ delay: staggerDelay * 0, duration: 0.5 }}
              variants={fadeInBlur}
            >
              Design engineered charts and components.
            </motion.p>

            <motion.div
              animate="animate"
              className="flex flex-col items-center justify-center gap-1 sm:flex-row"
              initial="initial"
              transition={{ delay: staggerDelay * 1, duration: 0.5 }}
              variants={fadeInBlur}
            >
              <Button
                nativeButton={false}
                render={<Link href="/docs" />}
                size="lg"
                variant="outline"
              >
                Get Started
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/docs/components" />}
                size="lg"
                variant="ghost"
              >
                Components
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
