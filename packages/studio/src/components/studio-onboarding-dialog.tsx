"use client";

import { cn } from "@bklitui/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { ShimmeringText } from "@/components/onboarding/shimmering-text";
import { StudioVersionPill } from "@/components/onboarding/studio-version-pill";
import {
  dismissStudioOnboarding,
  isStudioOnboardingDismissed,
} from "@/lib/studio-onboarding-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";

const MAT_AVATAR_URL = "https://github.com/uixmat.png";

export function StudioOnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isStudioOnboardingDismissed()) {
      setOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    dismissStudioOnboarding();
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        dismiss();
        return;
      }
      setOpen(true);
    },
    [dismiss]
  );

  if (!mounted) {
    return null;
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className={cn(
          "gap-6 px-8 py-8",
          "[&_[data-slot=dialog-close]]:top-8 [&_[data-slot=dialog-close]]:right-8"
        )}
        initialFocus={false}
      >
        <DialogHeader className="gap-5">
          <div className="flex justify-center">
            <StudioVersionPill showChevron={false} tabIndex={-1} />
          </div>
          <DialogTitle className="flex justify-center">
            <ShimmeringText
              className="font-light text-4xl tracking-tight"
              text="Welcome"
            />
          </DialogTitle>
        </DialogHeader>

        <figure className="flex flex-col items-center gap-4 text-center">
          <blockquote className="max-w-sm text-balance font-light font-serif text-lg text-muted-foreground italic leading-relaxed">
            Thank you for using Studio 2 — it means a lot. Everything here is
            still experimental and in beta, and your feedback is what helps us
            make it great.
          </blockquote>
          <figcaption className="flex items-center justify-center gap-2 font-light text-muted-foreground text-sm">
            <Avatar size="sm">
              <AvatarImage alt="Matt" src={MAT_AVATAR_URL} />
              <AvatarFallback>Ma</AvatarFallback>
            </Avatar>
            <span>Matt</span>
          </figcaption>
        </figure>

        <DialogFooter>
          <Button
            className={cn("min-w-36")}
            onClick={dismiss}
            size="default"
            type="button"
          >
            Let&apos;s go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
