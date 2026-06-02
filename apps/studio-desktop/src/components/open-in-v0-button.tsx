"use client";

import { openInV0Href } from "@bklitui/studio";
import { Button } from "../../../../packages/studio/src/ui/button";
import { openExternalUrl } from "../lib/open-external";
import { V0Icon } from "./v0-icon";

export function OpenInV0Button({
  registryJsonUrl,
}: {
  registryJsonUrl: string;
}) {
  const href = openInV0Href(registryJsonUrl);

  return (
    <Button
      aria-label="Open in v0"
      className="h-8 gap-1 px-3 text-xs"
      onClick={() => {
        openExternalUrl(href).catch(() => undefined);
      }}
      size="sm"
      type="button"
      variant="white"
    >
      Open in <V0Icon className="h-5 w-5" />
    </Button>
  );
}
