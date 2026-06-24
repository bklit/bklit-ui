import type { CSSProperties, ReactNode } from "react";
import { GridCellPulse } from "@/components/design/grid-cell-pulse";
import { cn } from "@/lib/utils";

const gridDotSize = "10px";

function gridAxisFraction(
  index: number,
  count: number,
  weights?: number[]
): number {
  const segments =
    weights?.length === count
      ? weights
      : Array.from({ length: count }, () => 1);
  const total = segments.reduce((sum, weight) => sum + weight, 0);
  const leading = segments
    .slice(0, index)
    .reduce((sum, weight) => sum + weight, 0);
  return leading / total;
}

function gridAxisPosition(
  index: number,
  count: number,
  weights?: number[]
): string {
  const fraction = gridAxisFraction(index, count, weights);
  return `calc(${gridDotSize} / 2 + ${fraction} * (100% - ${gridDotSize}))`;
}

function lineGridVars(
  columns: number,
  rows: number,
  options?: { responsiveLayout?: boolean }
): CSSProperties {
  const base = {
    "--columns": columns,
    "--rows": rows,
    "--grid-dot-size": gridDotSize,
  };

  if (options?.responsiveLayout) {
    return base as CSSProperties;
  }

  return {
    ...base,
    "--grid-cell-width": `calc(100% / ${columns})`,
    "--grid-cell-height": `calc(100% / ${rows})`,
    aspectRatio: `${columns} / ${rows}`,
  } as CSSProperties;
}

function GridLinesOverlay({
  columns,
  rows,
  className,
}: {
  columns: number;
  rows: number;
  className?: string;
}) {
  const cells = Array.from({ length: columns * rows }, (_, index) => index);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-1 grid", className)}
      data-grid-lines
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {cells.map((index) => {
        const isFirstRow = index < columns;
        const isFirstColumn = index % columns === 0;

        return (
          <div
            className={cn(
              "border-border border-r border-b",
              isFirstRow && "border-t",
              isFirstColumn && "border-l"
            )}
            key={index}
          />
        );
      })}
    </div>
  );
}

export const lineGridClass = (
  options: {
    columns: number;
    rows: number;
    variant: "solid" | "ghost";
  },
  className?: string
) =>
  cn(
    "relative overflow-visible [&>:not([data-grid-dots]):not([data-grid-fill]):not([data-grid-lines]):not([data-grid-pulse]):not([data-grid-surface])]:relative [&>:not([data-grid-dots]):not([data-grid-fill]):not([data-grid-lines]):not([data-grid-pulse]):not([data-grid-surface])]:z-2 [&>[data-grid-fill]]:z-2",
    options.variant === "ghost" && "bg-transparent",
    options.columns === 6 && options.rows === 3 && "w-full",
    className
  );

export function GridCornerDots({
  columns,
  rows,
  columnWeights,
  rowWeights,
  className,
}: {
  columns: number;
  rows: number;
  columnWeights?: number[];
  rowWeights?: number[];
  /** Use z-1 when dots sit on a composite grid wrapper above panel backgrounds. */
  className?: string;
}) {
  const dots = Array.from(
    { length: (rows + 1) * (columns + 1) },
    (_, index) => ({
      col: index % (columns + 1),
      row: Math.floor(index / (columns + 1)),
      key: index,
    })
  );

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute z-0", className)}
      data-grid-dots
      style={{ inset: `calc(-1 * ${gridDotSize} / 2)` }}
    >
      {dots.map(({ col, row, key }) => (
        <span
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-white md:size-3 dark:bg-background"
          key={key}
          style={{
            left: gridAxisPosition(col, columns, columnWeights),
            top: gridAxisPosition(row, rows, rowWeights),
          }}
        />
      ))}
    </div>
  );
}

function resolvePulseTierValue(
  lg: number | undefined,
  md: number | undefined,
  base: number | undefined,
  fallback: number
) {
  return lg ?? md ?? base ?? fallback;
}

function ResponsiveGridCellPulse({
  desktopColumns,
  desktopRows,
  isResponsive,
  isThreeTier,
  mobileColumns,
  mobileRows,
  pulseMaxActive,
  pulseMaxActiveLg,
  pulseMaxActiveMd,
  pulseMinActive,
  pulseMinActiveLg,
  pulseMinActiveMd,
  tabletColumns,
  tabletRows,
}: {
  desktopColumns: number;
  desktopRows: number;
  isResponsive: boolean;
  isThreeTier: boolean;
  mobileColumns: number;
  mobileRows: number;
  pulseMaxActive?: number;
  pulseMaxActiveLg?: number;
  pulseMaxActiveMd?: number;
  pulseMinActive?: number;
  pulseMinActiveLg?: number;
  pulseMinActiveMd?: number;
  tabletColumns: number;
  tabletRows: number;
}) {
  const mobileMin = pulseMinActive ?? 1;
  const mobileMax = pulseMaxActive ?? 3;
  const tabletMin = pulseMinActiveMd ?? mobileMin;
  const tabletMax = pulseMaxActiveMd ?? mobileMax;
  const desktopMin = resolvePulseTierValue(
    pulseMinActiveLg,
    pulseMinActiveMd,
    pulseMinActive,
    1
  );
  const desktopMax = resolvePulseTierValue(
    pulseMaxActiveLg,
    pulseMaxActiveMd,
    pulseMaxActive,
    3
  );

  if (isThreeTier) {
    return (
      <>
        <GridCellPulse
          className="md:hidden"
          columns={mobileColumns}
          maxRandomActive={mobileMax}
          minRandomActive={mobileMin}
          rows={mobileRows}
        />
        <GridCellPulse
          className="hidden md:grid lg:hidden"
          columns={tabletColumns}
          maxRandomActive={tabletMax}
          minRandomActive={tabletMin}
          rows={tabletRows}
        />
        <GridCellPulse
          className="hidden lg:grid"
          columns={desktopColumns}
          maxRandomActive={desktopMax}
          minRandomActive={desktopMin}
          rows={desktopRows}
        />
      </>
    );
  }

  if (isResponsive) {
    return (
      <>
        <GridCellPulse
          className="md:hidden"
          columns={mobileColumns}
          maxRandomActive={mobileMax}
          minRandomActive={mobileMin}
          rows={mobileRows}
        />
        <GridCellPulse
          className="hidden md:grid"
          columns={desktopColumns}
          maxRandomActive={tabletMax}
          minRandomActive={tabletMin}
          rows={desktopRows}
        />
      </>
    );
  }

  return (
    <GridCellPulse
      columns={desktopColumns}
      maxRandomActive={mobileMax}
      minRandomActive={mobileMin}
      rows={desktopRows}
    />
  );
}

function ResponsiveGridLines({
  columns,
  desktopColumns,
  desktopRows,
  isThreeTier,
  isResponsive,
  rows,
  tabletColumns,
  tabletRows,
}: {
  columns: number;
  desktopColumns: number;
  desktopRows: number;
  isThreeTier: boolean;
  isResponsive: boolean;
  rows: number;
  tabletColumns: number;
  tabletRows: number;
}) {
  if (!isResponsive) {
    return <GridLinesOverlay columns={columns} rows={rows} />;
  }

  if (isThreeTier) {
    return (
      <>
        <GridLinesOverlay className="md:hidden" columns={columns} rows={rows} />
        <GridLinesOverlay
          className="hidden md:grid lg:hidden"
          columns={tabletColumns}
          rows={tabletRows}
        />
        <GridLinesOverlay
          className="hidden lg:grid"
          columns={desktopColumns}
          rows={desktopRows}
        />
      </>
    );
  }

  return (
    <>
      <GridLinesOverlay className="md:hidden" columns={columns} rows={rows} />
      <GridLinesOverlay
        className="hidden md:grid"
        columns={desktopColumns}
        rows={desktopRows}
      />
    </>
  );
}

function ResponsiveGridCornerDots({
  columns,
  desktopColumns,
  desktopRows,
  isThreeTier,
  isResponsive,
  rows,
  tabletColumns,
  tabletRows,
}: {
  columns: number;
  desktopColumns: number;
  desktopRows: number;
  isThreeTier: boolean;
  isResponsive: boolean;
  rows: number;
  tabletColumns: number;
  tabletRows: number;
}) {
  if (!isResponsive) {
    return <GridCornerDots className="z-3" columns={columns} rows={rows} />;
  }

  if (isThreeTier) {
    return (
      <>
        <GridCornerDots
          className="z-3 md:hidden"
          columns={columns}
          rows={rows}
        />
        <GridCornerDots
          className="z-3 hidden md:block lg:hidden"
          columns={tabletColumns}
          rows={tabletRows}
        />
        <GridCornerDots
          className="z-3 hidden lg:block"
          columns={desktopColumns}
          rows={desktopRows}
        />
      </>
    );
  }

  return (
    <>
      <GridCornerDots className="z-3 md:hidden" columns={columns} rows={rows} />
      <GridCornerDots
        className="z-3 hidden md:block"
        columns={desktopColumns}
        rows={desktopRows}
      />
    </>
  );
}

export function LineGrid({
  columns,
  rows,
  columnsMd,
  rowsMd,
  columnsLg,
  rowsLg,
  variant,
  pulse,
  pulseMinActive,
  pulseMinActiveMd,
  pulseMinActiveLg,
  pulseMaxActive,
  pulseMaxActiveMd,
  pulseMaxActiveLg,
  className,
  children,
}: {
  columns: number;
  rows: number;
  /** Column count from the `md` breakpoint up. Defaults to `columns`. */
  columnsMd?: number;
  /** Row count from the `md` breakpoint up. Defaults to `rows`. */
  rowsMd?: number;
  /** Column count from the `lg` breakpoint up. Defaults to `columnsMd` / `columns`. */
  columnsLg?: number;
  /** Row count from the `lg` breakpoint up. Defaults to `rowsMd` / `rows`. */
  rowsLg?: number;
  variant: "solid" | "ghost";
  /** Hover-reactive diagonal line highlights on grid cells. */
  pulse?: boolean;
  /** Minimum randomly pulsing cells to keep active (mobile). Defaults to 1. */
  pulseMinActive?: number;
  /** Minimum randomly pulsing cells from the `md` breakpoint up. */
  pulseMinActiveMd?: number;
  /** Minimum randomly pulsing cells from the `lg` breakpoint up. */
  pulseMinActiveLg?: number;
  /** Max randomly pulsing cells at once (mobile). Defaults to 3. */
  pulseMaxActive?: number;
  /** Max randomly pulsing cells from the `md` breakpoint up. */
  pulseMaxActiveMd?: number;
  /** Max randomly pulsing cells from the `lg` breakpoint up. */
  pulseMaxActiveLg?: number;
  className?: string;
  children?: ReactNode;
}) {
  const tabletColumns = columnsMd ?? columns;
  const tabletRows = rowsMd ?? rows;
  const desktopColumns = columnsLg ?? columnsMd ?? columns;
  const desktopRows = rowsLg ?? rowsMd ?? rows;
  const isThreeTier =
    desktopColumns !== tabletColumns || desktopRows !== tabletRows;
  const isResponsive =
    isThreeTier || tabletColumns !== columns || tabletRows !== rows;

  return (
    <div className="relative">
      <div
        className={lineGridClass(
          { columns: desktopColumns, rows: desktopRows, variant },
          cn(isResponsive && "w-full", className)
        )}
        style={lineGridVars(columns, rows, { responsiveLayout: isResponsive })}
      >
        {variant === "solid" ? (
          <div
            aria-hidden
            className="absolute inset-0 z-0 bg-white dark:bg-background"
            data-grid-surface
          />
        ) : null}
        <ResponsiveGridLines
          columns={columns}
          desktopColumns={desktopColumns}
          desktopRows={desktopRows}
          isResponsive={isResponsive}
          isThreeTier={isThreeTier}
          rows={rows}
          tabletColumns={tabletColumns}
          tabletRows={tabletRows}
        />
        {pulse ? (
          <ResponsiveGridCellPulse
            desktopColumns={desktopColumns}
            desktopRows={desktopRows}
            isResponsive={isResponsive}
            isThreeTier={isThreeTier}
            mobileColumns={columns}
            mobileRows={rows}
            pulseMaxActive={pulseMaxActive}
            pulseMaxActiveLg={pulseMaxActiveLg}
            pulseMaxActiveMd={pulseMaxActiveMd}
            pulseMinActive={pulseMinActive}
            pulseMinActiveLg={pulseMinActiveLg}
            pulseMinActiveMd={pulseMinActiveMd}
            tabletColumns={tabletColumns}
            tabletRows={tabletRows}
          />
        ) : null}
        {children}
        <ResponsiveGridCornerDots
          columns={columns}
          desktopColumns={desktopColumns}
          desktopRows={desktopRows}
          isResponsive={isResponsive}
          isThreeTier={isThreeTier}
          rows={rows}
          tabletColumns={tabletColumns}
          tabletRows={tabletRows}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        data-grid-rulers
      >
        <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
        <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />

        <div className="absolute -bottom-8 left-0 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute bottom-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
        <div className="absolute right-0 -bottom-8 block h-10 w-px bg-muted-foreground/40" />
        <div className="absolute -right-8 bottom-0 block h-px w-10 bg-muted-foreground/40" />

        <div className="absolute -top-8 -right-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
        <div className="absolute -bottom-8 -left-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
      </div>
    </div>
  );
}
