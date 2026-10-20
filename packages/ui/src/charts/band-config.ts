import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { isChartClipPassthrough } from "./chart-child-passthrough";
import { normalizeYAxisId } from "./y-axis-scales";

/** Y-domain inputs collected from a `<Band>` child. */
export interface BandConfig {
  yAxisId: string;
  upperKey: string;
  lowerKey: string;
}

interface BandConfigProps {
  upperKey?: unknown;
  lowerKey?: unknown;
  yAxisId?: string | number;
}

function getChildComponentName(child: ReactElement) {
  const childType = child.type as { displayName?: string; name?: string };
  return typeof child.type === "function"
    ? childType.displayName || childType.name || ""
    : "";
}

/** Collect `<Band>` props from chart children so band edges extend the y-domain. */
export function extractBandConfigs(children: ReactNode): BandConfig[] {
  const configs: BandConfig[] = [];

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) {
        return;
      }

      if (child.type === Fragment) {
        visit((child.props as { children?: ReactNode }).children);
        return;
      }

      if (getChildComponentName(child) === "Band") {
        const props = child.props as BandConfigProps | undefined;
        if (
          typeof props?.upperKey === "string" &&
          props.upperKey.length > 0 &&
          typeof props.lowerKey === "string" &&
          props.lowerKey.length > 0
        ) {
          configs.push({
            yAxisId: normalizeYAxisId(props.yAxisId),
            upperKey: props.upperKey,
            lowerKey: props.lowerKey,
          });
        }
        return;
      }

      if (isChartClipPassthrough(child.type)) {
        visit((child.props as { children?: ReactNode }).children);
        return;
      }

      const childProps = child.props as { children?: ReactNode } | undefined;
      if (childProps?.children) {
        visit(childProps.children);
      }
    });
  };

  visit(children);
  return configs;
}

/** Band edge keys grouped by y-axis id (deduplicated, insertion order). */
export function bandKeysByAxis(
  configs: BandConfig[]
): Record<string, string[]> {
  const byAxis: Record<string, string[]> = {};
  for (const config of configs) {
    const keys = byAxis[config.yAxisId] ?? [];
    for (const key of [config.upperKey, config.lowerKey]) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    byAxis[config.yAxisId] = keys;
  }
  return byAxis;
}
