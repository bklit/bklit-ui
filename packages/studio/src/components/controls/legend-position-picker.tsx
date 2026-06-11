"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { studioFieldLabelClass } from "@/components/controls/control-field-helpers";
import {
  StudioToggleGroup,
  StudioToggleGroupItem,
} from "@/components/controls/studio-toggle-group";
import {
  type LegendPositionId,
  legendPositionId,
  parseLegendPositionId,
} from "@/lib/legend-position";
import { studioLegendRingPathClass } from "@/lib/studio-chrome-classes";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { Label } from "@/ui/label";

const POSITIONS: {
  id: LegendPositionId;
  label: string;
}[] = [
  { id: "top-start", label: "Top left" },
  { id: "top-center", label: "Top center" },
  { id: "top-end", label: "Top right" },
  { id: "bottom-start", label: "Bottom left" },
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-end", label: "Bottom right" },
];

function LegendToggleRing() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative ring, toggle has aria-label
    <svg
      aria-hidden
      className="pointer-events-none size-5 shrink-0"
      viewBox="0 0 20 20"
    >
      <circle
        className={studioLegendRingPathClass}
        cx="10"
        cy="10"
        pathLength={1}
        r="7"
      />
    </svg>
  );
}

function LegendPositionToggle({
  id,
  label,
}: {
  id: LegendPositionId;
  label: string;
}) {
  return (
    <StudioToggleGroupItem
      aria-label={label}
      className="active:not-data-pressed:scale-[0.97] motion-reduce:active:scale-100"
      data-position={id}
      title={label}
      value={id}
    >
      <LegendToggleRing />
    </StudioToggleGroupItem>
  );
}

function useActiveRingCenter(
  pickerRef: RefObject<HTMLDivElement | null>,
  active: LegendPositionId
) {
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }
    const cell = picker.querySelector<HTMLElement>(
      `[data-position="${active}"]`
    );
    if (!cell) {
      return;
    }
    const ring = cell.querySelector("svg");
    const target = ring ?? cell;
    const pickerRect = picker.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setCenter({
      x: targetRect.left - pickerRect.left + targetRect.width / 2,
      y: targetRect.top - pickerRect.top + targetRect.height / 2,
    });
  }, [active, pickerRef]);

  useLayoutEffect(() => {
    measure();
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(picker);
    return () => observer.disconnect();
  }, [measure, pickerRef]);

  return center;
}

export function LegendPositionPicker({
  placement,
  align,
  onChange,
}: {
  placement: StudioUrlState["legendPlacement"];
  align: StudioUrlState["legendAlign"];
  onChange: (
    placement: StudioUrlState["legendPlacement"],
    align: StudioUrlState["legendAlign"]
  ) => void;
}) {
  const active = legendPositionId(placement, align);
  const reducedMotion = useReducedMotion();
  const pickerRef = useRef<HTMLDivElement>(null);
  const center = useActiveRingCenter(pickerRef, active);

  return (
    <div className="space-y-2">
      <Label className={studioFieldLabelClass}>Placement</Label>
      <div className="relative w-full" ref={pickerRef}>
        {center ? (
          <motion.span
            animate={{ x: center.x, y: center.y }}
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-[2] size-1 rounded-full bg-foreground"
            initial={false}
            style={{
              translate: "-50% -50%",
              willChange: "transform",
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", duration: 0.28, bounce: 0.1 }
            }
          />
        ) : null}
        <StudioToggleGroup
          layout="legend"
          onValueChange={(next) => {
            const parsed = parseLegendPositionId(next as LegendPositionId);
            onChange(parsed.placement, parsed.align);
          }}
          value={active}
        >
          {POSITIONS.map((pos) => (
            <LegendPositionToggle id={pos.id} key={pos.id} label={pos.label} />
          ))}
        </StudioToggleGroup>
      </div>
    </div>
  );
}
