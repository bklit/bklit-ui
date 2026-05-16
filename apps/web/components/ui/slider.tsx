"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(() => {
    if (Array.isArray(value)) {
      return value;
    }
    if (Array.isArray(defaultValue)) {
      return defaultValue;
    }
    return [min, max];
  }, [value, defaultValue, min, max]);

  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-disabled:opacity-50",
        className
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative grow overflow-hidden rounded-md bg-muted data-horizontal:h-2 data-vertical:h-full data-horizontal:w-full data-vertical:w-1"
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className="absolute select-none bg-primary data-horizontal:h-full data-vertical:w-full"
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {_values.map((_thumbValue, index) => (
        <SliderPrimitive.Thumb
          className="relative block size-3 shrink-0 cursor-grab select-none rounded-md border border-ring bg-white ring-ring/30 transition-[color,box-shadow,transform] after:absolute after:-inset-2 hover:ring-2 focus-visible:outline-hidden focus-visible:ring-2 active:scale-110 active:cursor-grabbing active:ring-2 disabled:pointer-events-none disabled:opacity-50"
          data-slot="slider-thumb"
          key={_values.length === 1 ? "slider-thumb" : `slider-thumb-${index}`}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
