"use client";

import { ErrorStatusPage } from "@/components/design/error-status-page";

/** Errors in `(site)` pages render below the site header kept by the layout. */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorStatusPage error={error} reset={reset} />;
}
