"use client";

import { Icon } from "@bklitui/icons";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function youtubeUrls(videoId: string) {
  return {
    embedSrc: `https://www.youtube.com/embed/${videoId}?si=OyxWrJnXGJI6T6G1`,
    thumbnailSrc: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export function HomeStudioVideo({
  videoId = "I3PLqHImYbE",
  className = "",
  animationDelay = 0.08,
  playLabel = "Play Studio video",
  startActive = false,
}: {
  videoId?: string;
  className?: string;
  animationDelay?: number;
  playLabel?: string;
  startActive?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedViewRef = useRef(false);
  const hasTrackedPlayRef = useRef(false);
  const [isActive, setIsActive] = useState(startActive);

  const { embedSrc, thumbnailSrc, watchUrl } = youtubeUrls(videoId);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: easeOutQuint };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
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
          video_src: watchUrl,
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [watchUrl]);

  const startPlayback = useCallback(() => {
    trackEvent("homepage_video_click", {
      action: "start",
      url: getAnalyticsUrl(),
      video_src: watchUrl,
    });
    trackEvent("homepage_video_play", {
      url: getAnalyticsUrl(),
      video_src: watchUrl,
      current_time: 0,
    });
    setIsActive(true);
  }, [watchUrl]);

  useEffect(() => {
    if (!(startActive && isActive) || hasTrackedPlayRef.current) {
      return;
    }

    hasTrackedPlayRef.current = true;
    trackEvent("homepage_video_click", {
      action: "start",
      source: "hero",
      url: getAnalyticsUrl(),
      video_src: watchUrl,
    });
    trackEvent("homepage_video_play", {
      source: "hero",
      url: getAnalyticsUrl(),
      video_src: watchUrl,
      current_time: 0,
    });
  }, [isActive, startActive, watchUrl]);

  return (
    <motion.div
      animate={startActive ? undefined : "animate"}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      initial={startActive ? false : "initial"}
      ref={containerRef}
      transition={
        startActive
          ? undefined
          : { ...transition, delay: reducedMotion ? 0 : animationDelay }
      }
      variants={startActive ? undefined : fadeUp}
    >
      <div className="relative aspect-video w-full">
        {isActive ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            src={`${embedSrc}&autoplay=1`}
            title="YouTube video player"
          />
        ) : (
          <button
            aria-label={playLabel}
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
                src={thumbnailSrc}
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
  );
}
