import {
  ATTRIBUTE_RANGE,
  DISCIPLINE_SLOTS,
  HUMANITY_SIZE,
  SKILL_RANGE,
  TRACK_CAP,
  type BoxState,
  type DamageTrack,
  type Discipline,
  type Ficha,
} from './character.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS, type AttributeKey, type SkillKey } from './traits.ts';

export const DEFAULT_HEALTH_MAX = 7;
export const DEFAULT_WILLPOWER_MAX = 5;
export const DEFAULT_HUMANITY = 7;
export const DEFAULT_BLOOD_POTENCY = 1;

export function emptyDamageTrack(max: number): DamageTrack {
  return { max, boxes: Array.from<BoxState>({ length: TRACK_CAP }).fill(0) };
}

export function humanityBoxes(humanity: number, stains = 0): BoxState[] {
  return Array.from({ length: HUMANITY_SIZE }, (_, index): BoxState => {
    if (index < humanity) return 2;
    if (index >= HUMANITY_SIZE - stains) return 1;
    return 0;
  });
}

export function emptyDiscipline(): Discipline {
  return { name: '', value: 0, powers: [] };
}

function recordOf<K extends string>(keys: readonly K[], value: number): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, value])) as Record<K, number>;
}

export function createFicha(id: string, name: string, player = ''): Ficha {
  return {
    id,
    name,
    identity: {
      player,
      chronicle: '',
      clan: '',
      predatorType: '',
      ambition: '',
      sect: '',
      generation: '',
      desire: '',
    },
    attributes: recordOf<AttributeKey>(ATTRIBUTE_KEYS, ATTRIBUTE_RANGE.min),
    skills: recordOf<SkillKey>(SKILL_KEYS, SKILL_RANGE.min),
    specs: {},
    disciplines: Array.from({ length: DISCIPLINE_SLOTS }, emptyDiscipline),
    trackers: {
      health: emptyDamageTrack(DEFAULT_HEALTH_MAX),
      willpower: emptyDamageTrack(DEFAULT_WILLPOWER_MAX),
      hunger: 0,
      humanity: humanityBoxes(DEFAULT_HUMANITY),
    },
    blood: {
      potency: DEFAULT_BLOOD_POTENCY,
      resonance: '',
      surge: '',
      mendAmount: '',
      rouseReRoll: '',
      baneSeverity: '',
      clanBane: '',
      clanCompulsion: '',
    },
    notes: '',
  };
}
