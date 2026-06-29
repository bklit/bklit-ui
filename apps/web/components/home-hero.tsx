"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedBrand } from "@/components/animated-brand";
import {
  HeroActions,
  HeroBadgeRow,
  HeroDescription,
  HeroShell,
  HeroStudioPill,
} from "@/components/hero";
import { Button } from "@/components/ui/button";

const staggerDelay = 0.12;

const fadeInBlur = {
  initial: { opacity: 0, filter: "blur(2px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
};

interface HomeHeroProps {
  onContentReady?: () => void;
}

export function HomeHero({ onContentReady }: HomeHeroProps) {
  const [showContent, setShowContent] = useState(false);

  const handleAnimationComplete = () => {
    setShowContent(true);
    onContentReady?.();
  };

  return (
    <HeroShell>
      <motion.div
        animate="animate"
        initial="initial"
        transition={{ duration: 0.5 }}
        variants={fadeInBlur}
      >
        <HeroBadgeRow>
          <HeroStudioPill />
        </HeroBadgeRow>
      </motion.div>

      <AnimatedBrand onAnimationComplete={handleAnimationComplete} />

      <AnimatePresence>
        {showContent && (
          <>
            <motion.div
              animate="animate"
              initial="initial"
              transition={{ delay: staggerDelay * 0, duration: 0.5 }}
              variants={fadeInBlur}
            >
              <HeroDescription>
                Design engineered charts and components.
              </HeroDescription>
            </motion.div>

            <motion.div
              animate="animate"
              initial="initial"
              transition={{ delay: staggerDelay * 1, duration: 0.5 }}
              variants={fadeInBlur}
            >
              <HeroActions>
                <Button
                  nativeButton={false}
                  render={<Link href="/docs/installation">Get started</Link>}
                  size="lg"
                  variant="outline"
                />
              </HeroActions>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </HeroShell>
  );
}
