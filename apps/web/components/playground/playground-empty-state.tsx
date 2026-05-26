"use client";

import { SparklesIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlaygroundEmptyState() {
  return (
    <div className="flex size-full min-h-0 items-center justify-center">
      <Alert className="w-full border-dashed md:max-w-[380px]" variant="indigo">
        <SparklesIcon />
        <AlertTitle>Start building</AlertTitle>
        <AlertDescription>
          Use the playground skill to start building a new chart, or ask it to
          edit an existing chart. Your agent will automatically add the
          necessary controls.
        </AlertDescription>
      </Alert>
    </div>
  );
}
