import { cn } from "@/lib/utils";

const TICK_INTERVAL = 20;
const LABEL_INTERVAL = 100;

function RulerTicks({ length }: { length: number }) {
  const ticks = Math.ceil(length / TICK_INTERVAL) + 1;

  return (
    <>
      {Array.from({ length: ticks }, (_, index) => {
        const position = index * TICK_INTERVAL;
        const isMajor = position % LABEL_INTERVAL === 0;
        const tickSize = isMajor ? 10 : 6;

        return (
          <div key={position}>
            <div
              className={cn(
                "absolute bg-foreground/15 opacity-60",
                isMajor && "bg-foreground/20"
              )}
              style={{
                top: position,
                right: 0,
                width: tickSize,
                height: 1,
              }}
            />
            {isMajor ? (
              <span
                className="absolute left-2 font-mono text-[9px] text-foreground/30 tabular-nums opacity-60"
                style={{
                  top: position + 4,
                  writingMode: "vertical-lr",
                }}
              >
                {position}
              </span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function DecorativeRuler({
  length,
  className,
}: {
  length: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none w-8 overflow-hidden border-border border-r bg-background",
        className
      )}
    >
      {length > 0 ? <RulerTicks length={length} /> : null}
    </div>
  );
}
