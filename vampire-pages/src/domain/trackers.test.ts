import { describe, expect, it } from 'vitest';
import type { BoxState, DamageTrack } from './character.ts';
import {
  cycleDamageBox,
  cycleHumanityBox,
  damageSummary,
  humanitySummary,
  pickHunger,
  pickMax,
  visibleBoxes,
  withMax,
} from './trackers.ts';

function track(max: number, damage: BoxState[]): DamageTrack {
  const boxes = Array.from({ length: 12 }, (_, index): BoxState => damage[index] ?? 0);
  return Object.freeze({ max, boxes: Object.freeze(boxes) as BoxState[] });
}

function frozenBoxes(boxes: BoxState[]): BoxState[] {
  return Object.freeze([...boxes]) as BoxState[];
}

describe('pickMax (Saúde / Willpower circles)', () => {
  it('clicking the Nth circle sets the maximum to N', () => {
    expect(pickMax(7, 3)).toBe(4);
  });

  it('can raise the maximum above the current one', () => {
    expect(pickMax(4, 8)).toBe(9);
  });

  it('clicking the last filled circle removes one', () => {
    expect(pickMax(7, 6)).toBe(6);
  });

  it('never goes below 1', () => {
    expect(pickMax(1, 0)).toBe(1);
  });

  it('rejects indexes outside the 12 circles', () => {
    expect(() => pickMax(7, -1)).toThrow(RangeError);
    expect(() => pickMax(7, 12)).toThrow(RangeError);
    expect(() => pickMax(7, 1.5)).toThrow(RangeError);
  });
});

describe('withMax', () => {
  it('reducing the maximum hides damage without erasing it', () => {
    const original = track(7, [2, 1, 1]);
    const reduced = withMax(original, 2);

    expect(reduced.boxes).toEqual(original.boxes);
    expect(visibleBoxes(reduced)).toEqual([2, 1]);
  });

  it('raising the maximum again reveals the stored damage', () => {
    const restored = withMax(withMax(track(7, [2, 1, 1]), 2), 7);
    expect(visibleBoxes(restored)).toEqual([2, 1, 1, 0, 0, 0, 0]);
  });

  it('clamps the maximum to 1..12', () => {
    expect(withMax(track(7, []), 0).max).toBe(1);
    expect(withMax(track(7, []), 13).max).toBe(12);
  });

  it('applying a draft built with pickMax equals setting the maximum directly', () => {
    const original = track(7, [1]);
    let draft = original.max;
    draft = pickMax(draft, 9);
    draft = pickMax(draft, 3);
    draft = pickMax(draft, 3);

    expect(draft).toBe(3);
    expect(withMax(original, draft)).toEqual(withMax(original, 3));
    // Discarding the draft is simply not calling withMax: the track is unchanged.
    expect(original).toEqual(track(7, [1]));
  });
});

describe('cycleDamageBox', () => {
  it('cycles a box 0 → 1 → 2 → 0 and leaves the others untouched', () => {
    const start = track(7, [0, 2]);
    const once = cycleDamageBox(start, 0);
    const twice = cycleDamageBox(once, 0);
    const thrice = cycleDamageBox(twice, 0);

    expect(once.boxes.slice(0, 2)).toEqual([1, 2]);
    expect(twice.boxes.slice(0, 2)).toEqual([2, 2]);
    expect(thrice.boxes.slice(0, 2)).toEqual([0, 2]);
  });

  it('ignores clicks on hidden boxes and keeps their damage', () => {
    const start = track(3, [0, 0, 0, 2]);
    expect(cycleDamageBox(start, 3)).toBe(start);
  });

  it('rejects indexes outside the 12 boxes', () => {
    expect(() => cycleDamageBox(track(7, []), 12)).toThrow(RangeError);
  });
});

describe('damageSummary', () => {
  it('counts only the visible boxes', () => {
    expect(damageSummary(track(3, [1, 2, 0, 2, 2]))).toEqual({ superficial: 1, aggravated: 1, empty: 1 });
  });
});

describe('Humanidade', () => {
  it('cycles one position 0 → 1 → 2 → 0, including the second group of five', () => {
    const start = frozenBoxes([2, 2, 2, 2, 2, 0, 0, 0, 0, 0]);
    const once = cycleHumanityBox(start, 5);
    const twice = cycleHumanityBox(once, 5);
    const thrice = cycleHumanityBox(twice, 5);

    expect(once).toEqual([2, 2, 2, 2, 2, 1, 0, 0, 0, 0]);
    expect(twice).toEqual([2, 2, 2, 2, 2, 2, 0, 0, 0, 0]);
    expect(thrice).toEqual(start);
  });

  it('summarizes filled boxes and stains', () => {
    expect(humanitySummary([2, 2, 2, 2, 2, 2, 2, 1, 0, 0])).toEqual({ humanity: 7, stains: 1 });
  });

  it('rejects indexes outside the 10 positions', () => {
    const boxes = frozenBoxes([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(() => cycleHumanityBox(boxes, -1)).toThrow(RangeError);
    expect(() => cycleHumanityBox(boxes, 10)).toThrow(RangeError);
  });
});

describe('Fome', () => {
  it('square N sets Hunger to N and the last filled square lowers it by one', () => {
    expect(pickHunger(0, 0)).toBe(1);
    expect(pickHunger(2, 4)).toBe(5);
    expect(pickHunger(3, 2)).toBe(2);
    expect(pickHunger(1, 0)).toBe(0);
  });

  it('rejects indexes outside the 5 squares', () => {
    expect(() => pickHunger(0, 5)).toThrow(RangeError);
    expect(() => pickHunger(0, -1)).toThrow(RangeError);
  });
});
