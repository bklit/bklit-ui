"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedBrand } from "@/components/animated-brand";
import { HomeComponents } from "@/components/home-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const staggerDelay = 0.12;

const fadeInBlur = {
  initial: { opacity: 0, filter: "blur(2px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
};

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  return (
    <main className="flex flex-1 flex-col items-center justify-center space-y-24 px-4 py-24 text-center">
      <div className="max-w-xl space-y-6">
        <motion.div
          animate="animate"
          className="mx-auto flex w-fit items-center justify-center rounded-full border p-px"
          initial="initial"
          transition={{ duration: 0.5 }}
          variants={fadeInBlur}
        >
          <Badge variant="secondary">Version</Badge>
          <Badge variant="ghost">Pre-release</Badge>
        </motion.div>

        <AnimatedBrand onAnimationComplete={() => setShowContent(true)} />

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

      <AnimatePresence>
        {showContent && (
          <motion.div
            animate="animate"
            className="container mx-auto"
            initial="initial"
            transition={{ delay: staggerDelay * 2, duration: 0.6 }}
            variants={fadeInBlur}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <HomeComponents />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
