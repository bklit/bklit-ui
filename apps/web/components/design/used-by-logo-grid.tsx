"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type UsedByLogo,
  usedByLogoClassName,
  usedByLogos,
} from "@/components/brands/used-by-logos";
import { GlitchSwapLogo } from "@/components/design/glitch-swap-logo";
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

function pickNextSlots(current: UsedByLogo[], visibleSlotCount: number) {
  const visibleIds = new Set(
    current.slice(0, visibleSlotCount).map((logo) => logo.id)
  );
  const hidden = usedByLogos.filter((logo) => !visibleIds.has(logo.id));

  if (hidden.length === 0) {
    return current;
  }

  const slotIndex = Math.floor(Math.random() * visibleSlotCount);
  const nextLogo = hidden[Math.floor(Math.random() * hidden.length)];

  if (!nextLogo) {
    return current;
  }

  const next = [...current];
  next[slotIndex] = nextLogo;
  return next;
}

function UsedByGlitchLogo({
  logo,
  paused,
  reducedMotion,
}: {
  logo: UsedByLogo;
  paused: boolean;
  reducedMotion: boolean;
}) {
  const [linkLogo, setLinkLogo] = useState(logo);

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
            onDisplayChange={setLinkLogo}
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
  const [slots, setSlots] = useState(() =>
    usedByLogos.slice(0, DESKTOP_VISIBLE_SLOT_COUNT)
  );

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

          setSlots((current) => pickNextSlots(current, visibleSlotCount));
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
            key={slotKey}
            logo={logo}
            paused={offscreen}
            reducedMotion={Boolean(reducedMotion)}
          />
        );
      })}
    </ul>
  );
}
