"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from "./chart-center-typography";
import {
  ChartStatFlow,
  type ChartStatFlowFormat,
  defaultChartStatFlowFormat,
} from "./chart-stat-flow";

export type GaugeLabelPlacement = "top" | "bottom" | "left" | "right";
export type GaugeLabelAlign = "start" | "center" | "end";

export interface GaugeLabelShellProps {
  centerValue: number;
  defaultLabel?: string;
  prefix?: string;
  suffix?: string;
  formatOptions?: ChartStatFlowFormat;
  align?: GaugeLabelAlign;
  className?: string;
}

const labelAlignClass: Record<GaugeLabelAlign, string> = {
  start: "items-start text-left",
  center: "items-center text-center",
  end: "items-end text-right",
};

export function GaugeLabelShell({
  centerValue,
  defaultLabel = "Total",
  prefix,
  suffix,
  formatOptions = defaultChartStatFlowFormat,
  align = "center",
  className,
}: GaugeLabelShellProps) {
  return (
    <div
      className={cn(
        chartCenterContainerClassName,
        "flex min-w-0 flex-col",
        labelAlignClass[align],
        className
      )}
    >
      <ChartStatFlow
        formatOptions={formatOptions}
        label={defaultLabel}
        labelClassName={cn(
          chartCenterLabelClassName,
          "text-[length:var(--chart-foreground-muted)]"
        )}
        prefix={prefix}
        suffix={suffix}
        value={centerValue}
        valueClassName={cn(
          chartCenterValueClassName,
          "text-[length:var(--chart-foreground)]"
        )}
      />
    </div>
  );
}

const crossAxisSelf: Record<GaugeLabelAlign, string> = {
  start: "self-start",
  center: "self-center",
  end: "self-end",
};

const crossAxisAlign: Record<GaugeLabelAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

const inlineAxisAlign: Record<GaugeLabelAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

export function GaugeLabelLayout({
  placement,
  align,
  label,
  children,
  className,
}: {
  placement: GaugeLabelPlacement;
  align: GaugeLabelAlign;
  label: ReactNode | null;
  children: ReactNode;
  className?: string;
}) {
  if (!label) {
    return <div className={cn("w-full min-w-0", className)}>{children}</div>;
  }

  if (placement === "top") {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-3",
          crossAxisAlign[align],
          className
        )}
      >
        <div className={crossAxisSelf[align]}>{label}</div>
        <div className="w-full min-w-0">{children}</div>
      </div>
    );
  }

  if (placement === "bottom") {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-3",
          crossAxisAlign[align],
          className
        )}
      >
        <div className="w-full min-w-0">{children}</div>
        <div className={crossAxisSelf[align]}>{label}</div>
      </div>
    );
  }

  if (placement === "left") {
    return (
      <div
        className={cn(
          "flex w-full min-w-0 items-center gap-4",
          inlineAxisAlign[align],
          className
        )}
      >
        <div className="shrink-0">{label}</div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-4",
        inlineAxisAlign[align],
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <div className="shrink-0">{label}</div>
    </div>
  );
}
