import type { ReactNode } from "react";
import { ChartsPageTransition } from "@/components/charts/charts-page-transition";

export default function ChartsTemplate({ children }: { children: ReactNode }) {
  return <ChartsPageTransition>{children}</ChartsPageTransition>;
}
