import type { CSSProperties } from "react";

/** Pixel padding on all sides, or horizontal / vertical overrides. */
export type UsedByLogoPadding = number | { x: number; y: number };

/** Default padding (px) for every logo inset container. */
export const defaultUsedByLogoPadding: UsedByLogoPadding = 4;

/**
 * Per-logo inset padding overrides. Keys match `UsedByLogo.id`.
 * Tune these to visually align wordmarks inside the shared aspect-ratio cell.
 */
export const usedByLogoPadding: Partial<Record<string, UsedByLogoPadding>> = {
  stripe: { x: 36, y: 0 },
  binance: { x: 12, y: 0 },
  onepassword: { x: 12, y: 0 },
  anthropic: { x: 12, y: 0 },
  shopify: { x: 18, y: 0 },
  supabase: { x: 12, y: 0 },
  framer: { x: 16, y: 0 },
  atlassian: { x: 12, y: 0 },
  daytona: { x: 12, y: 0 },
  wealthsimple: { x: 12, y: 0 },
  tela: { x: 36, y: 0 },
  motion: { x: 12, y: 0 },
  vercel: { x: 18, y: 0 },
  prisma: { x: 20, y: 0 },
  openpanel: { x: 12, y: 0 },
  cal: { x: 16, y: 0 },
};

export function getUsedByLogoPaddingStyle(id: string): CSSProperties {
  const value = usedByLogoPadding[id] ?? defaultUsedByLogoPadding;

  if (typeof value === "number") {
    return { padding: value };
  }

  return {
    paddingBlock: value.y,
    paddingInline: value.x,
  };
}
