/**
 * Monorepo shim — not shipped in the registry.
 * Registry installs use @ncdai/shimmering-text at `@/components/shimmering-text`.
 */
// biome-ignore lint/performance/noBarrelFile: path alias shim for registry import in chart-loading-label
export {
  ShimmeringText,
  type ShimmeringTextProps,
} from "../../../../apps/web/components/shimmering-text";
