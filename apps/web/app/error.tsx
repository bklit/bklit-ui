"use client";

import { ErrorStatusPage } from "@/components/design/error-status-page";

/**
 * Root error boundary: catches errors outside `(site)` (e.g. Studio) and in
 * the `(site)` layout itself. No site header here — the header may be what
 * failed. `(site)/error.tsx` handles pages under the header.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorStatusPage error={error} reset={reset} />;
}
