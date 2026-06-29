"use client";

import { Icon } from "@bklitui/icons";
import { Fragment } from "react";
import {
  groupCatalogSources,
  sourceFolderHint,
} from "@/lib/catalog-source-groups";
import {
  fileBaseName,
  openInCursor,
  type RepoRelativePath,
} from "@/lib/open-in-cursor";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export function CatalogSourceMenu({
  sources,
}: {
  sources: RepoRelativePath[];
}) {
  if (sources.length === 0) {
    return null;
  }

  const groups = groupCatalogSources(sources);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open source files"
        render={
          <Button
            className="size-7 shrink-0 text-muted-foreground"
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <Icon className="size-4" name="IconFileText" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        {groups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {group.sources.map((sourcePath) => {
                const folderHint = sourceFolderHint(sourcePath);

                return (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    key={sourcePath}
                    onClick={() => {
                      openInCursor(sourcePath);
                    }}
                    title={folderHint || fileBaseName(sourcePath)}
                  >
                    <Icon
                      className="size-4 text-muted-foreground"
                      name="IconFileText"
                    />
                    <span className="truncate font-light font-mono text-xs">
                      {fileBaseName(sourcePath)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
