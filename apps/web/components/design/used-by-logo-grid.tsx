"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type UsedByLogo,
  usedByLogoClassName,
  usedByLogos,
} from "@/components/brands/used-by-logos";
import { GlitchSwapLogo } from "@/components/design/glitch-swap-logo";
import { pickNextSlots } from "@/components/design/used-by-slots";
import { usePauseWhenOffscreen } from "@/lib/use-pause-when-offscreen";

const MOBILE_VISIBLE_SLOT_COUNT = 6;
const DESKTOP_VISIBLE_SLOT_COUNT = 8;
const SLOT_KEYS = [
  "used-by-slot-0",
  "used-by-slot-1",
  "used-by-slot-2",
  "used-by-slot-3",
  "used-by-slot-4",
  "used-by-slot-5",
  "used-by-slot-6",
  "used-by-slot-7",
] as const;
const FLIP_MIN_DELAY_MS = 2500;
const FLIP_MAX_DELAY_MS = 6500;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function UsedByGlitchLogo({
  index,
  logo,
  onDisplayChange,
  paused,
  reducedMotion,
}: {
  index: number;
  logo: UsedByLogo;
  onDisplayChange: (index: number, logo: UsedByLogo) => void;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const [linkLogo, setLinkLogo] = useState(logo);
  const handleDisplayChange = useCallback(
    (displayed: UsedByLogo) => {
      setLinkLogo(displayed);
      onDisplayChange(index, displayed);
    },
    [index, onDisplayChange]
  );

  return (
    <li className="w-full">
      <a
        className="group block w-full"
        href={linkLogo.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="relative aspect-5/2 w-full">
          <GlitchSwapLogo
            className={usedByLogoClassName}
            logo={logo}
            onDisplayChange={handleDisplayChange}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        </div>
      </a>
    </li>
  );
}

export function UsedByLogoGrid() {
  const reducedMotion = useReducedMotion();
  const { ref: visibilityRef, paused: offscreen } =
    usePauseWhenOffscreen<HTMLUListElement>();
  const [visibleSlotCount, setVisibleSlotCount] = useState(
    MOBILE_VISIBLE_SLOT_COUNT
  );
  // Deterministic initial slots (no randomness during render) so SSR and
  // hydration agree; rotation only starts in effects.
  const [slots, setSlots] = useState<readonly UsedByLogo[]>(() =>
    usedByLogos.slice(0, DESKTOP_VISIBLE_SLOT_COUNT)
  );
  // Logo id each slot is actually rendering. Lags `slots` until the glitch
  // reaches its midpoint, so it is reserved too when picking the next logo.
  const displayedIdsRef = useRef<(string | undefined)[]>([]);
  const handleDisplayChange = useCallback((index: number, logo: UsedByLogo) => {
    displayedIdsRef.current[index] = logo.id;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setVisibleSlotCount(
        mq.matches ? DESKTOP_VISIBLE_SLOT_COUNT : MOBILE_VISIBLE_SLOT_COUNT
      );
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion || offscreen) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const scheduleFlip = () => {
      timeoutId = setTimeout(
        () => {
          if (cancelled) {
            return;
          }

          setSlots((current) =>
            pickNextSlots(
              usedByLogos,
              current,
              visibleSlotCount,
              displayedIdsRef.current
            )
          );
          scheduleFlip();
        },
        randomBetween(FLIP_MIN_DELAY_MS, FLIP_MAX_DELAY_MS)
      );
    };

    scheduleFlip();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [offscreen, reducedMotion, visibleSlotCount]);

  return (
    <ul
      className="grid grid-cols-3 gap-4 md:grid-cols-6 lg:grid-cols-8"
      ref={visibilityRef}
    >
      {SLOT_KEYS.slice(0, visibleSlotCount).map((slotKey, index) => {
        const logo = slots[index];
        if (!logo) {
          return null;
        }

        return (
          <UsedByGlitchLogo
            index={index}
            key={slotKey}
            logo={logo}
            onDisplayChange={handleDisplayChange}
            paused={offscreen}
            reducedMotion={Boolean(reducedMotion)}
          />
        );
      })}
    </ul>
  );
}
