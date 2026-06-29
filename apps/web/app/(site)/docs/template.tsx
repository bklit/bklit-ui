import type { ReactNode } from "react";
import { DocsPageTransition } from "@/components/docs/docs-page-transition";

export default function DocsTemplate({ children }: { children: ReactNode }) {
  return <DocsPageTransition>{children}</DocsPageTransition>;
}
