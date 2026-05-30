"use client";

import { MonitorIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";

export function StudioDesktopOnly() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Alert className="max-w-md" variant="default">
        <MonitorIcon />
        <AlertTitle>Desktop only</AlertTitle>
        <AlertDescription>
          Studio is designed for desktop screens. Open this page on a laptop or
          monitor to customize charts, preview animations, and record exports.
        </AlertDescription>
      </Alert>
    </div>
  );
}
