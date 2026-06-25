"use client";

import { createContext, type ReactNode, useContext } from "react";
import { usePauseWhenOffscreen } from "@/lib/use-pause-when-offscreen";

const HeroMotionPausedContext = createContext(false);

export function useHeroMotionPaused() {
  return useContext(HeroMotionPausedContext);
}

export function HomeHeroSection({ children }: { children: ReactNode }) {
  const { ref, paused } = usePauseWhenOffscreen();

  return (
    <HeroMotionPausedContext.Provider value={paused}>
      <section className="relative w-full" ref={ref}>
        {children}
      </section>
    </HeroMotionPausedContext.Provider>
  );
}
