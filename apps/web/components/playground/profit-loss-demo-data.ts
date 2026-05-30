import {
  generateStudioProfitLossData,
  STUDIO_PROFIT_LOSS_DATA_KEY,
} from "@bklitui/studio";

export const PROFIT_LOSS_DATA_KEY = STUDIO_PROFIT_LOSS_DATA_KEY;

/** @deprecated Import from `@bklitui/studio` instead. */
export function generateProfitLossData(pointCount: number) {
  return generateStudioProfitLossData(pointCount);
}
