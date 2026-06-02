"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StudioFrameSize } from "@/components/studio-chart-viewport";

const StudioChartContentFrameContext = createContext<StudioFrameSize | null>(
  null
);

export function StudioChartContentViewport({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<StudioFrameSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => {
      setFrame({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <StudioChartContentFrameContext.Provider value={frame}>
      <div
        className="flex size-full min-h-0 min-w-0 items-center justify-center"
        ref={ref}
      >
        {children}
      </div>
    </StudioChartContentFrameContext.Provider>
  );
}

/** Frame size of the center grid cell; falls back to the studio viewport when not inside a shell. */
export function useStudioChartContentFrame(
  fallback: StudioFrameSize
): StudioFrameSize {
  const measured = useContext(StudioChartContentFrameContext);
  if (measured && measured.width > 0 && measured.height > 0) {
    return measured;
  }
  return fallback;
}
