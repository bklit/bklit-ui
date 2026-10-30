"use client";

import { Button } from "@/components/ui/button";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

interface ChoiceControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Labelled segmented radio group (site UI). */
export function ChoiceControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: ChoiceControlProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <SegmentedControl
        aria-label={label}
        render={
          <RadioGroupPrimitive
            disabled={disabled}
            onValueChange={(next) => onChange(next as T)}
            value={value}
          />
        }
        size="sm"
      >
        {options.map((option) => (
          <SegmentedControlItem
            key={option.value}
            render={<RadioPrimitive.Root value={option.value} />}
          >
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium text-lg">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Wrapping pill picker for long option lists (variants). */
export function PillPicker<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: ChoiceControlProps<T>) {
  return (
    <div className="flex items-start gap-2">
      <span className="pt-1 text-muted-foreground text-xs">{label}</span>
      {/* biome-ignore lint/a11y/useSemanticElements: pill buttons, not a form fieldset */}
      <div aria-label={label} className="flex flex-wrap gap-1.5" role="group">
        {options.map((option) => (
          <Button
            aria-pressed={option.value === value}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            size="xs"
            variant={option.value === value ? "default" : "outline"}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
