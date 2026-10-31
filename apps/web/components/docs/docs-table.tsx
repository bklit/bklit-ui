import type { ComponentProps } from "react";

/**
 * MDX `table` for `.docs-prose` content (docs pages, changelog): a framed,
 * horizontally scrollable frame (border lives on the scroller) holding a
 * full-width table. Without it, tables hit the raw-table fallback in
 * globals.css (`display: block`) and shrink to their content.
 */
export function DocsTable(props: ComponentProps<"table">) {
  return (
    <div className="docs-table-frame">
      <table {...props} />
    </div>
  );
}
