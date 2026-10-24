/**
 * Full Central Icon System: every icon, every style. This pulls in the whole
 * `@central-icons-react/all` map (~55 MB raw / ~5.9 MB gzip of JS), so only
 * import it where arbitrary names must render (e.g. an icon catalog page).
 * Everywhere else use `Icon` from `@bklitui/icons`.
 */
import { CentralIcon, type CentralIconProps } from "@central-icons-react/all";
import type { CentralIconName } from "@central-icons-react/all/icons";
import { defaultIconStyle } from "./icon";

export type AnyIconProps = Omit<
  CentralIconProps,
  "join" | "fill" | "radius" | "stroke"
> &
  Partial<Pick<CentralIconProps, "join" | "fill" | "radius" | "stroke">> & {
    name: CentralIconName;
  };

/** `Icon` with the same default style, accepting any Central icon name. */
export function AnyIcon(props: AnyIconProps) {
  return <CentralIcon {...defaultIconStyle} {...props} />;
}
