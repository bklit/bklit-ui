"use client";

import type { ChoroplethMarkerShape } from "@bklitui/ui/charts";
import { IconToggleGroup } from "@/components/controls/icon-toggle-group";
import { StudioToggleGroupItem } from "@/components/controls/studio-toggle-group";

const SHAPES: { value: ChoroplethMarkerShape; label: string; d: string }[] = [
  {
    value: "circle",
    label: "Circle",
    d: "M10 4.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11Z",
  },
  { value: "triangle", label: "Triangle", d: "M10 4l6 11H4Z" },
  { value: "square", label: "Square", d: "M5 5h10v10H5Z" },
  { value: "diamond", label: "Diamond", d: "M10 3.5l6.5 6.5L10 16.5 3.5 10Z" },
  {
    value: "pin",
    label: "Pin",
    d: "M10 17l-4.2-6a5 5 0 1 1 8.4 0Zm0-11.2a1.9 1.9 0 1 0 0 3.8a1.9 1.9 0 1 0 0-3.8Z",
  },
];

export function MarkerShapePicker({
  value,
  onChange,
}: {
  value: ChoroplethMarkerShape;
  onChange: (value: ChoroplethMarkerShape) => void;
}) {
  return (
    <IconToggleGroup onValueChange={onChange} value={value}>
      {SHAPES.map((shape) => (
        <StudioToggleGroupItem
          aria-label={shape.label}
          key={shape.value}
          title={shape.label}
          value={shape.value}
        >
          <svg aria-hidden={true} className="size-5" viewBox="0 0 20 20">
            <path className="fill-current" d={shape.d} fillRule="evenodd" />
          </svg>
        </StudioToggleGroupItem>
      ))}
    </IconToggleGroup>
  );
}
