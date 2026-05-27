import {
  generateStudioProfitLossData,
  STUDIO_PROFIT_LOSS_DATA_KEY,
} from "@/lib/studio/demo-data";

export const PROFIT_LOSS_DATA_KEY = STUDIO_PROFIT_LOSS_DATA_KEY;

/** @deprecated Import from `@/lib/studio/demo-data` instead. */
export function generateProfitLossData(pointCount: number) {
  return generateStudioProfitLossData(pointCount);
}
