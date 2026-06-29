import type { Metadata } from "next";
import { StudioDemoPageShell } from "./studio-demo-page-shell";

export const metadata: Metadata = {
  title: "Studio demo",
  robots: { index: false, follow: false },
};

export default function StudioDemoPage() {
  return <StudioDemoPageShell />;
}
