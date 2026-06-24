import type { ComponentType } from "react";
import { Anthropic } from "./anthropic";
import { Atlassian } from "./atlassian";
import { Binance } from "./binance";
import { Cal } from "./cal";
import { Daytona } from "./daytona";
import { Framer } from "./framer";
import { Motion } from "./motion";
import { OnePassword } from "./onepassword";
import { OpenPanel } from "./openpanel";
import { Prisma } from "./prisma";
import { Shopify } from "./shopify";
import { Stripe } from "./stripe";
import { Supabase } from "./supabase";
import { Tela } from "./tela";
import { Vercel } from "./vercel";
import { Wealthsimple } from "./wealthsimple";

interface BrandLogoProps {
  className?: string;
}

export interface UsedByLogo {
  id: string;
  name: string;
  href: string;
  Logo: ComponentType<BrandLogoProps>;
}

function trustedByHref(origin: string, brand: string) {
  const url = new URL(origin);
  url.searchParams.set("utm_source", "bklit");
  url.searchParams.set("utm_medium", "website");
  url.searchParams.set("utm_campaign", "homepage");
  url.searchParams.set("utm_content", "trusted-by");
  url.searchParams.set("utm_term", brand);
  return url.toString();
}

/** Add new entries here as brand SVGs land in `components/brands/`. */
export const usedByLogos: UsedByLogo[] = [
  {
    id: "motion",
    name: "Motion",
    href: trustedByHref("https://motion.dev", "motion"),
    Logo: Motion,
  },
  {
    id: "vercel",
    name: "Vercel",
    href: trustedByHref("https://vercel.com", "vercel"),
    Logo: Vercel,
  },
  {
    id: "prisma",
    name: "Prisma",
    href: trustedByHref("https://www.prisma.io", "prisma"),
    Logo: Prisma,
  },
  {
    id: "openpanel",
    name: "OpenPanel",
    href: trustedByHref("https://openpanel.dev", "openpanel"),
    Logo: OpenPanel,
  },
  {
    id: "cal",
    name: "Cal.com",
    href: trustedByHref("https://cal.com", "cal"),
    Logo: Cal,
  },
  {
    id: "supabase",
    name: "Supabase",
    href: trustedByHref("https://supabase.com", "supabase"),
    Logo: Supabase,
  },
  {
    id: "framer",
    name: "Framer",
    href: trustedByHref("https://framer.com", "framer"),
    Logo: Framer,
  },
  {
    id: "atlassian",
    name: "Atlassian",
    href: trustedByHref("https://www.atlassian.com", "atlassian"),
    Logo: Atlassian,
  },
  {
    id: "daytona",
    name: "Daytona",
    href: trustedByHref("https://daytona.io", "daytona"),
    Logo: Daytona,
  },
  {
    id: "wealthsimple",
    name: "Wealthsimple",
    href: trustedByHref("https://www.wealthsimple.com", "wealthsimple"),
    Logo: Wealthsimple,
  },
  {
    id: "tela",
    name: "Tela",
    href: trustedByHref("https://tela.com", "tela"),
    Logo: Tela,
  },
  {
    id: "stripe",
    name: "Stripe",
    href: trustedByHref("https://stripe.com", "stripe"),
    Logo: Stripe,
  },
  {
    id: "binance",
    name: "Binance",
    href: trustedByHref("https://www.binance.com", "binance"),
    Logo: Binance,
  },
  {
    id: "onepassword",
    name: "1Password",
    href: trustedByHref("https://1password.com", "onepassword"),
    Logo: OnePassword,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    href: trustedByHref("https://www.anthropic.com", "anthropic"),
    Logo: Anthropic,
  },
  {
    id: "shopify",
    name: "Shopify",
    href: trustedByHref("https://www.shopify.com", "shopify"),
    Logo: Shopify,
  },
];

export const usedByLogoClassName =
  "h-auto max-h-full w-full max-w-full text-muted-foreground transition-colors duration-[180ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:text-foreground";
