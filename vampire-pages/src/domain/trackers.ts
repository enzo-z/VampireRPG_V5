import { HUMANITY_SIZE, HUNGER_MAX, TRACK_CAP, type BoxState, type DamageTrack } from './character.ts';

// Pure tracker rules (vampire-pages/CLAUDE.md, "Modelo dos trackers").
// Invalid indexes are programming errors and throw RangeError.

const NEXT_BOX_STATE: Readonly<Record<BoxState, BoxState>> = { 0: 1, 1: 2, 2: 0 };

export function nextBoxState(state: BoxState): BoxState {
  return NEXT_BOX_STATE[state];
}

function assertIndex(index: number, size: number, what: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= size) {
    throw new RangeError(`${what}: index ${index} outside 0..${size - 1}`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

/** Clicking circle N sets the maximum to N; clicking the last filled circle removes one (minimum 1). */
export function pickMax(currentMax: number, index: number): number {
  assertIndex(index, TRACK_CAP, 'pickMax');
  const clicked = index + 1;
  return clicked === currentMax ? Math.max(1, index) : clicked;
}

/** Changes the maximum without touching stored damage: boxes past the maximum stay hidden, not erased. */
export function withMax(track: DamageTrack, max: number): DamageTrack {
  return { ...track, max: clamp(max, 1, TRACK_CAP) };
}

/** Cycles one visible box 0 → 1 → 2 → 0; hidden boxes (index ≥ max) are left untouched. */
export function cycleDamageBox(track: DamageTrack, index: number): DamageTrack {
  assertIndex(index, TRACK_CAP, 'cycleDamageBox');
  const current = track.boxes[index];
  if (index >= track.max || current === undefined) return track;
  return { ...track, boxes: track.boxes.with(index, nextBoxState(current)) };
}

export function visibleBoxes(track: DamageTrack): readonly BoxState[] {
  return track.boxes.slice(0, track.max);
}

export interface DamageSummary {
  superficial: number;
  aggravated: number;
  empty: number;
}

export function damageSummary(track: DamageTrack): DamageSummary {
  const visible = visibleBoxes(track);
  const count = (state: BoxState) => visible.filter((box) => box === state).length;
  return { superficial: count(1), aggravated: count(2), empty: count(0) };
}

/** Hunger is a count shown as HUNGER_MAX binary squares: square N sets N; the last filled one lowers by one. */
export function pickHunger(current: number, index: number): number {
  assertIndex(index, HUNGER_MAX, 'pickHunger');
  const clicked = index + 1;
  return clicked === current ? index : clicked;
}

/** Cycles a single Humanity box 0 → 1 → 2 → 0. */
export function cycleHumanityBox(boxes: readonly BoxState[], index: number): BoxState[] {
  assertIndex(index, HUMANITY_SIZE, 'cycleHumanityBox');
  const current = boxes[index];
  if (current === undefined) {
    throw new RangeError(`cycleHumanityBox: expected ${HUMANITY_SIZE} boxes, got ${boxes.length}`);
  }
  return boxes.with(index, nextBoxState(current));
}

export interface HumanitySummary {
  humanity: number;
  stains: number;
}

export function humanitySummary(boxes: readonly BoxState[]): HumanitySummary {
  return {
    humanity: boxes.filter((box) => box === 2).length,
    stains: boxes.filter((box) => box === 1).length,
  };
}
