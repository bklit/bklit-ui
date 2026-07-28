import type { ComponentType } from "react";
import { OpenPanel } from "@/components/brands/openpanel";
import { ShadcnStudio } from "@/components/brands/shadcn-studio";
import { Vercel } from "@/components/brands/vercel";

function sponsorHref(origin: string, term: string) {
  const url = new URL(origin);
  url.searchParams.set("utm_source", "bklit");
  url.searchParams.set("utm_medium", "website");
  url.searchParams.set("utm_campaign", "homepage");
  url.searchParams.set("utm_content", "sponsors");
  url.searchParams.set("utm_term", term);
  return url.toString();
}

export const sponsorLink = sponsorHref(
  "https://github.com/sponsors/uixmat",
  "become-sponsor"
);

interface SponsorLogoProps {
  className?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  href: string;
  Logo: ComponentType<SponsorLogoProps>;
}

export type SponsorSlot = Sponsor | "placeholder";

export const premiumSponsorSlots: SponsorSlot[] = [
  {
    id: "vercel",
    name: "Vercel",
    href: sponsorHref("https://vercel.com", "premium-vercel"),
    Logo: Vercel,
  },
  {
    id: "openpanel",
    name: "OpenPanel",
    href: sponsorHref("https://openpanel.dev", "premium-openpanel"),
    Logo: OpenPanel,
  },
  "placeholder",
];

export const silverSponsorSlots: SponsorSlot[] = [
  {
    id: "shadcn-studio",
    name: "shadcn studio",
    href: sponsorHref("https://shadcnstudio.com", "silver-shadcn-studio"),
    Logo: ShadcnStudio,
  },
  "placeholder",
  "placeholder",
  "placeholder",
  "placeholder",
];

export interface PastSponsor {
  id: string;
  name: string;
  href: string;
}

export const pastSponsors: PastSponsor[] = [
  {
    id: "chanhdai",
    name: "Chánh Đại",
    href: sponsorHref("https://chanhdai.com", "past-chanhdai"),
  },
];

export const sponsorTierLabels = {
  premium: "Premium sponsor",
  silver: "Silver sponsor",
} as const;

export type SponsorTier = keyof typeof sponsorTierLabels;

export const premiumLogoClassName = "h-8 w-auto max-w-[224px] text-foreground";

export const silverLogoClassName = "h-4 w-auto max-w-[96px] text-foreground";
