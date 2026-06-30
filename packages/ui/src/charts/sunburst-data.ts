export interface SunburstNode {
  name: string;
  value?: number;
  color?: string;
  /** Optional fill override for patterns/gradients (e.g., "url(#patternId)") */
  fill?: string;
  children?: SunburstNode[];
}
