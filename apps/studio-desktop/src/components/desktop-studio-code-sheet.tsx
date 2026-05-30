"use client";

import {
  registryV0ExampleJsonUrl,
  StudioCodeSheetTrigger,
  type StudioUrlState,
} from "@bklitui/studio";
import { Button } from "../../../../packages/studio/src/ui/button";
import { openExternalUrl } from "../lib/open-external";
import { studioChartDocsAbsoluteHref } from "../lib/studio-links";
import { CodeBlock } from "./code-block";
import { OpenInV0Button } from "./open-in-v0-button";
import { PackageManagerTabs } from "./package-manager-tabs";

export function DesktopStudioCodeSheet({ state }: { state: StudioUrlState }) {
  const docsHref = studioChartDocsAbsoluteHref(state.chart);

  return (
    <StudioCodeSheetTrigger
      headerActions={
        <>
          <Button
            className="h-8 text-xs"
            onClick={() => {
              openExternalUrl(docsHref).catch(() => undefined);
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Documentation
          </Button>
          <OpenInV0Button
            registryJsonUrl={registryV0ExampleJsonUrl(state.chart)}
          />
        </>
      }
      installSection={<PackageManagerTabs name={state.chart} />}
      renderDataCode={(data) => (
        <CodeBlock
          code={data ?? "// Example data for this chart is not available yet."}
          lang="tsx"
        />
      )}
      renderUsageCode={(code) => <CodeBlock code={code} lang="tsx" />}
      state={state}
    />
  );
}
