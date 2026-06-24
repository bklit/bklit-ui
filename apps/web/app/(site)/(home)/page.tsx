"use client";

import { DesignHero } from "@/components/design/hero";

// import { AnimatePresence, motion } from "motion/react";
// import { useState } from "react";
// import { HomeComponents } from "@/components/home-components";
// import { HomeHero } from "@/components/home-hero";
// import { HomeSponsorsSection } from "@/components/home-sponsors-section";
// import { HomeStudioSection } from "@/components/home-studio-section";
// import { TestimonialGrid } from "@/components/testimonial-grid";

// const staggerDelay = 0.12;

// const fadeInOnly = {
//   initial: { opacity: 0 },
//   animate: { opacity: 1 },
// };

export default function HomePage() {
  // const [showContent, setShowContent] = useState(false);

  return (
    <main className="flex flex-1 flex-col space-y-24">
      {/* <HomeHero onContentReady={() => setShowContent(true)} /> */}

      <div className="flex w-full flex-col gap-0">
        <DesignHero />
      </div>

      {/* <div>
        <div className="container mx-auto max-w-7xl border border-border">
          <div className="flex flex-col items-start justify-center gap-4 p-24">
            <div className="flex flex-col items-start justify-center">
              <h1 className="font-bold text-4xl">Bklit UI</h1>
              <p className="font-light text-3xl text-muted-foreground">
                Design engineered data visualization components
              </p>
            </div>
            <div className="flex items-start justify-center gap-1">
              <Button
                onClick={() => {
                  console.log("clicked");
                }}
                size="lg"
                variant="default"
              >
                Get started
              </Button>
              <Button
                onClick={() => {
                  console.log("clicked");
                }}
                size="lg"
                variant="outline"
              >
                Get started
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* <AnimatePresence>
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
              className="container mx-auto w-full"
              initial="initial"
              transition={{ delay: staggerDelay * 3, duration: 0.6 }}
              variants={fadeInOnly}
            >
              <HomeStudioSection />
            </motion.div>

            <motion.div
              animate="animate"
              className="container mx-auto w-full max-w-6xl"
              initial="initial"
              transition={{ delay: staggerDelay * 4, duration: 0.6 }}
              variants={fadeInOnly}
            >
              <HomeSponsorsSection />
            </motion.div>

            <motion.div
              animate="animate"
              className="container mx-auto w-full max-w-6xl"
              initial="initial"
              transition={{ delay: staggerDelay * 5, duration: 0.6 }}
              variants={fadeInOnly}
            >
              <TestimonialGrid />
            </motion.div>
          </>
        )}
      </AnimatePresence> */}
    </main>
  );
}
