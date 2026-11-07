"use client";

import { Icon } from "@bklitui/icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GithubStarCount } from "@/components/github-star-count";
import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Frame, FramePanel } from "@/components/ui/frame";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { GITHUB_URL } from "@/lib/seo";
import {
  dismissStarPrompt,
  recordPageSeen,
  useStarPromptDismissed,
} from "@/lib/star-prompt";

/** Lets the page transition settle before the card arrives. */
const SHOW_DELAY_MS = 900;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function trackStarClick(location: string) {
  trackEvent("github_star_click", { location, url: getAnalyticsUrl() });
}

function StarButton({
  location,
  onClick,
}: {
  location: string;
  onClick?: () => void;
}) {
  return (
    <Button
      className="w-fit"
      onClick={() => {
        trackStarClick(location);
        onClick?.();
      }}
      render={
        <a href={GITHUB_URL} rel="noopener noreferrer" target="_blank" />
      }
      size="xs"
      variant="outline"
    >
      <GitHubIcon aria-hidden className="size-3.5" />
      Star on GitHub
      <span className="flex items-center gap-0.5 text-muted-foreground tabular-nums">
        <Icon className="size-3" name="IconStar" />
        <GithubStarCount />
      </span>
    </Button>
  );
}

/**
 * Floating "star the repo" card. Shows from the second page of a visit, at the
 * bottom right on desktop and full width at the bottom on mobile. Dismissing
 * (or starring) hides it for 14 days; the docs sidebar then carries
 * `StarPromptSidebarCard` instead.
 */
export function StarPrompt() {
  const pathname = usePathname();
  const dismissed = useStarPromptDismissed();
  const reducedMotion = useReducedMotion();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (recordPageSeen(pathname) < 2) {
      return;
    }
    const id = window.setTimeout(() => setEligible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [pathname]);

  const open = eligible && dismissed === false;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-80"
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.15 } }
              : {
                  opacity: 0,
                  y: 8,
                  scale: 0.98,
                  transition: { duration: 0.18, ease: EASE_OUT },
                }
          }
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }
          }
          key="star-prompt"
          style={{ transformOrigin: "bottom right" }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          <Card
            aria-label="Star Bklit UI on GitHub"
            className="shadow-lg/5"
            role="complementary"
          >
            <CardHeader className="gap-1 p-4">
              <CardTitle className="text-sm leading-tight">
                Enjoying Bklit UI?
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                A star on GitHub helps more people find it.
              </CardDescription>
              <CardAction className="-me-1.5 -mt-1.5">
                <Button
                  aria-label="Dismiss"
                  onClick={() => {
                    trackEvent("star_prompt_dismiss", {
                      url: getAnalyticsUrl(),
                    });
                    dismissStarPrompt();
                  }}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Icon className="size-3.5" name="IconCrossSmall" />
                </Button>
              </CardAction>
              <div className="col-span-full mt-2">
                <StarButton
                  location="star_prompt"
                  onClick={dismissStarPrompt}
                />
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Docs right-rail version, shown once the floating card has been dismissed. */
export function StarPromptSidebarCard() {
  const dismissed = useStarPromptDismissed();
  if (!dismissed) {
    return null;
  }
  return (
    <Frame className="mt-3 shrink-0">
      <FramePanel className="flex flex-col gap-1.5 p-4">
        <div className="text-balance font-medium text-foreground text-sm leading-tight">
          Enjoying Bklit UI?
        </div>
        <div className="text-muted-foreground text-xs leading-relaxed">
          A star on GitHub helps more people find it.
        </div>
        <div className="mt-2">
          <StarButton location="docs_toc" />
        </div>
      </FramePanel>
    </Frame>
  );
}
