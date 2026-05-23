export const sessionsSeries = [
  { date: new Date("2024-06-03"), value: 920 },
  { date: new Date("2024-06-04"), value: 1380 },
  { date: new Date("2024-06-05"), value: 1120 },
  { date: new Date("2024-06-06"), value: 1580 },
  { date: new Date("2024-06-07"), value: 1240 },
  { date: new Date("2024-06-08"), value: 1710 },
  { date: new Date("2024-06-09"), value: 1460 },
];

export const sessionsStats = {
  average:
    sessionsSeries.reduce((sum, point) => sum + point.value, 0) /
    sessionsSeries.length,
  trend: 8.2,
};
