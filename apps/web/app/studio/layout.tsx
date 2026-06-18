import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Interactive chart studio — explore every Bklit chart and tune props in real time.",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return children;
}
