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
      asChild
      className="h-auto rounded-full px-0.5 py-0.5"
      size="lg"
      variant="outline"
    >
      <Link href="/studio" title="Studio">
        <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          Introducing
        </span>
        <span className="flex items-center gap-1 px-2.5 py-1">
          Studio
          <HugeiconsIcon icon={ArrowRightIcon} size={14} />
        </span>
      </Link>
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
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/docs/components">Components</Link>
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
