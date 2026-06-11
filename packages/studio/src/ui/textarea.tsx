import type * as React from "react";

import { studioTextareaControlClass } from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        studioTextareaControlClass,
        "field-sizing-content flex w-full resize-y px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground md:text-sm",
        className
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
