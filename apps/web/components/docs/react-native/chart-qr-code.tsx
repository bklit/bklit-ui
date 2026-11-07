import { encode } from "uqr";
import { cn } from "@/lib/utils";

/** uqr `QrCodeDataType` values. */
const POSITION = 2;

// Tuned with a decoder sweep: wide, barely-rounded bars scan at every size;
// fully rounded caps start failing.
const BAR_WIDTH = 0.9;
const BAR_RADIUS = 0.2;
const BAR_INSET = (1 - BAR_WIDTH) / 2;
/** Logo hole as a share of the code's width (ECC H recovers ~30%). */
const LOGO_SHARE = 0.24;

const COLORS = {
  card: "#0a0a0a",
  grid: "rgba(255,255,255,0.06)",
  barTop: "#a5b4fc", // indigo-300
  barBottom: "#f0abfc", // fuchsia-300
  finderRing: "#fafafa",
  finderDot: "#818cf8", // indigo-400
};

interface ChartQrCodeProps {
  value: string;
  className?: string;
  /** Accessible label. */
  label?: string;
}

/**
 * A QR code drawn like a bar chart on a dark card: each column's runs of
 * modules become light bars with the indigo → fuchsia chart gradient, finder
 * patterns become rounded rings, and the Bklit mark sits in a cleared centre
 * (error correction H). Light-on-dark codes scan with iOS and Android cameras.
 */
export function ChartQrCode({
  value,
  className,
  label = "QR code",
}: ChartQrCodeProps) {
  const qr = encode(value, { ecc: "H", border: 0 });
  const n = qr.size;
  // Four-module quiet zone (QR spec).
  const pad = 4;
  const view = n + pad * 2;

  // Odd-sized centred hole for the logo, on a plate in the card colour.
  let hole = Math.round(n * LOGO_SHARE);
  if (hole % 2 === 0) {
    hole += 1;
  }
  const h0 = (n - hole) / 2;
  const inHole = (x: number, y: number) =>
    x >= h0 && x < h0 + hole && y >= h0 && y < h0 + hole;

  const bars: { x: number; y: number; h: number }[] = [];
  for (let x = 0; x < n; x++) {
    let start = -1;
    for (let y = 0; y <= n; y++) {
      const type = qr.types[y]?.[x];
      const dark =
        y < n && qr.data[y]?.[x] === true && type !== POSITION && !inHole(x, y);
      if (dark && start < 0) {
        start = y;
      } else if (!dark && start >= 0) {
        bars.push({ x, y: start, h: y - start });
        start = -1;
      }
    }
  }

  const finders = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ] as const;
  const gridRows = Array.from(
    { length: Math.floor(n / 4) + 1 },
    (_, i) => i * 4
  );
  const id = `qr-${n}-${qr.maskPattern}`;
  const logoH = hole - 1.5;
  const logoW = (logoH * 112) / 179;

  return (
    <svg
      aria-label={label}
      className={cn("h-auto w-full", className)}
      role="img"
      viewBox={`${-pad} ${-pad} ${view} ${view}`}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${id}-bars`}
          x1="0"
          x2="0"
          y1="0"
          y2={n}
        >
          <stop offset="0%" stopColor={COLORS.barTop} />
          <stop offset="100%" stopColor={COLORS.barBottom} />
        </linearGradient>
      </defs>
      <rect
        fill={COLORS.card}
        height={view}
        rx={3.5}
        width={view}
        x={-pad}
        y={-pad}
      />
      {gridRows.map((y) => (
        <line
          key={y}
          stroke={COLORS.grid}
          strokeDasharray="0.5 0.5"
          strokeWidth={0.08}
          x1={0}
          x2={n}
          y1={y}
          y2={y}
        />
      ))}
      <g fill={`url(#${id}-bars)`}>
        {bars.map((b) => (
          <rect
            height={b.h - BAR_INSET * 2}
            key={`${b.x}-${b.y}`}
            rx={BAR_RADIUS}
            width={BAR_WIDTH}
            x={b.x + BAR_INSET}
            y={b.y + BAR_INSET}
          />
        ))}
      </g>
      {finders.map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect
            fill="none"
            height={6}
            rx={1.4}
            stroke={COLORS.finderRing}
            strokeWidth={1}
            width={6}
            x={fx + 0.5}
            y={fy + 0.5}
          />
          <rect
            fill={COLORS.finderDot}
            height={3}
            rx={0.7}
            width={3}
            x={fx + 2}
            y={fy + 2}
          />
        </g>
      ))}
      <rect
        fill={COLORS.card}
        height={hole}
        rx={hole * 0.22}
        width={hole}
        x={h0}
        y={h0}
      />
      <BklitMark
        height={logoH}
        id={id}
        width={logoW}
        x={(n - logoW) / 2}
        y={(n - logoH) / 2}
      />
    </svg>
  );
}

/** The Bklit mark (dark-theme `BklitLogo`) as a nested SVG for the QR. */
function BklitMark({
  id,
  x,
  y,
  width,
  height,
}: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const p = `${id}-logo`;
  const white = "255, 255, 255";
  return (
    <svg
      color="#ffffff"
      fill="none"
      height={height}
      viewBox="0 0 112 179"
      width={width}
      x={x}
      y={y}
    >
      <title>Bklit</title>
      <path
        d="M11.082 88.6498C11.082 88.6498 24.4884 66.4873 55.407 66.4873C84.2319 66.4873 99.732 88.6498 99.732 88.6498C99.732 88.6498 86.1801 110.813 55.407 110.812C26.7612 110.812 11.082 88.6498 11.082 88.6498Z"
        fill={`url(#${p}0)`}
      />
      <path
        d="M11.082 88.6498C11.082 88.6498 24.4884 66.4873 55.407 66.4873C84.2319 66.4873 99.732 88.6498 99.732 88.6498C99.732 88.6498 86.1801 110.813 55.407 110.812C26.7612 110.812 11.082 88.6498 11.082 88.6498Z"
        fill={`url(#${p}1)`}
      />
      <path
        d="M110.812 121.894C110.812 148.67 90.0415 177.3 55.4062 177.3V110.812C55.4062 110.812 83.2175 112.19 99.7312 88.6499C108.153 99.9149 110.812 111.675 110.812 121.894Z"
        fill={`url(#${p}2)`}
      />
      <path
        d="M3.8147e-06 121.894C3.8147e-06 148.67 20.771 177.3 55.4062 177.3V110.812C55.4062 110.812 29.4726 112.262 11.0813 88.6499C2.65942 99.9149 3.8147e-06 111.675 3.8147e-06 121.894Z"
        fill={`url(#${p}3)`}
      />
      <path
        d="M6.72096e-06 55.4061C9.06185e-06 28.6295 20.771 -9.45806e-05 55.4063 -9.15527e-05L55.4063 66.4874C55.4063 66.4874 27.595 65.1102 11.0813 88.6499C2.65942 77.3849 5.82758e-06 65.6252 6.72096e-06 55.4061Z"
        fill={`url(#${p}4)`}
      />
      <path
        d="M110.812 55.4062C110.813 28.6295 90.0415 -8.85248e-05 55.4063 -9.15527e-05L55.4063 66.4874C55.4063 66.4874 81.5638 65.1362 99.7312 88.6499C108.153 77.3849 110.812 65.6252 110.812 55.4062Z"
        fill={`url(#${p}5)`}
      />
      <defs>
        <radialGradient
          cx="0.5"
          cy="0.5"
          gradientUnits="objectBoundingBox"
          id={`${p}0`}
          r="0.5"
        >
          <stop offset="0" stopColor={`rgba(${white}, 0.2)`} />
          <stop offset="1" stopColor={`rgba(${white}, 0.05)`} />
        </radialGradient>
        <linearGradient
          gradientUnits="objectBoundingBox"
          id={`${p}1`}
          x1="0"
          x2="1"
          y1="0"
          y2="0"
        >
          <stop offset="0" stopColor={`rgb(${white})`} />
          <stop offset="0.5" stopColor={`rgba(${white}, 0.8)`} />
          <stop offset="1" stopColor={`rgb(${white})`} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${p}2`}
          x1="55.4062"
          x2="110.813"
          y1="177.3"
          y2="66.6642"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor={`rgba(${white}, 0.5)`} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${p}3`}
          x1="55.4063"
          x2="-8.65898e-06"
          y1="177.3"
          y2="66.6642"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.745192" stopColor="rgba(120,120,120, 0.5)" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${p}4`}
          x1="55.4063"
          x2="-1.0581e-05"
          y1="-8.79084e-05"
          y2="110.636"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor={`rgba(${white}, 0.5)`} />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`${p}5`}
          x1="55.4063"
          x2="110.813"
          y1="-8.79084e-05"
          y2="110.636"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.75" stopColor="rgba(120,120,120, 0.5)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
