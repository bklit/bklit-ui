import {
  CentralIcon as CentralIconPrimitive,
  type CentralIconProps,
} from "@central-icons-react/all";
import type {
  CentralIconFill,
  CentralIconJoin,
  CentralIconName,
  CentralIconRadius,
  CentralIconStroke,
} from "@central-icons-react/all/icons";
import type { ComponentProps } from "react";

export type IconName = CentralIconName;

export const defaultIconStyle = {
  join: "round",
  fill: "outlined",
  radius: "0",
  stroke: "1.5",
} as const satisfies {
  join: CentralIconJoin;
  fill: CentralIconFill;
  radius: CentralIconRadius;
  stroke: CentralIconStroke;
};

export type IconProps = Omit<
  CentralIconProps,
  "join" | "fill" | "radius" | "stroke" | "name"
> & {
  name: IconName;
  join?: CentralIconJoin;
  fill?: CentralIconFill;
  radius?: CentralIconRadius;
  stroke?: CentralIconStroke;
};

function Icon({
  name,
  join = defaultIconStyle.join,
  fill = defaultIconStyle.fill,
  radius = defaultIconStyle.radius,
  stroke = defaultIconStyle.stroke,
  ...props
}: IconProps) {
  return (
    <CentralIconPrimitive
      fill={fill}
      join={join}
      name={name}
      radius={radius}
      stroke={stroke}
      {...props}
    />
  );
}

export type IconComponentProps = ComponentProps<typeof Icon>;

export { Icon };
