import type { DotRange } from './character.ts';

/**
 * Clicking dot N sets the value to N; clicking the current last dot lowers it by one.
 * The result is kept within the trait's range (attributes never drop below 1).
 */
export function pickDots(current: number, index: number, range: DotRange): number {
  if (!Number.isInteger(index) || index < 0 || index >= range.max) {
    throw new RangeError(`pickDots: index ${index} outside 0..${range.max - 1}`);
  }
  const clicked = index + 1;
  const next = clicked === current ? index : clicked;
  return Math.min(range.max, Math.max(range.min, next));
}
