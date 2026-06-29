import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { studioSingleLineControlClass } from "@/lib/studio-chrome-classes";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      className={cn(
        studioSingleLineControlClass,
        "w-full min-w-0 bg-input px-2.5 py-1 text-base outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground md:text-sm",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
