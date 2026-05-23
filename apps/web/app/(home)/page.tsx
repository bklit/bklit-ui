"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HomeComponents } from "@/components/home-components";
import { HomeHero } from "@/components/home-hero";
import { TestimonialGrid } from "@/components/testimonial-grid";

const staggerDelay = 0.12;

const fadeInOnly = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  return (
    <main className="flex flex-1 flex-col items-center justify-center space-y-24 px-4 py-18 text-center">
      <HomeHero onContentReady={() => setShowContent(true)} />

      <AnimatePresence>
        {showContent && (
          <>
            <motion.div
              animate="animate"
              className="container mx-auto"
              initial="initial"
              transition={{ delay: staggerDelay * 2, duration: 0.6 }}
              variants={fadeInOnly}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <HomeComponents />
              </div>
            </motion.div>

            <motion.div
              animate="animate"
              className="container mx-auto w-full max-w-6xl"
              initial="initial"
              transition={{ delay: staggerDelay * 3, duration: 0.6 }}
              variants={fadeInOnly}
            >
              <TestimonialGrid />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
