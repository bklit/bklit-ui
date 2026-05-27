"use client";

import {
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMuteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";

const coverSrc = "/img/bklit-studio-cover.png";
const videoSrc = "/video/bklit-studio-promo.mp4";

const sectionTitleClassName =
  "font-light text-4xl text-foreground tracking-tight";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;
const actionEnterDuration = 0.2;
const actionExitDuration = 0.16;
const actionStagger = 0.04;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function FloatingVideoControl({
  index,
  visible,
  reducedMotion,
  children,
  className,
  ...buttonProps
}: {
  index: number;
  visible: boolean;
  reducedMotion: boolean | null;
  children: ReactNode;
} & ComponentProps<typeof Button>) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={
            reducedMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: actionEnterDuration,
                    ease: easeOutQuint,
                    delay: index * actionStagger,
                  },
                }
          }
          exit={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 4,
                  transition: {
                    duration: actionExitDuration,
                    ease: easeOutQuint,
                  },
                }
          }
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
        >
          <Button
            className={cn(
              "size-8 bg-background/80 backdrop-blur-sm",
              className
            )}
            {...buttonProps}
          >
            {children}
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function HomeStudioSection() {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedViewRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hoverFine, setHoverFine] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: easeOutQuint };

  const showControls =
    isActive && (reducedMotion === true || coarsePointer || hoverFine);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCoarsePointer(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
          video_src: videoSrc,
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const resetToPoster = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
    trackEvent("homepage_video_complete", {
      url: getAnalyticsUrl(),
      video_src: videoSrc,
    });
    setIsActive(false);
    setIsPlaying(false);
    setIsMuted(true);
  }, []);

  const startPlayback = useCallback(() => {
    trackEvent("homepage_video_click", {
      action: "start",
      url: getAnalyticsUrl(),
      video_src: videoSrc,
    });
    setIsActive(true);

    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.muted = true;
      setIsMuted(true);
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    });
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      trackEvent("homepage_video_click", {
        action: "play",
        url: getAnalyticsUrl(),
        video_src: videoSrc,
      });
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      trackEvent("homepage_video_click", {
        action: "pause",
        url: getAnalyticsUrl(),
        video_src: videoSrc,
        current_time: video.currentTime,
      });
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
    trackEvent("homepage_video_click", {
      action: video.muted ? "mute" : "unmute",
      url: getAnalyticsUrl(),
      video_src: videoSrc,
      current_time: video.currentTime,
    });
  }, []);

  return (
    <section
      aria-label="Studio"
      className="mx-auto w-full max-w-4xl space-y-5 text-center"
      ref={sectionRef}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <motion.h2
            animate="animate"
            className={sectionTitleClassName}
            initial="initial"
            transition={transition}
            variants={fadeUp}
          >
            Studio
          </motion.h2>
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
        onPointerEnter={() => setHoverFine(true)}
        onPointerLeave={() => setHoverFine(false)}
        transition={{ ...transition, delay: reducedMotion ? 0 : 0.08 }}
        variants={fadeUp}
      >
        <div className="relative aspect-video w-full">
          {/* biome-ignore lint/a11y/useMediaCaption: promotional demo without captions track */}
          <video
            className={cn(
              "h-full w-full object-cover",
              !isActive && "pointer-events-none invisible absolute inset-0"
            )}
            onEnded={resetToPoster}
            onPause={() => setIsPlaying(false)}
            onPlay={() => {
              setIsPlaying(true);
              const video = videoRef.current;
              trackEvent("homepage_video_play", {
                url: getAnalyticsUrl(),
                video_src: videoSrc,
                current_time: video?.currentTime ?? 0,
              });
            }}
            playsInline
            preload="metadata"
            ref={videoRef}
            src={videoSrc}
          />

          {isActive ? null : (
            <button
              aria-label="Play Studio video"
              className="group absolute inset-0 block w-full cursor-pointer"
              onClick={startPlayback}
              type="button"
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: static public poster */}
                <img
                  alt=""
                  className={cn(
                    "h-full w-full origin-center object-cover",
                    reducedMotion
                      ? "scale-100"
                      : "scale-100 transition-transform duration-[1800ms] ease-out group-hover:scale-110"
                  )}
                  height={720}
                  src={coverSrc}
                  width={1280}
                />
              </div>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <HugeiconsIcon
                  className="size-[62px] text-foreground/70 transition-colors duration-300 group-hover:text-white"
                  icon={PlayIcon}
                  size={62}
                  strokeWidth={1.25}
                />
              </span>
            </button>
          )}

          {isActive ? (
            <div className="absolute right-3 bottom-3 flex gap-1.5">
              <FloatingVideoControl
                aria-label={isPlaying ? "Pause video" : "Play video"}
                index={0}
                onClick={togglePlay}
                reducedMotion={reducedMotion}
                size="icon"
                type="button"
                variant="outline"
                visible={showControls}
              >
                <HugeiconsIcon
                  icon={isPlaying ? PauseIcon : PlayIcon}
                  size={16}
                  strokeWidth={1.75}
                />
              </FloatingVideoControl>
              <FloatingVideoControl
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                index={1}
                onClick={toggleMute}
                reducedMotion={reducedMotion}
                size="icon"
                type="button"
                variant="outline"
                visible={showControls}
              >
                <HugeiconsIcon
                  icon={isMuted ? VolumeMuteIcon : VolumeHighIcon}
                  size={16}
                  strokeWidth={1.75}
                />
              </FloatingVideoControl>
            </div>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
