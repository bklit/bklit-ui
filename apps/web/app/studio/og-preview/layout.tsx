import "@bklitui/studio/styles/studio.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../globals.css";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioOgPreviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
