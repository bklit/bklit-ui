"use client";

import {
  registryV0ExampleJsonUrl,
  StudioCodeSheetTrigger,
  type StudioUrlState,
  studioChartDocsHref,
} from "@bklitui/studio";
import Link from "next/link";
import { DocsCodeBlock } from "@/components/docs/docs-code-block";
import { OpenInV0Button } from "@/components/docs/open-in-v0-button";
import { PackageManagerTabs } from "@/components/docs/package-manager-tabs";
import { Button } from "@/components/ui/button";

export function WebStudioCodeSheet({ state }: { state: StudioUrlState }) {
  return (
    <StudioCodeSheetTrigger
      headerActions={
        <>
          <Button
            className="h-8 text-xs"
            nativeButton={false}
            render={<Link href={studioChartDocsHref(state.chart)} />}
            size="sm"
            variant="outline"
          >
            Documentation
          </Button>
          <OpenInV0Button
            chart={state.chart}
            registryJsonUrl={registryV0ExampleJsonUrl(state.chart)}
            surface="studio"
          />
        </>
      }
      installSection={<PackageManagerTabs name={state.chart} />}
      renderDataCode={(data) => (
        <DocsCodeBlock
          code={data ?? "// Example data for this chart is not available yet."}
          lang="tsx"
        />
      )}
      renderUsageCode={(code) => <DocsCodeBlock code={code} lang="tsx" />}
      state={state}
    />
  );
}
