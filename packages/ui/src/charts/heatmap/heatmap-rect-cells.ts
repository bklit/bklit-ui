/**
 * Cell geometry `@visx/heatmap` 4.0.0 `HeatmapRect` handed its render-prop
 * children, reproduced exactly:
 *
 * - `width = binWidth - gap`, `height = binHeight - gap` (same for every cell)
 * - `x = xScale(column) + x0` (no gap), `y = yScale(row) + gap`
 * - `color = colorScale(count)`, `opacity = opacityScale(count)` (default 1)
 *
 * One array of cells per column, rows in bin order.
 */

export interface HeatmapRectCell<ColumnDatum, BinDatum> {
  bin: BinDatum;
  row: number;
  column: number;
  datum: ColumnDatum;
  width: number;
  height: number;
  gap: number;
  count: number | undefined;
  x: number;
  y: number;
  color: string | undefined;
  opacity: number | undefined;
}

export interface HeatmapRectCellsOptions<ColumnDatum, BinDatum> {
  data?: ColumnDatum[];
  bins: (column: ColumnDatum) => BinDatum[];
  count: (bin: BinDatum) => number | undefined;
  /** Default: 6 */
  binWidth?: number;
  /** Default: 6 */
  binHeight?: number;
  /** Added to every x. Default: 0 */
  x0?: number;
  /** Default: 1 */
  gap?: number;
  xScale: (columnIndex: number) => number;
  yScale: (rowIndex: number) => number;
  colorScale?: (count: number | undefined) => string | undefined;
  opacityScale?: (count: number | undefined) => number | undefined;
}

export function heatmapRectCells<ColumnDatum, BinDatum>({
  data = [],
  bins,
  count,
  binWidth = 6,
  binHeight = 6,
  x0 = 0,
  gap = 1,
  xScale,
  yScale,
  colorScale = () => undefined,
  opacityScale = () => 1,
}: HeatmapRectCellsOptions<ColumnDatum, BinDatum>): HeatmapRectCell<
  ColumnDatum,
  BinDatum
>[][] {
  const width = binWidth - gap;
  const height = binHeight - gap;
  return data.map((datum, column) => {
    const x = xScale(column);
    return bins(datum).map((bin, row) => {
      const countValue = count(bin);
      return {
        bin,
        row,
        column,
        datum,
        width,
        height,
        gap,
        count: countValue,
        x: x + x0,
        y: yScale(row) + gap,
        color: colorScale(countValue),
        opacity: opacityScale(countValue),
      };
    });
  });
}
