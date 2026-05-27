export const PROFIT_LOSS_DATA_KEY = "pnl";

/** Sample profit/loss data that crosses zero several times. */
export const profitLossLineDocsData = Array.from({ length: 24 }, (_, index) => {
  const pnl = Math.round(
    Math.sin(index / 2.5) * 800 + Math.cos(index / 6) * 400 + (index - 12) * 15
  );

  return {
    date: new Date(2024, 0, index + 1),
    [PROFIT_LOSS_DATA_KEY]: pnl,
  };
});
