import type { BlockFile, BlockFileTreeNode } from "./types";

function sortNodes(nodes: BlockFileTreeNode[]): BlockFileTreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    })
    .map((node) =>
      node.children ? { ...node, children: sortNodes(node.children) } : node
    );
}

function insertFilePath(
  root: BlockFileTreeNode[],
  parts: string[]
): BlockFileTreeNode[] {
  const nextRoot = [...root];
  let currentLevel = nextRoot;
  let currentPath = "";

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (!part) {
      continue;
    }

    const isFile = index === parts.length - 1;
    currentPath = currentPath ? `${currentPath}/${part}` : part;

    let node = currentLevel.find((entry) => entry.name === part);

    if (!node) {
      node = {
        name: part,
        path: currentPath,
        type: isFile ? "file" : "folder",
        children: isFile ? undefined : [],
      };
      currentLevel.push(node);
    }

    if (!isFile && node.children) {
      currentLevel = node.children;
    }
  }

  return nextRoot;
}

export function buildFileTree(files: BlockFile[]): BlockFileTreeNode[] {
  return sortNodes(
    files.reduce<BlockFileTreeNode[]>(
      (root, file) => insertFilePath(root, file.path.split("/")),
      []
    )
  );
}

export function getDefaultSelectedFile(
  files: BlockFile[]
): BlockFile | undefined {
  return (
    files.find((file) => file.path.endsWith("page.tsx")) ??
    files.find((file) => file.path.endsWith("index.tsx")) ??
    files[0]
  );
}
