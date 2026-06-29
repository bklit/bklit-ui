"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getUsedByLogoPaddingStyle } from "@/components/brands/used-by-logo-insets";
import type { UsedByLogo } from "@/components/brands/used-by-logos";

export interface GlitchSwapSettings {
  /** Max channel split as a percentage of the logo's rendered width. */
  split: number;
  /** Duration of the glitch transition in ms. */
  glitch: number;
  /** Max blur at the peak of the glitch. */
  blur: number;
  /** Random horizontal/vertical slice jitter as a percentage of width. */
  jitter: number;
}

export const DEFAULT_GLITCH_SWAP: GlitchSwapSettings = {
  split: 4,
  glitch: 600,
  blur: 1.4,
  jitter: 2.2,
};

interface GlitchSwapLogoProps {
  logo: UsedByLogo;
  className?: string;
  settings?: GlitchSwapSettings;
  paused?: boolean;
  reducedMotion?: boolean;
  onDisplayChange?: (logo: UsedByLogo) => void;
}

export function GlitchSwapLogo({
  logo,
  className,
  settings = DEFAULT_GLITCH_SWAP,
  paused = false,
  reducedMotion = false,
  onDisplayChange,
}: GlitchSwapLogoProps) {
  const filterId = useId().replace(/:/g, "");
  const redRef = useRef<SVGFEOffsetElement>(null);
  const blueRef = useRef<SVGFEOffsetElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [displayed, setDisplayed] = useState(logo);
  const displayedRef = useRef(logo);
  const pendingRef = useRef(logo);
  const swappedRef = useRef(false);
  const settingsRef = useRef(settings);
  const pausedRef = useRef(paused);
  const reducedMotionRef = useRef(reducedMotion);
  settingsRef.current = settings;
  pausedRef.current = paused;
  reducedMotionRef.current = reducedMotion;

  useEffect(() => {
    displayedRef.current = displayed;
    onDisplayChange?.(displayed);
  }, [displayed, onDisplayChange]);

  useEffect(() => {
    const red = redRef.current;
    const blue = blueRef.current;
    const blur = blurRef.current;
    if (!(red && blue && blur)) {
      return;
    }

    const apply = (dx: number, dy: number, stdDev: number) => {
      red.setAttribute("dx", dx.toFixed(2));
      red.setAttribute("dy", dy.toFixed(2));
      blue.setAttribute("dx", (-dx).toFixed(2));
      blue.setAttribute("dy", (-dy).toFixed(2));
      blur.setAttribute("stdDeviation", stdDev.toFixed(2));
    };

    if (logo.id === displayedRef.current.id) {
      apply(0, 0, 0);
      return;
    }

    pendingRef.current = logo;

    if (reducedMotion || paused) {
      displayedRef.current = logo;
      setDisplayed(logo);
      apply(0, 0, 0);
      return;
    }

    swappedRef.current = false;
    const cfg = settingsRef.current;
    const start = performance.now();
    let rafId = 0;

    const tick = () => {
      if (pausedRef.current || reducedMotionRef.current) {
        apply(0, 0, 0);
        return;
      }

      const width = containerRef.current?.getBoundingClientRect().width ?? 100;
      const gt = (performance.now() - start) / cfg.glitch;

      if (gt >= 1) {
        apply(0, 0, 0);
        return;
      }

      if (gt >= 0.5 && !swappedRef.current) {
        swappedRef.current = true;
        const next = pendingRef.current;
        displayedRef.current = next;
        setDisplayed(next);
      }

      const env = Math.sin(gt * Math.PI);
      const base = width * (cfg.split / 100) * env;
      const jitter = width * (cfg.jitter / 100) * env * (Math.random() * 2 - 1);
      const dy =
        width * (cfg.jitter / 100) * 0.4 * env * (Math.random() * 2 - 1);
      apply(base + jitter, dy, cfg.blur * env);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [logo, paused, reducedMotion]);

  const { Logo, name } = displayed;

  return (
    <>
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0"
        focusable="false"
      >
        <title>Chromatic glitch filter</title>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            height="160%"
            id={filterId}
            width="160%"
            x="-30%"
            y="-30%"
          >
            {/* Pure-red silhouette from alpha — visible in light and dark themes. */}
            <feFlood floodColor="#ff0033" result="redFlood" />
            <feComposite
              in="redFlood"
              in2="SourceAlpha"
              operator="in"
              result="redSil"
            />
            {/* Pure-cyan silhouette from alpha. */}
            <feFlood floodColor="#00e0ff" result="cyanFlood" />
            <feComposite
              in="cyanFlood"
              in2="SourceAlpha"
              operator="in"
              result="cyanSil"
            />
            <feOffset
              dx="0"
              dy="0"
              in="redSil"
              ref={redRef}
              result="redShift"
            />
            <feOffset
              dx="0"
              dy="0"
              in="cyanSil"
              ref={blueRef}
              result="cyanShift"
            />
            <feBlend
              in="redShift"
              in2="cyanShift"
              mode="screen"
              result="ghosts"
            />
            <feGaussianBlur
              in="ghosts"
              ref={blurRef}
              result="ghostsBlur"
              stdDeviation="0"
            />
            {/* Solid logo on top; colored fringes peek from the sides. */}
            <feMerge>
              <feMergeNode in="ghostsBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div
        aria-label={name}
        className="flex h-full w-full items-center justify-center"
        ref={containerRef}
        role="img"
        style={{
          filter: `url(#${filterId})`,
          ...getUsedByLogoPaddingStyle(displayed.id),
        }}
      >
        <Logo className={className} />
      </div>
    </>
  );
}
