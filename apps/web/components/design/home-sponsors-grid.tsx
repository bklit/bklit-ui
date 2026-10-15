"use client";

import { DEFAULT_CHART_ENTER_TRANSITION } from "@bklitui/ui/charts";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Frame } from "@/components/ui/frame";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import {
  premiumLogoClassName,
  premiumSponsorSlots,
  type Sponsor,
  type SponsorSlot,
  type SponsorTier,
  silverLogoClassName,
  silverSponsorSlots,
  sponsorLink,
  sponsorTierLabels,
} from "@/lib/sponsors";
import { cn } from "@/lib/utils";
import { DesignSponsorPanel } from "./sponsor-panel";

const chartEase = DEFAULT_CHART_ENTER_TRANSITION.ease as [
  number,
  number,
  number,
  number,
];
const sponsorLogoEnterDuration = 0.45;
const sponsorLogoExitDuration = 0.32;
const sponsorLabelEnterDuration = 0.45;
const sponsorLabelExitDuration = 0.32;
const sponsorLabelEnterDelay = 0.1;
const sponsorBlurClearDuration = 0.28;

function getSponsorLabelTransition(
  active: boolean,
  reducedMotion: boolean | null
) {
  if (reducedMotion) {
    return { duration: 0 };
  }

  if (active) {
    return {
      y: {
        duration: sponsorLabelEnterDuration,
        ease: chartEase,
        delay: sponsorLabelEnterDelay,
      },
      opacity: {
        duration: sponsorLabelEnterDuration,
        ease: chartEase,
        delay: sponsorLabelEnterDelay,
      },
      filter: {
        duration: sponsorBlurClearDuration,
        ease: chartEase,
      },
    };
  }

  return {
    duration: sponsorLabelExitDuration,
    ease: chartEase,
  };
}

function trackSponsorClick(location: "button" | "card", sponsorUrl: string) {
  trackEvent("homepage_sponsor_click", {
    location,
    url: getAnalyticsUrl(),
    sponsor_url: sponsorUrl,
  });
}

function SponsorPlaceholder({
  minHeight,
  patternReversed,
}: {
  minHeight: number;
  patternReversed: boolean;
}) {
  return (
    <DesignSponsorPanel
      href={sponsorLink}
      minHeight={minHeight}
      onClick={() => trackSponsorClick("card", sponsorLink)}
      patternReversed={patternReversed}
      variant="placeholder"
    >
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="inline-flex rotate-45 scale-100 font-light font-mono text-muted-foreground text-xs transition-[rotate,scale,color] duration-[180ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:rotate-0 group-hover:scale-110 group-hover:text-foreground motion-reduce:rotate-0 motion-reduce:transition-none">
          +
        </span>
      </span>
    </DesignSponsorPanel>
  );
}

function SponsorLogoHoverContent({
  Logo,
  active,
  logoClassName,
  tierLabel,
}: {
  Logo: Sponsor["Logo"];
  active: boolean;
  logoClassName: string;
  tierLabel: string;
}) {
  const reducedMotion = useReducedMotion();
  const showLabel = active;

  const logoTransition = reducedMotion
    ? { duration: 0 }
    : {
        duration: active ? sponsorLogoEnterDuration : sponsorLogoExitDuration,
        ease: chartEase,
      };

  const labelTransition = getSponsorLabelTransition(active, reducedMotion);

  return (
    <div className="flex flex-col items-center">
      <motion.span
        animate={{ y: active ? -14 : 0 }}
        initial={false}
        transition={logoTransition}
      >
        <Logo className={logoClassName} />
      </motion.span>
      <motion.span
        animate={{
          y: showLabel ? 0 : -13,
          opacity: showLabel ? 1 : 0,
          filter: showLabel ? "blur(0px)" : "blur(2px)",
        }}
        aria-hidden={!showLabel}
        className="whitespace-nowrap font-light text-muted-foreground text-xs"
        initial={false}
        transition={labelTransition}
      >
        {tierLabel}
      </motion.span>
    </div>
  );
}

function SponsorLogoPanel({
  sponsor,
  logoClassName,
  minHeight,
  tier,
}: {
  sponsor: Sponsor;
  logoClassName: string;
  minHeight: number;
  tier: SponsorTier;
}) {
  const [active, setActive] = useState(false);
  const { href, name } = sponsor;
  const tierLabel = sponsorTierLabels[tier];

  return (
    <DesignSponsorPanel
      ariaLabel={`${name}, ${tierLabel}`}
      href={href}
      minHeight={minHeight}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(false);
        }
      }}
      onClick={() => trackSponsorClick("card", href)}
      onFocus={() => setActive(true)}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      variant="default"
    >
      <SponsorLogoHoverContent
        active={active}
        Logo={sponsor.Logo}
        logoClassName={logoClassName}
        tierLabel={tierLabel}
      />
    </DesignSponsorPanel>
  );
}

function getMobileSponsorSlots(
  slots: SponsorSlot[],
  variant: "premium" | "silver"
): SponsorSlot[] {
  const sponsors = slots.filter(
    (slot): slot is Sponsor => slot !== "placeholder"
  );

  if (variant === "silver" && sponsors.length % 2 === 1) {
    return [...sponsors, "placeholder"];
  }

  return sponsors;
}

function SponsorSlotItems({
  slots,
  minHeight,
  variant,
  logoClassName,
  placeholderOffset = 0,
  keyPrefix,
}: {
  slots: SponsorSlot[];
  minHeight: number;
  variant: "premium" | "silver";
  logoClassName: string;
  placeholderOffset?: number;
  keyPrefix: string;
}) {
  let placeholderIndex = placeholderOffset;

  return slots.map((slot, index) =>
    slot === "placeholder" ? (
      <SponsorPlaceholder
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder slots
        key={`${keyPrefix}-placeholder-${index}`}
        minHeight={minHeight}
        patternReversed={placeholderIndex++ % 2 === 1}
      />
    ) : (
      <SponsorLogoPanel
        key={`${keyPrefix}-${slot.id}`}
        logoClassName={logoClassName}
        minHeight={minHeight}
        sponsor={slot}
        tier={variant}
      />
    )
  );
}

function SponsorRow({
  slots,
  minHeight,
  variant,
  logoClassName,
  placeholderOffset = 0,
}: {
  slots: SponsorSlot[];
  minHeight: number;
  variant: "premium" | "silver";
  logoClassName: string;
  placeholderOffset?: number;
}) {
  const mobileSlots = getMobileSponsorSlots(slots, variant);
  const gridClassName =
    variant === "premium"
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-2 md:grid-cols-5";

  return (
    <div className="relative w-full overflow-visible">
      <div className={cn("grid w-full gap-1 md:hidden", gridClassName)}>
        <SponsorSlotItems
          keyPrefix={`${variant}-mobile`}
          logoClassName={logoClassName}
          minHeight={minHeight}
          placeholderOffset={placeholderOffset}
          slots={mobileSlots}
          variant={variant}
        />
      </div>
      <div className={cn("hidden w-full gap-1 md:grid", gridClassName)}>
        <SponsorSlotItems
          keyPrefix={`${variant}-desktop`}
          logoClassName={logoClassName}
          minHeight={minHeight}
          placeholderOffset={placeholderOffset}
          slots={slots}
          variant={variant}
        />
      </div>
    </div>
  );
}

export function HomeSponsorsGrid() {
  const premiumPlaceholderCount = premiumSponsorSlots.filter(
    (slot) => slot === "placeholder"
  ).length;

  return (
    <Frame className="gap-1">
      <SponsorRow
        logoClassName={premiumLogoClassName}
        minHeight={160}
        slots={premiumSponsorSlots}
        variant="premium"
      />
      <SponsorRow
        logoClassName={silverLogoClassName}
        minHeight={140}
        placeholderOffset={premiumPlaceholderCount}
        slots={silverSponsorSlots}
        variant="silver"
      />
    </Frame>
  );
}
