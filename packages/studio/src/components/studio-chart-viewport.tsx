"use client";

import { useEffect, useRef, useState } from "react";

export interface StudioFrameSize {
  width: number;
  height: number;
}

export function StudioChartViewport({
  children,
}: {
  children: (frame: StudioFrameSize) => React.ReactNode;
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
    <div
      className="flex size-full min-h-0 min-w-0 items-center justify-center"
      ref={ref}
    >
      {frame.width > 0 && frame.height > 0 ? children(frame) : null}
    </div>
  );
}
