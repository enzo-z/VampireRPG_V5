import type { AttributeKey, SkillKey } from './traits.ts';

/** Box state for damage and Humanity: 0 empty, 1 superficial / stain (slash), 2 aggravated / filled. */
export type BoxState = 0 | 1 | 2;

export interface DotRange {
  readonly min: number;
  readonly max: number;
}

/** Saúde and Willpower always store TRACK_CAP boxes; `max` only hides the tail. */
export const TRACK_CAP = 12;
export const HUNGER_MAX = 5;
export const HUMANITY_SIZE = 10;
export const DISCIPLINE_SLOTS = 6;
export const POWERS_PER_DISCIPLINE = 5;

export const ATTRIBUTE_RANGE: DotRange = { min: 1, max: 5 };
export const SKILL_RANGE: DotRange = { min: 0, max: 5 };
export const DISCIPLINE_RANGE: DotRange = { min: 0, max: 5 };
export const BLOOD_POTENCY_RANGE: DotRange = { min: 0, max: 10 };

export interface DamageTrack {
  /** Number of usable boxes, 1..TRACK_CAP. */
  max: number;
  /** Always TRACK_CAP entries; damage past `max` is kept but hidden. */
  boxes: BoxState[];
}

export interface Trackers {
  health: DamageTrack;
  willpower: DamageTrack;
  /** 0..HUNGER_MAX */
  hunger: number;
  /** HUMANITY_SIZE entries: 2 filled, 1 stain, 0 empty. */
  humanity: BoxState[];
}

export interface Identity {
  player: string;
  chronicle: string;
  clan: string;
  predatorType: string;
  ambition: string;
  /** Shown as "Facção". */
  sect: string;
  generation: string;
  desire: string;
}

export interface DisciplinePower {
  name: string;
  /** Free text, e.g. "Nv 2 · 1 Rouse". */
  note: string;
}

export interface Discipline {
  name: string;
  value: number;
  /** Up to POWERS_PER_DISCIPLINE entries. */
  powers: DisciplinePower[];
}

export interface Blood {
  potency: number;
  resonance: string;
  surge: string;
  mendAmount: string;
  rouseReRoll: string;
  baneSeverity: string;
  clanBane: string;
  clanCompulsion: string;
}

export interface Ficha {
  id: string;
  name: string;
  identity: Identity;
  attributes: Record<AttributeKey, number>;
  skills: Record<SkillKey, number>;
  /** Free-text specialization per skill; absent when there is none. */
  specs: Partial<Record<SkillKey, string>>;
  /** Exactly DISCIPLINE_SLOTS entries. */
  disciplines: Discipline[];
  trackers: Trackers;
  blood: Blood;
  notes: string;
}

export const SCHEMA_VERSION = 1;

export interface SheetFile {
  schemaVersion: typeof SCHEMA_VERSION;
  fichas: Ficha[];
}
