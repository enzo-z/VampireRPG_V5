import { z } from 'zod';
import {
  ADVANTAGE_RANGE,
  ATTRIBUTE_RANGE,
  BLOOD_POTENCY_RANGE,
  DISCIPLINE_RANGE,
  DISCIPLINE_SLOTS,
  HUMANITY_SIZE,
  HUNGER_MAX,
  POWERS_PER_DISCIPLINE,
  SCHEMA_VERSION,
  SKILL_RANGE,
  TRACK_CAP,
  type DotRange,
  type Ficha,
  type SheetFile,
} from '../domain/character.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS, type AttributeKey, type SkillKey } from '../domain/traits.ts';

// Validation schema for schemaVersion 1. Typed against the hand-written domain
// types, so any drift between the two is a compile error.

const dots = (range: DotRange) => z.int().min(range.min).max(range.max);

function dotsRecord<K extends string>(keys: readonly K[], range: DotRange) {
  const shape = Object.fromEntries(keys.map((key) => [key, dots(range)])) as Record<K, ReturnType<typeof dots>>;
  return z.strictObject(shape);
}

const boxState = z.union([z.literal(0), z.literal(1), z.literal(2)]);

const damageTrack = z.strictObject({
  max: z.int().min(1).max(TRACK_CAP),
  boxes: z.array(boxState).length(TRACK_CAP),
});

const identity = z.strictObject({
  player: z.string(),
  chronicle: z.string(),
  clan: z.string(),
  predatorType: z.string(),
  ambition: z.string(),
  sect: z.string(),
  generation: z.string(),
  desire: z.string(),
});

const discipline = z.strictObject({
  name: z.string(),
  value: dots(DISCIPLINE_RANGE),
  powers: z.array(z.strictObject({ name: z.string(), note: z.string() })).max(POWERS_PER_DISCIPLINE),
});

const blood = z.strictObject({
  potency: dots(BLOOD_POTENCY_RANGE),
  resonance: z.string(),
  surge: z.string(),
  mendAmount: z.string(),
  rouseReRoll: z.string(),
  baneSeverity: z.string(),
  clanBane: z.string(),
  clanCompulsion: z.string(),
});

const advantage = z.strictObject({
  category: z.enum(['merit', 'background', 'flaw', 'loresheet']),
  name: z.string(),
  level: dots(ADVANTAGE_RANGE),
  note: z.string(),
});

const beliefs = z.strictObject({
  chronicleTenets: z.string(),
  convictions: z.string(),
  touchstones: z.string(),
});

const profile = z.strictObject({
  sire: z.string(),
  birthday: z.string(),
  age: z.string(),
  embraced: z.string(),
  apparentAge: z.string(),
  description: z.string(),
  concept: z.string(),
  photo: z.union([z.literal(''), z.string().startsWith('data:image/')]),
});

export const fichaSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  identity,
  attributes: dotsRecord<AttributeKey>(ATTRIBUTE_KEYS, ATTRIBUTE_RANGE),
  skills: dotsRecord<SkillKey>(SKILL_KEYS, SKILL_RANGE),
  specs: z.partialRecord(z.enum(SKILL_KEYS), z.string()),
  disciplines: z.array(discipline).length(DISCIPLINE_SLOTS),
  trackers: z.strictObject({
    health: damageTrack,
    willpower: damageTrack,
    hunger: z.int().min(0).max(HUNGER_MAX),
    humanity: z.array(boxState).length(HUMANITY_SIZE),
  }),
  blood,
  advantages: z.array(advantage),
  beliefs,
  profile,
  notes: z.string(),
}) satisfies z.ZodType<Ficha>;

export const sheetFileSchema = z
  .strictObject({
    schemaVersion: z.literal(SCHEMA_VERSION),
    fichas: z.array(fichaSchema),
  })
  .superRefine((file, context) => {
    const seen = new Set<string>();
    file.fichas.forEach((ficha, index) => {
      if (seen.has(ficha.id)) {
        context.addIssue({ code: 'custom', path: ['fichas', index, 'id'], message: `id repetido: "${ficha.id}"` });
      }
      seen.add(ficha.id);
    });
  }) satisfies z.ZodType<SheetFile>;
