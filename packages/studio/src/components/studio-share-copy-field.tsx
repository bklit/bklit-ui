"use client";

import { StudioCopyButton } from "@/components/studio-copy-button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { Label } from "@/ui/label";

export function StudioShareCopyField({
  id,
  label,
  onCopied,
  value,
}: {
  id: string;
  label: string;
  onCopied?: () => void;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs sm:text-xs" htmlFor={id}>
        {label}
      </Label>
      <InputGroup className="font-mono text-[11px] sm:text-[11px] [&_input]:cursor-default [&_input]:truncate [&_input]:caret-transparent">
        <InputGroupInput
          aria-readonly="true"
          id={id}
          readOnly
          tabIndex={-1}
          value={value}
        />
        <InputGroupAddon align="inline-end">
          <StudioCopyButton onCopied={onCopied} text={value} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
