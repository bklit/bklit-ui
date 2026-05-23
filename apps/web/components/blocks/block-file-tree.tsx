"use client";

import {
  ArrowRight01Icon,
  File01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { buildFileTree } from "@/lib/blocks/build-file-tree";
import type { BlockFile, BlockFileTreeNode } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

interface BlockFileTreeProps {
  files: BlockFile[];
  selectedPath: string;
  onSelect: (path: string) => void;
}

function TreeFolder({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: BlockFileTreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const paddingLeft = 12 + depth * 12;

  return (
    <li>
      <button
        className="flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-muted-foreground text-xs transition-colors hover:bg-muted/50 hover:text-foreground"
        onClick={() => setOpen((value) => !value)}
        style={{ paddingLeft }}
        type="button"
      >
        <HugeiconsIcon
          className={cn(
            "size-3 shrink-0 transition-transform",
            open && "rotate-90"
          )}
          icon={ArrowRight01Icon}
          strokeWidth={2}
        />
        <HugeiconsIcon
          className="size-3.5 shrink-0"
          icon={Folder01Icon}
          strokeWidth={1.75}
        />
        <span className="truncate">{node.name}</span>
      </button>

      {open && node.children ? (
        <ul className="list-none">
          {node.children.map((child) => (
            <TreeNode
              depth={depth + 1}
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: BlockFileTreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  if (node.type === "folder") {
    return (
      <TreeFolder
        depth={depth}
        node={node}
        onSelect={onSelect}
        selectedPath={selectedPath}
      />
    );
  }

  const isSelected = selectedPath === node.path;
  const paddingLeft = 12 + depth * 12 + 16;

  return (
    <li>
      <button
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-xs transition-colors",
          isSelected
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        onClick={() => onSelect(node.path)}
        style={{ paddingLeft }}
        type="button"
      >
        <HugeiconsIcon
          className="size-3.5 shrink-0"
          icon={File01Icon}
          strokeWidth={1.75}
        />
        <span className="truncate">{node.name}</span>
      </button>
    </li>
  );
}

export function BlockFileTree({
  files,
  selectedPath,
  onSelect,
}: BlockFileTreeProps) {
  const tree = useMemo(() => buildFileTree(files), [files]);

  return (
    <div className="flex h-full min-h-0 flex-col border-border border-r bg-muted/10">
      <div className="border-border border-b px-4 py-3">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Files
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <ul className="m-0 list-none p-0">
          {tree.map((node) => (
            <TreeNode
              depth={0}
              key={node.path}
              node={node}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
