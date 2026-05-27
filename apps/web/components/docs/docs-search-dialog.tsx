"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogListItem,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
} from "fumadocs-ui/components/dialog/search";
import type { DefaultSearchDialogProps } from "fumadocs-ui/components/dialog/search-default";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useEffect, useMemo, useRef, useState } from "react";
import { consumeSearchOpenSource } from "@/lib/analytics/search-source";
import { trackEvent } from "@/lib/analytics/track-client";

export function DocsSearchDialog({
  defaultTag,
  tags = [],
  api = "/api/search",
  delayMs,
  type = "fetch",
  allowClear = false,
  links = [],
  footer,
  open,
  onOpenChange,
  ...props
}: DefaultSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);
  const queryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackedQueryRef = useRef("");
  const { search, setSearch, query } = useDocsSearch(
    type === "fetch"
      ? {
          type: "fetch",
          api,
          locale,
          tag,
          delayMs,
        }
      : {
          type: "static",
          from: api,
          locale,
          tag,
          delayMs,
        }
  );

  const defaultItems = useMemo(() => {
    if (links.length === 0) {
      return null;
    }
    return links.map(([name, link]) => ({
      type: "page" as const,
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useOnChange(defaultTag, (value) => {
    setTag(value);
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    trackEvent("search_open", { source: consumeSearchOpenSource() });
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmed = search.trim();
    if (trimmed.length < 2 || trimmed === lastTrackedQueryRef.current) {
      return;
    }

    if (queryTimerRef.current) {
      clearTimeout(queryTimerRef.current);
    }

    queryTimerRef.current = setTimeout(() => {
      lastTrackedQueryRef.current = trimmed;
      trackEvent("search_query", { query: trimmed });
    }, 500);

    return () => {
      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current);
      }
    };
  }, [open, search]);

  useEffect(() => {
    if (!open) {
      lastTrackedQueryRef.current = "";
    }
  }, [open]);

  return (
    <SearchDialog
      isLoading={query.isLoading}
      onOpenChange={onOpenChange}
      onSearchChange={setSearch}
      open={open}
      search={search}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          Item={({ item, onClick }) => (
            <SearchDialogListItem
              item={item}
              onClick={() => {
                if (item.type !== "action") {
                  trackEvent("search_select", {
                    query: search.trim(),
                    result_url: item.url,
                    result_title: item.content,
                    result_type: item.type,
                  });
                }
                onClick();
              }}
            />
          )}
          items={query.data === "empty" ? defaultItems : query.data}
        />
      </SearchDialogContent>
      <SearchDialogFooter>
        {tags.length > 0 ? (
          <TagsList allowClear={allowClear} onTagChange={setTag} tag={tag}>
            {tags.map((tagItem) => (
              <TagsListItem key={tagItem.value} value={tagItem.value}>
                {tagItem.name}
              </TagsListItem>
            ))}
          </TagsList>
        ) : null}
        {footer}
      </SearchDialogFooter>
    </SearchDialog>
  );
}
