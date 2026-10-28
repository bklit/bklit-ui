/**
 * US population by state and age group — the dataset behind d3's radial
 * stacked bar chart (https://observablehq.com/@d3/radial-stacked-bar-chart/2,
 * US Census Bureau ACS 2008). The original seven age groups are merged into
 * five bands (one per chart palette slot) and rounded to the nearest
 * thousand. Rows are sorted by total population, largest first.
 */

export const usAgeBands = [
  { dataKey: "under14", label: "Under 14" },
  { dataKey: "age14to24", label: "14–24" },
  { dataKey: "age25to44", label: "25–44" },
  { dataKey: "age45to64", label: "45–64" },
  { dataKey: "age65plus", label: "65+" },
] as const;

export type UsAgeBandKey = (typeof usAgeBands)[number]["dataKey"];

export interface UsStateAgeDatum
  extends Record<UsAgeBandKey, number>,
    Record<string, unknown> {
  /** Postal abbreviation (axis label) */
  state: string;
  name: string;
  total: number;
}

/** [abbr, name, …thousands per band in `usAgeBands` order] */
type Row = [string, string, number, number, number, number, number];

const rows: Row[] = [
  ["CA", "California", 7205, 6014, 10_605, 8819, 4114],
  ["TX", "Texas", 5305, 3875, 7018, 5657, 2472],
  ["NY", "New York", 3350, 3057, 5355, 5120, 2608],
  ["FL", "Florida", 3079, 2532, 4782, 4747, 3188],
  ["IL", "Illinois", 2453, 2037, 3596, 3239, 1575],
  ["PA", "Pennsylvania", 2083, 1883, 3158, 3414, 1911],
  ["OH", "Ohio", 2084, 1728, 3019, 3084, 1571],
  ["MI", "Michigan", 1805, 1560, 2628, 2706, 1304],
  ["GA", "Georgia", 1991, 1478, 2847, 2389, 981],
  ["NC", "North Carolina", 1751, 1376, 2576, 2381, 1139],
  ["NJ", "New Jersey", 1569, 1248, 2380, 2335, 1151],
  ["VA", "Virginia", 1410, 1181, 2203, 2034, 941],
  ["WA", "Washington", 1183, 968, 1851, 1763, 784],
  ["AZ", "Arizona", 1345, 965, 1805, 1524, 863],
  ["MA", "Massachusetts", 1085, 1008, 1782, 1752, 871],
  ["IN", "Indiana", 1223, 967, 1725, 1648, 814],
  ["TN", "Tennessee", 1142, 887, 1719, 1647, 820],
  ["MO", "Missouri", 1090, 892, 1570, 1555, 805],
  ["MD", "Maryland", 1024, 860, 1556, 1514, 680],
  ["WI", "Wisconsin", 1003, 866, 1487, 1522, 750],
  ["MN", "Minnesota", 965, 797, 1416, 1392, 651],
  ["CO", "Colorado", 945, 728, 1465, 1290, 511],
  ["AL", "Alabama", 863, 710, 1232, 1216, 642],
  ["SC", "South Carolina", 821, 684, 1193, 1186, 596],
  ["LA", "Louisiana", 853, 726, 1162, 1129, 540],
  ["KY", "Kentucky", 778, 611, 1180, 1134, 566],
  ["OR", "Oregon", 668, 538, 1044, 1036, 504],
  ["OK", "Oklahoma", 705, 570, 957, 919, 491],
  ["CT", "Connecticut", 615, 522, 917, 969, 478],
  ["IA", "Iowa", 547, 472, 751, 788, 445],
  ["MS", "Mississippi", 592, 480, 764, 730, 372],
  ["AR", "Arkansas", 545, 421, 754, 727, 407],
  ["KS", "Kansas", 545, 449, 728, 714, 367],
  ["UT", "Utah", 682, 497, 772, 539, 246],
  ["NV", "Nevada", 525, 355, 770, 653, 297],
  ["NM", "New Mexico", 390, 316, 517, 502, 260],
  ["WV", "West Virginia", 295, 249, 471, 515, 285],
  ["NE", "Nebraska", 347, 286, 457, 452, 241],
  ["ID", "Idaho", 323, 237, 406, 375, 182],
  ["ME", "Maine", 205, 182, 332, 398, 199],
  ["NH", "New Hampshire", 220, 193, 345, 388, 170],
  ["HI", "Hawaii", 221, 189, 356, 332, 190],
  ["RI", "Rhode Island", 172, 171, 278, 282, 148],
  ["MT", "Montana", 167, 148, 236, 278, 137],
  ["DE", "Delaware", 159, 132, 230, 231, 122],
  ["SD", "South Dakota", 153, 128, 197, 210, 116],
  ["AK", "Alaska", 138, 116, 199, 183, 50],
  ["ND", "North Dakota", 109, 116, 155, 167, 94],
  ["VT", "Vermont", 95, 95, 155, 189, 87],
  ["DC", "District of Columbia", 87, 101, 194, 140, 71],
  ["WY", "Wyoming", 99, 83, 137, 147, 66],
];

export const usStateAgeData: UsStateAgeDatum[] = rows.map(
  ([state, name, ...bands]) => {
    const values = Object.fromEntries(
      usAgeBands.map((band, i) => [band.dataKey, (bands[i] ?? 0) * 1000])
    ) as Record<UsAgeBandKey, number>;
    return {
      state,
      name,
      ...values,
      total: bands.reduce((sum, v) => sum + v, 0) * 1000,
    };
  }
);
