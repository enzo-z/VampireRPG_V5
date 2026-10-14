import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_RANGE, BLOOD_POTENCY_RANGE, SKILL_RANGE } from './character.ts';
import { pickDots } from './dots.ts';

describe('pickDots', () => {
  it('clicking dot N sets the value to N', () => {
    expect(pickDots(1, 3, SKILL_RANGE)).toBe(4);
  });

  it('keeps attributes at 1 or more', () => {
    expect(pickDots(1, 0, ATTRIBUTE_RANGE)).toBe(1);
  });

  it('lets skills drop to 0 by clicking the last dot', () => {
    expect(pickDots(1, 0, SKILL_RANGE)).toBe(0);
  });

  it('handles the 10 Blood Potency dots', () => {
    expect(pickDots(10, 9, BLOOD_POTENCY_RANGE)).toBe(9);
    expect(pickDots(0, 9, BLOOD_POTENCY_RANGE)).toBe(10);
  });

  it('rejects indexes outside the range', () => {
    expect(() => pickDots(0, 5, SKILL_RANGE)).toThrow(RangeError);
  });
});
