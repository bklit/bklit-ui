"use client";

import { Icon } from "@bklitui/icons";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ParticleBadge } from "@/components/particle-badge";
import { Button } from "@/components/ui/button";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";

const youtubeVideoId = "I3PLqHImYbE";
const youtubeEmbedSrc = `https://www.youtube.com/embed/${youtubeVideoId}?si=OyxWrJnXGJI6T6G1`;
const youtubeThumbnailSrc = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
const youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

const sectionTitleClassName =
  "font-light text-4xl text-foreground tracking-tight";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function HomeStudioSection() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedViewRef = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: easeOutQuint };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasTrackedViewRef.current) {
          return;
        }
        hasTrackedViewRef.current = true;
        trackEvent("homepage_video_view", {
          url: getAnalyticsUrl(),
          video_src: youtubeWatchUrl,
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const startPlayback = useCallback(() => {
    trackEvent("homepage_video_click", {
      action: "start",
      url: getAnalyticsUrl(),
      video_src: youtubeWatchUrl,
    });
    trackEvent("homepage_video_play", {
      url: getAnalyticsUrl(),
      video_src: youtubeWatchUrl,
      current_time: 0,
    });
    setIsActive(true);
  }, []);

  return (
    <section
      aria-label="Studio Version 2"
      className="mx-auto w-full max-w-4xl space-y-5 text-center"
      ref={sectionRef}
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

      <motion.div
        animate="animate"
        className="relative overflow-hidden rounded-xl border border-border bg-card"
        initial="initial"
        transition={{ ...transition, delay: reducedMotion ? 0 : 0.08 }}
        variants={fadeUp}
      >
        <div className="relative aspect-video w-full">
          {isActive ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              src={`${youtubeEmbedSrc}&autoplay=1`}
              title="YouTube video player"
            />
          ) : (
            <button
              aria-label="Play Studio video"
              className="group absolute inset-0 block w-full cursor-pointer"
              onClick={startPlayback}
              type="button"
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: YouTube poster thumbnail */}
                <img
                  alt=""
                  className={cn(
                    "h-full w-full origin-center object-cover",
                    reducedMotion
                      ? "scale-100"
                      : "scale-100 transition-transform duration-[1800ms] ease-out group-hover:scale-110"
                  )}
                  height={720}
                  src={youtubeThumbnailSrc}
                  width={1280}
                />
              </div>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Icon
                  className="size-[62px] text-foreground/70 transition-colors duration-300 group-hover:text-white"
                  name="IconPlay"
                />
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
