export const revenueSeries = [
  { date: new Date("2024-01-01"), value: 5200 },
  { date: new Date("2024-02-01"), value: 6100 },
  { date: new Date("2024-03-01"), value: 5400 },
  { date: new Date("2024-04-01"), value: 4700 },
  { date: new Date("2024-05-01"), value: 5100 },
  { date: new Date("2024-06-01"), value: 6800 },
  { date: new Date("2024-07-01"), value: 6400 },
  { date: new Date("2024-08-01"), value: 7200 },
  { date: new Date("2024-09-01"), value: 6900 },
  { date: new Date("2024-10-01"), value: 8100 },
  { date: new Date("2024-11-01"), value: 7600 },
  { date: new Date("2024-12-01"), value: 8800 },
];

export const revenueStats = {
  average:
    revenueSeries.reduce((sum, point) => sum + point.value, 0) /
    revenueSeries.length,
  trend: 12.4,
};
