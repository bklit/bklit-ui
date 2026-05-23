import type { ReactNode } from "react";

export interface BlockFile {
  path: string;
  content: string;
  language?: string;
}

export interface BlockDefinition {
  name: string;
  description: string;
  registryName: string;
  files: BlockFile[];
  preview: ReactNode;
  previewHeight?: number;
  mobilePreviewWidth?: number;
}

export interface BlockFileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: BlockFileTreeNode[];
}
