"use client";

import type { Margin } from "@bklitui/ui/charts";
import { useEffect, useState } from "react";

export function useHomeChartCompact() {
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setCompact(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}

const flushMargin: Margin = { top: 0, right: 0, bottom: 0, left: 0 };

export function homeAreaChartMargin(compact: boolean): Margin {
  if (compact) {
    return flushMargin;
  }

  return { top: 40, right: 40, bottom: 20, left: 40 };
}

export function homeBarChartMargin(compact: boolean): Margin {
  if (compact) {
    return flushMargin;
  }

  return { top: 8, right: 16, bottom: 32, left: 16 };
}

export function homeChoroplethMargin(compact: boolean): Margin {
  if (compact) {
    return flushMargin;
  }

  return { top: 8, right: 16, bottom: 8, left: 16 };
}

export function homeHeatmapMargin(compact: boolean): Margin {
  if (compact) {
    return flushMargin;
  }

  return { top: 16, right: 16, bottom: 0, left: 24 };
}
