import type { ReactNode, SVGProps } from "react";

/**
 * SVG gradient defs with the API and markup of `@visx/gradient` 4.0.0:
 * `<defs><linearGradient|radialGradient …><stop/><stop/></…></defs>`.
 *
 * - Two stops (`from` at `fromOffset`, `to` at `toOffset`, opacities default
 *   1) unless `children` replace them.
 * - `rotate` wins over `transform` for `gradientTransform`.
 * - `LinearGradient` is vertical (`x1=0 y1=0 x2=0 y2=1`) by default, only
 *   when no coordinate is truthy; `vertical={false}` leaves them unset
 *   (left → right).
 * - Rest props go on the gradient element after the visx-owned attributes.
 */

interface LinearGradientOwnProps {
  /** Unique id for the gradient. Should be unique across all page elements. */
  id: string;
  /** Start color of gradient. */
  from?: string;
  /** End color of gradient. */
  to?: string;
  /** The x coordinate of the starting point along which the linear gradient is drawn. */
  x1?: string | number;
  /** The x coordinate of the ending point along which the linear gradient is drawn. */
  x2?: string | number;
  /** The y coordinate of the starting point along which the linear gradient is drawn. */
  y1?: string | number;
  /** The y coordinate of the ending point along which the linear gradient is drawn. */
  y2?: string | number;
  /** Number or percent defining where the 'from' starting color is placed along the gradient. Default: "0%" */
  fromOffset?: string | number;
  /** Opacity of the 'from' starting color. Default: 1 */
  fromOpacity?: string | number;
  /** Number or percent defining where the 'to' ending color is placed along the gradient. Default: "100%" */
  toOffset?: string | number;
  /** Opacity of the 'to' ending color. Default: 1 */
  toOpacity?: string | number;
  /** Rotation to apply to gradient. */
  rotate?: string | number;
  /** Transform to apply to the gradient; `rotate` overrides it. */
  transform?: string;
  /** Override of the gradient's stops. */
  children?: ReactNode;
  /** (When no x or y values are passed), orient the gradient vertically instead of horizontally. Default: true */
  vertical?: boolean;
}

export type LinearGradientProps = LinearGradientOwnProps &
  Omit<SVGProps<SVGLinearGradientElement>, keyof LinearGradientOwnProps>;

export type RadialGradientProps = Pick<
  LinearGradientProps,
  | "id"
  | "from"
  | "to"
  | "fromOffset"
  | "fromOpacity"
  | "toOffset"
  | "toOpacity"
  | "rotate"
  | "transform"
  | "children"
> &
  SVGProps<SVGRadialGradientElement>;

export function LinearGradient({
  children,
  id,
  from,
  to,
  x1: x1Prop,
  y1: y1Prop,
  x2: x2Prop,
  y2: y2Prop,
  fromOffset = "0%",
  fromOpacity = 1,
  toOffset = "100%",
  toOpacity = 1,
  rotate,
  transform,
  vertical = true,
  ...restProps
}: LinearGradientProps) {
  let x1 = x1Prop;
  let x2 = x2Prop;
  let y1 = y1Prop;
  let y2 = y2Prop;
  if (vertical && !x1 && !x2 && !y1 && !y2) {
    x1 = "0";
    x2 = "0";
    y1 = "0";
    y2 = "1";
  }
  // An object, not JSX attributes, so the formatter keeps visx's order.
  const props: SVGProps<SVGLinearGradientElement> = {
    id,
    x1,
    y1,
    x2,
    y2,
    gradientTransform: rotate ? `rotate(${rotate})` : transform,
    ...restProps,
  };
  return (
    <defs>
      <linearGradient {...props}>
        {!!children && children}
        {!children && (
          <stop
            offset={fromOffset}
            stopColor={from}
            stopOpacity={fromOpacity}
          />
        )}
        {!children && (
          <stop offset={toOffset} stopColor={to} stopOpacity={toOpacity} />
        )}
      </linearGradient>
    </defs>
  );
}

export function RadialGradient({
  children,
  id,
  from,
  to,
  fromOffset = "0%",
  fromOpacity = 1,
  toOffset = "100%",
  toOpacity = 1,
  rotate,
  transform,
  ...restProps
}: RadialGradientProps) {
  const props: SVGProps<SVGRadialGradientElement> = {
    id,
    gradientTransform: rotate ? `rotate(${rotate})` : transform,
    ...restProps,
  };
  return (
    <defs>
      <radialGradient {...props}>
        {!!children && children}
        {!children && (
          <stop
            offset={fromOffset}
            stopColor={from}
            stopOpacity={fromOpacity}
          />
        )}
        {!children && (
          <stop offset={toOffset} stopColor={to} stopOpacity={toOpacity} />
        )}
      </radialGradient>
    </defs>
  );
}

// Preset colour pairs (visx defaults). All props pass through to
// `<LinearGradient {...props} />`.

export function GradientDarkgreenGreen({
  from = "#184E86",
  to = "#57CA85",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientLightgreenGreen({
  from = "#42E695",
  to = "#3BB2B8",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientOrangeRed({
  from = "#FCE38A",
  to = "#F38181",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientPinkBlue({
  from = "#F02FC2",
  to = "#6094EA",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientPinkRed({
  from = "#F54EA2",
  to = "#FF7676",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientPurpleOrange({
  from = "#7117EA",
  to = "#EA6060",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientPurpleTeal({
  from = "#5B247A",
  to = "#1BCEDF",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientSteelPurple({
  from = "#65799B",
  to = "#5E2563",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}

export function GradientTealBlue({
  from = "#17EAD9",
  to = "#6078EA",
  ...restProps
}: LinearGradientProps) {
  return <LinearGradient from={from} to={to} {...restProps} />;
}
