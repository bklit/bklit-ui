"use client";

import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioTab } from "@/components/controls/studio-toggle-group";

export type CrosshairFadeOption = "both" | "none" | "top" | "bottom";

const BAR_WIDTH = 2.5;
const BAR_HEIGHT = 17;
const BAR_X = (20 - BAR_WIDTH) / 2;
const BAR_Y = 1.5;

function fadeStops(mode: CrosshairFadeOption) {
  switch (mode) {
    case "top":
      return [
        { offset: "0%", opacity: 0 },
        { offset: "100%", opacity: 1 },
      ];
    case "bottom":
      return [
        { offset: "0%", opacity: 1 },
        { offset: "100%", opacity: 0 },
      ];
    case "both":
      return [
        { offset: "0%", opacity: 0 },
        { offset: "50%", opacity: 1 },
        { offset: "100%", opacity: 0 },
      ];
    default:
      return null;
  }
}

function CrosshairFadeIcon({ mode }: { mode: CrosshairFadeOption }) {
  const stops = fadeStops(mode);
  const gradientId = `crosshair-fade-icon-${mode}`;

  return (
    <svg aria-hidden className="size-6" viewBox="0 0 20 20">
      <title>Crosshair fade preview</title>
      {stops ? (
        <>
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={gradientId}
              x1={BAR_X + BAR_WIDTH / 2}
              x2={BAR_X + BAR_WIDTH / 2}
              y1={BAR_Y}
              y2={BAR_Y + BAR_HEIGHT}
            >
              {stops.map((stop) => (
                <stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor="currentColor"
                  stopOpacity={stop.opacity}
                />
              ))}
            </linearGradient>
          </defs>
          <rect
            fill={`url(#${gradientId})`}
            height={BAR_HEIGHT}
            rx={BAR_WIDTH / 2}
            width={BAR_WIDTH}
            x={BAR_X}
            y={BAR_Y}
          />
        </>
      ) : (
        <rect
          fill="currentColor"
          height={BAR_HEIGHT}
          rx={BAR_WIDTH / 2}
          width={BAR_WIDTH}
          x={BAR_X}
          y={BAR_Y}
        />
      )}
    </svg>
  );
}

const OPTIONS: {
  value: CrosshairFadeOption;
  label: string;
}[] = [
  { value: "top", label: "Fade top" },
  { value: "both", label: "Fade both" },
  { value: "bottom", label: "Fade bottom" },
  { value: "none", label: "Solid" },
];

export function CrosshairFadePicker({
  value,
  onChange,
}: {
  value: CrosshairFadeOption;
  onChange: (value: CrosshairFadeOption) => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      {OPTIONS.map((opt) => (
        <StudioTab
          aria-label={opt.label}
          key={opt.value}
          title={opt.label}
          value={opt.value}
        >
          <CrosshairFadeIcon mode={opt.value} />
        </StudioTab>
      ))}
    </IconToggleGroup>
  );
}
