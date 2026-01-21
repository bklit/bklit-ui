"use client";

import type { ReactNode } from "react";

interface ComponentPreviewProps {
  children: ReactNode;
  className?: string;
}

export function ComponentPreview({
  children,
  className,
}: ComponentPreviewProps) {
  return (
    <div
      className={`not-prose my-6 flex min-h-[200px] items-center justify-center rounded-xl border border-fd-border bg-fd-muted/30 p-8 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
