"use client";

import { SegmentedControl } from "@/ui/segmented-control";

function YesNoSwitch({
  value,
  onValueChange,
  yesLabel = "Yes",
  noLabel = "No",
  name,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Yes or no",
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <SegmentedControl
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      name={name}
      onValueChange={(next) => onValueChange(next === "yes")}
      options={[
        { value: "yes", label: yesLabel },
        { value: "no", label: noLabel },
      ]}
      value={value ? "yes" : "no"}
    />
  );
}

export { YesNoSwitch };
