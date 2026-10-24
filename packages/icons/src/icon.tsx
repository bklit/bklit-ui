import type { ComponentProps, SVGProps } from "react";
import { iconStyle, icons } from "./generated/icons";

/**
 * Icon names this monorepo ships. Generated from usages by
 * `packages/icons/scripts/generate-icons.mjs` — a name outside this union is a
 * type error; run `pnpm --filter @bklitui/icons generate` to add it.
 */
export type IconName = keyof typeof icons;

/** The single Central style variant baked into the generated icon data. */
export const defaultIconStyle = iconStyle;

export type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: string | number;
  ariaHidden?: boolean;
};

/**
 * Renders one Central icon (round join, outlined, radius 0, stroke 1.5).
 * Same markup as `CentralIcon` from `@central-icons-react/all`, without
 * bundling every icon in every style.
 */
function Icon({
  name,
  size = 24,
  ariaHidden = true,
  color,
  style,
  children,
  ...props
}: IconProps) {
  const entry = icons[name] as (typeof icons)[IconName] | undefined;
  if (!entry) {
    // A cast or stale name slipped past the types: render nothing rather than
    // crash the page.
    return null;
  }
  const [title, markup] = entry;
  const dimension = typeof size === "number" ? `${size}px` : size;
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative by default; <title> renders when ariaHidden is false
    <svg
      {...props}
      aria-hidden={ariaHidden}
      fill="none"
      height={dimension}
      role={ariaHidden ? undefined : "img"}
      style={{ color, ...style }}
      viewBox="0 0 24 24"
      width={dimension}
      xmlns="http://www.w3.org/2000/svg"
    >
      {ariaHidden ? null : <title>{title}</title>}
      {children}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static SVG markup generated from @central-icons-react */}
      <g dangerouslySetInnerHTML={{ __html: markup }} />
    </svg>
  );
}

export type IconComponentProps = ComponentProps<typeof Icon>;

export { Icon };
