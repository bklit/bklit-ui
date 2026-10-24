"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusPage } from "@/components/design/status-page";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/site-name";

/** Shared body of the `error.tsx` boundaries (`app/` and `app/(site)/`). */
export function ErrorStatusPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      {/* Error boundaries can't export `metadata`; React 19 hoists this. */}
      <title>{`Something went wrong | ${SITE_NAME}`}</title>
      <meta content="noindex" name="robots" />
      <StatusPage
        actions={
          <>
            <Button onClick={() => reset()} size="lg">
              Try again
            </Button>
            <Button render={<Link href="/" />} size="lg" variant="outline">
              Back home
            </Button>
          </>
        }
        code="Oops"
        description="An unexpected error stopped this page from rendering. Try again, or head back home."
        footnote={error.digest ? `Reference: ${error.digest}` : undefined}
        srCode="Error:"
        title="Something went wrong"
      />
    </>
  );
}
