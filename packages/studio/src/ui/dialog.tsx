"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@bklitui/ui/lib/utils";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type * as React from "react";
import { Button } from "@/ui/button";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/20 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  initialFocus,
  finalFocus,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0",
          className
        )}
        data-slot="dialog-content"
        finalFocus={finalFocus}
        initialFocus={initialFocus}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                className="absolute top-4 right-4"
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      data-slot="dialog-footer"
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-light text-4xl text-foreground tracking-tight",
        className
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-balance font-light text-muted-foreground text-sm leading-relaxed",
        className
      )}
      data-slot="dialog-description"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
};
