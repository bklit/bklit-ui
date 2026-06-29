"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { HomeStudioVideo } from "@/components/home-studio-video";
import { ParticleBadge } from "@/components/particle-badge";
import { Button } from "@/components/ui/button";

const sectionTitleClassName =
  "font-light text-4xl text-foreground tracking-tight";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function HomeStudioSection() {
  const reducedMotion = useReducedMotion();

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: easeOutQuint };

  return (
    <section
      aria-label="Studio Version 2"
      className="mx-auto w-full space-y-5 text-center"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <motion.div
            animate="animate"
            className="flex justify-center"
            initial="initial"
            transition={transition}
            variants={fadeUp}
          >
            <ParticleBadge disableHover>
              <h2 className={sectionTitleClassName}>Studio Version 2</h2>
            </ParticleBadge>
          </motion.div>
          <motion.p
            animate="animate"
            className="font-light text-lg text-muted-foreground"
            initial="initial"
            transition={{ ...transition, delay: reducedMotion ? 0 : 0.04 }}
            variants={fadeUp}
          >
            Explore, Export, Get Code
          </motion.p>
        </div>

        <motion.div
          animate="animate"
          className="flex justify-center"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.06 }}
          variants={fadeUp}
        >
          <Button
            nativeButton={false}
            render={<Link href="/studio">Open Studio</Link>}
            size="sm"
            variant="white"
          />
        </motion.div>
      </div>

      <HomeStudioVideo animationDelay={0.08} />
    </section>
  );
}
