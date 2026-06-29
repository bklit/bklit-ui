import type { Metadata } from "next";
import { StudioCatalogGrid } from "@/components/studio-catalog-grid";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Visual grid of every Studio UI component for theme and token preview.",
};

export default function CatalogPage() {
  return <StudioCatalogGrid />;
}
