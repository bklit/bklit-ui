"use client";

import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getUsedByLogoPaddingStyle } from "@/components/brands/used-by-logo-insets";
import {
  type UsedByLogo,
  usedByLogoClassName,
  usedByLogos,
} from "@/components/brands/used-by-logos";

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
const FLIP_DURATION = 0.38;
const FLIP_OUT_EASE = [0.4, 0, 1, 1] as const;
const FLIP_IN_EASE = [0, 0, 0.2, 1] as const;
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

function UsedByFlipLogo({ logo }: { logo: UsedByLogo }) {
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const [displayed, setDisplayed] = useState(logo);
  const displayedIdRef = useRef(logo.id);

  useEffect(() => {
    if (logo.id === displayedIdRef.current) {
      return;
    }

    displayedIdRef.current = logo.id;

    if (reducedMotion) {
      setDisplayed(logo);
      return;
    }

    let cancelled = false;

    const runFlip = async () => {
      await controls.start({
        rotateX: 90,
        transition: { duration: FLIP_DURATION, ease: FLIP_OUT_EASE },
      });

      if (cancelled) {
        return;
      }

      setDisplayed(logo);
      controls.set({ rotateX: -90 });

      await controls.start({
        rotateX: 0,
        transition: { duration: FLIP_DURATION, ease: FLIP_IN_EASE },
      });
    };

    runFlip().catch(() => undefined);

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [controls, logo, reducedMotion]);

  const { href, name, Logo, id } = displayed;

  return (
    <li className="w-full">
      <a
        className="group block w-full"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="aspect-5/2 w-full">
          <div className="perspective-[1000px] h-full w-full">
            <motion.span
              animate={controls}
              className="backface-hidden flex h-full w-full origin-center"
              initial={{ rotateX: 0 }}
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
            >
              <div
                aria-label={name}
                className="flex h-full w-full items-center justify-center"
                role="img"
                style={getUsedByLogoPaddingStyle(id)}
              >
                <Logo className={usedByLogoClassName} />
              </div>
            </motion.span>
          </div>
        </div>
      </a>
    </li>
  );
}

export function UsedByLogoGrid() {
  const reducedMotion = useReducedMotion();
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
    if (reducedMotion) {
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
  }, [reducedMotion, visibleSlotCount]);

  return (
    <ul className="grid grid-cols-3 gap-4 md:grid-cols-6 lg:grid-cols-8">
      {SLOT_KEYS.slice(0, visibleSlotCount).map((slotKey, index) => {
        const logo = slots[index];
        if (!logo) {
          return null;
        }

        return <UsedByFlipLogo key={slotKey} logo={logo} />;
      })}
    </ul>
  );
}
