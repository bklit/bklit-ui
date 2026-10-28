import type { ReactNode } from "react";

/** One radial gallery card (`/charts/radial-chart`). */
export interface RadialGalleryVariant {
  title: string;
  description: string;
  /** JSX snippet shown in the card's code panel */
  code: string;
  /** Optional data snippet appended below `code` */
  data?: string;
  footer?: string;
  render: () => ReactNode;
}
