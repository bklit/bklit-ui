"use client";

import Link from "fumadocs-core/link";
import { motion, useReducedMotion } from "motion/react";
import { ChanhDaiIcon } from "@/components/icons/chanhdai";
import { OpenPanelIcon } from "@/components/icons/openpanel";
import { useGithubStats } from "@/components/providers/github-stats-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";

const sponsorLink = "https://github.com/sponsors/uixmat";
const openPanelLink = "https://openpanel.dev";
const chanhDaiLink = "https://chanhdai.com";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function trackSponsorClick(location: "button" | "card") {
  trackEvent("homepage_sponsor_click", {
    location,
    url: getAnalyticsUrl(),
    sponsor_url: sponsorLink,
  });
}

function SponsorSkeletonCard({
  className,
  variant = "premium",
}: {
  className?: string;
  variant?: "premium" | "silver";
}) {
  return (
    <Link
      aria-label="Become a sponsor"
      className={cn(
        "group flex items-center justify-center rounded-xl border border-border border-dashed bg-card/40 transition-colors hover:border-foreground/20 hover:bg-card/70",
        variant === "silver" ? "aspect-[5/4]" : "aspect-[5/3]",
        className
      )}
      external
      href={sponsorLink}
      onClick={() => trackSponsorClick("card")}
    >
      <span
        className={cn(
          "font-light font-mono text-muted-foreground transition-colors group-hover:text-foreground",
          variant === "silver" ? "text-[10px]" : "text-xs"
        )}
      >
        +
      </span>
    </Link>
  );
}

function OpenPanelSponsorCard({ className }: { className?: string }) {
  return (
    <Link
      aria-label="OpenPanel"
      className={cn(
        "group flex aspect-[5/3] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-card/90",
        className
      )}
      external
      href={openPanelLink}
    >
      <OpenPanelIcon className="h-6 w-16 text-foreground transition-opacity group-hover:opacity-80" />
      <span className="font-light text-muted-foreground text-xs transition-colors group-hover:text-foreground">
        OpenPanel
      </span>
    </Link>
  );
}

function ChanhDaiSponsorCard({
  className,
  variant = "premium",
}: {
  className?: string;
  variant?: "premium" | "silver";
}) {
  return (
    <Link
      aria-label="Chánh Đại"
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-card/90",
        variant === "silver" ? "aspect-[5/4]" : "aspect-[5/3]",
        className
      )}
      external
      href={chanhDaiLink}
    >
      <ChanhDaiIcon className="h-4 w-8 text-foreground transition-opacity group-hover:opacity-80" />
      <span
        className={cn(
          "font-light text-muted-foreground transition-colors group-hover:text-foreground",
          variant === "silver" ? "text-[10px]" : "text-xs"
        )}
      >
        Chánh Đại
      </span>
    </Link>
  );
}

function ContributorAvatar({
  login,
  avatarUrl,
  profileUrl,
}: {
  login: string;
  avatarUrl: string;
  profileUrl: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            aria-label={login}
            className="inline-flex rounded-full ring-offset-background transition-[transform,opacity] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            external
            href={profileUrl}
          />
        }
      >
        {/* biome-ignore lint/performance/noImgElement: GitHub avatar URL */}
        <img
          alt=""
          className="size-9 rounded-full object-cover"
          height={36}
          src={avatarUrl}
          width={36}
        />
      </TooltipTrigger>
      <TooltipContent>{login}</TooltipContent>
    </Tooltip>
  );
}

function ContributorSkeletons() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => (
        <div className="size-9 animate-pulse rounded-full bg-muted" key={id} />
      ))}
    </div>
  );
}

export function HomeSponsorsSection() {
  const reducedMotion = useReducedMotion();
  const { contributors, isContributorsLoading } = useGithubStats();

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const };

  return (
    <section
      aria-label="Sponsors and contributors"
      className="mx-auto w-full space-y-10 py-[100px]"
    >
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <motion.h2
          animate="animate"
          className="font-light text-4xl text-foreground tracking-tight"
          initial="initial"
          transition={transition}
          variants={fadeUp}
        >
          Premium Sponsors
        </motion.h2>

        <motion.div
          animate="animate"
          className="grid grid-cols-3 gap-3 sm:gap-4"
          initial="initial"
          transition={transition}
          variants={containerVariants}
        >
          <motion.div transition={transition} variants={fadeUp}>
            <SponsorSkeletonCard />
          </motion.div>
          <motion.div transition={transition} variants={fadeUp}>
            <OpenPanelSponsorCard />
          </motion.div>
          <motion.div transition={transition} variants={fadeUp}>
            <SponsorSkeletonCard />
          </motion.div>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-[44rem] space-y-5">
        <motion.h2
          animate="animate"
          className="font-light text-2xl text-foreground tracking-tight"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.1 }}
          variants={fadeUp}
        >
          Silver Sponsors
        </motion.h2>

        <motion.div
          animate="animate"
          className="grid grid-cols-5 gap-3 sm:gap-4"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.12 }}
          variants={containerVariants}
        >
          {["a", "b"].map((id) => (
            <motion.div key={id} transition={transition} variants={fadeUp}>
              <SponsorSkeletonCard variant="silver" />
            </motion.div>
          ))}
          <motion.div transition={transition} variants={fadeUp}>
            <ChanhDaiSponsorCard variant="silver" />
          </motion.div>
          {["c", "d"].map((id) => (
            <motion.div key={id} transition={transition} variants={fadeUp}>
              <SponsorSkeletonCard variant="silver" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate="animate"
          className="flex justify-center pt-1"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.18 }}
          variants={fadeUp}
        >
          <Button
            nativeButton={false}
            render={
              <Link
                external
                href={sponsorLink}
                onClick={() => trackSponsorClick("button")}
              >
                Become a sponsor
              </Link>
            }
            size="lg"
            variant="outline"
          />
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-2xl space-y-4">
        <motion.h3
          animate="animate"
          className="font-medium text-muted-foreground text-sm"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.15 }}
          variants={fadeUp}
        >
          Contributors
        </motion.h3>

        <motion.div
          animate="animate"
          initial="initial"
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.2 }}
          variants={fadeUp}
        >
          <TooltipProvider delay={200}>
            {isContributorsLoading ? (
              <ContributorSkeletons />
            ) : (
              <motion.div
                animate="animate"
                className="flex flex-wrap justify-center gap-2"
                initial="initial"
                variants={containerVariants}
              >
                {contributors.map((contributor) => (
                  <motion.div
                    key={contributor.id}
                    transition={transition}
                    variants={fadeUp}
                  >
                    <ContributorAvatar
                      avatarUrl={contributor.avatar_url}
                      login={contributor.login}
                      profileUrl={contributor.html_url}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TooltipProvider>
        </motion.div>
      </div>
    </section>
  );
}
