"use client";

import { StatCardArea } from "@/components/stat-card-area";

export default function Component() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <StatCardArea />
      </div>
    </main>
  );
}
