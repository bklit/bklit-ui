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
      <Label className="text-muted-foreground text-xs" htmlFor={id}>
        {label}
      </Label>
      <InputGroup className="overflow-hidden">
        <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
          <InputGroupInput
            aria-readonly="true"
            className="min-w-0 cursor-default truncate pr-2 font-mono text-[11px] caret-transparent"
            id={id}
            readOnly
            tabIndex={-1}
            value={value}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-35% from-[var(--studio-input-background)] to-transparent"
          />
        </div>
        <InputGroupAddon
          align="inline-end"
          className="relative z-20 shrink-0 bg-[var(--studio-input-background)]"
        >
          <StudioCopyButton onCopied={onCopied} text={value} />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
