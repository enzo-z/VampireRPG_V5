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
  SKILL_RANGE,
  TRACK_CAP,
  type AdvantageCategory,
  type AdvantageItem,
  type BoxState,
  type DamageTrack,
  type Discipline,
  type Ficha,
} from '../domain/character.ts';
import { createFicha, emptyDiscipline, humanityBoxes } from '../domain/defaults.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS, type AttributeKey, type SkillKey } from '../domain/traits.ts';

// Converts one character exported by Pedro's app (no schemaVersion, see
// INVENTARIO.md, "Import e export") into a v1 ficha. The input schema is
// deliberately tolerant: missing or malformed fields fall back to defaults.

const text = z.string().catch('');
const number = z.number().catch(0);
const looseArray = z.array(z.unknown()).catch([]);
const looseRecord = z.record(z.string(), z.unknown()).catch({});

const legacyCharacterSchema = z.object({
  name: z.string().trim().min(1),
  aliases: text,
  clan: text,
  generation: text,
  predatorType: text,
  faction: text,
  ambition: text,
  embrace: text,
  sire: text,
  languages: text,
  xpTotal: z.union([z.string(), z.number()]).catch(''),
  xpSpent: z.union([z.string(), z.number()]).catch(''),
  attributes: looseRecord,
  skills: looseRecord,
  advantages: z.array(z.object({ name: text, level: number, note: text })).catch([]),
  flaws: z.array(z.object({ name: text, level: number, note: text })).catch([]),
  trackers: z
    .object({
      healthMax: number,
      health: looseArray,
      willpowerMax: number,
      willpower: looseArray,
      hunger: looseArray,
      humanity: number,
      humanityStains: number,
      bp: number,
      resonance: text,
    })
    .catch({
      healthMax: 0, health: [], willpowerMax: 0, willpower: [], hunger: [],
      humanity: 0, humanityStains: 0, bp: 0, resonance: '',
    }),
  disciplines: z
    .array(z.object({ name: text, level: number, powers: z.array(z.string()).catch([]), rituals: z.array(z.string()).catch([]) }))
    .catch([]),
  convictions: z.array(z.string()).catch([]),
  touchstones: z.array(z.object({ name: text, summary: text })).catch([]),
  background: text,
  notes: text,
  portrait: z.unknown().optional(),
  backdrop: z.unknown().optional(),
  pools: z.unknown().optional(),
  inventory: z.unknown().optional(),
});

type LegacyCharacter = z.infer<typeof legacyCharacterSchema>;

export interface LegacyMigration {
  ficha: Ficha;
  warnings: string[];
}

/** Recognizes the legacy export: no schemaVersion, a name and the sheet sections. */
export function looksLikeLegacyPedro(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    !('schemaVersion' in record) &&
    typeof record['name'] === 'string' &&
    typeof record['attributes'] === 'object' &&
    typeof record['skills'] === 'object' &&
    typeof record['trackers'] === 'object'
  );
}

function clampInt(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min;
}

function toBoxState(value: unknown): BoxState {
  return value === 1 || value === 2 ? value : 0;
}

function migrateDamage(label: string, max: number, states: readonly unknown[], warnings: string[]): DamageTrack {
  const clampedMax = clampInt(max, 1, TRACK_CAP);
  if (max > TRACK_CAP) warnings.push(`${label}: máximo ${max} reduzido para ${TRACK_CAP}.`);
  const lostDamage = states.slice(TRACK_CAP).some((state) => toBoxState(state) !== 0);
  if (lostDamage) warnings.push(`${label}: dano além da caixa ${TRACK_CAP} foi descartado.`);
  return { max: clampedMax, boxes: Array.from({ length: TRACK_CAP }, (_, index) => toBoxState(states[index])) };
}

function migrateAttributes(raw: Record<string, unknown>): Record<AttributeKey, number> {
  const entries = ATTRIBUTE_KEYS.map((key) => {
    const value = raw[key];
    return [key, typeof value === 'number' ? clampInt(value, ATTRIBUTE_RANGE.min, ATTRIBUTE_RANGE.max) : ATTRIBUTE_RANGE.min];
  });
  return Object.fromEntries(entries) as Record<AttributeKey, number>;
}

function migrateSkills(raw: Record<string, unknown>): Pick<Ficha, 'skills' | 'specs'> {
  const skills = {} as Record<SkillKey, number>;
  const specs: Partial<Record<SkillKey, string>> = {};
  for (const key of SKILL_KEYS) {
    const entry = raw[key];
    const record = typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>) : {};
    const value = record['value'];
    const specialty = record['specialty'];
    skills[key] = typeof value === 'number' ? clampInt(value, SKILL_RANGE.min, SKILL_RANGE.max) : SKILL_RANGE.min;
    if (typeof specialty === 'string' && specialty.trim() !== '') specs[key] = specialty.trim();
  }
  return { skills, specs };
}

function migrateDisciplines(legacy: LegacyCharacter['disciplines'], warnings: string[]): Discipline[] {
  if (legacy.length > DISCIPLINE_SLOTS) {
    const dropped = legacy.slice(DISCIPLINE_SLOTS).map((d) => d.name).join(', ');
    warnings.push(`Só cabem ${DISCIPLINE_SLOTS} disciplinas; ficaram de fora: ${dropped}.`);
  }
  const migrated = legacy.slice(0, DISCIPLINE_SLOTS).map((discipline): Discipline => {
    if (discipline.powers.length > POWERS_PER_DISCIPLINE) {
      warnings.push(`${discipline.name}: só cabem ${POWERS_PER_DISCIPLINE} poderes; os demais foram para as notas.`);
    }
    return {
      name: discipline.name,
      value: clampInt(discipline.level, DISCIPLINE_RANGE.min, DISCIPLINE_RANGE.max),
      powers: discipline.powers.slice(0, POWERS_PER_DISCIPLINE).map((name) => ({ name, note: '' })),
    };
  });
  return [...migrated, ...Array.from({ length: DISCIPLINE_SLOTS - migrated.length }, emptyDiscipline)];
}

/** Backgrounds of the V5 Core (English and common Portuguese names); other advantages count as merits. */
const BACKGROUND_NAMES = new Set([
  'allies', 'aliados', 'contacts', 'contatos', 'fame', 'fama', 'haven', 'refugio', 'herd', 'rebanho',
  'influence', 'influencia', 'mask', 'mascara', 'mawla', 'mentor', 'resources', 'recursos', 'retainer', 'retainers', 'status',
]);

function advantageCategory(name: string, isFlaw: boolean): AdvantageCategory {
  if (isFlaw) return 'flaw';
  const key = name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s*\(.*$/, '').trim();
  if (key.startsWith('loresheet')) return 'loresheet';
  return BACKGROUND_NAMES.has(key) ? 'background' : 'merit';
}

function migrateAdvantages(legacy: LegacyCharacter): AdvantageItem[] {
  const toItem = (isFlaw: boolean) => (item: { name: string; level: number; note: string }): AdvantageItem => ({
    category: advantageCategory(item.name, isFlaw),
    name: item.name.trim(),
    level: clampInt(item.level, ADVANTAGE_RANGE.min, ADVANTAGE_RANGE.max),
    note: item.note.trim(),
  });
  return [...legacy.advantages.map(toItem(false)), ...legacy.flaws.map(toItem(true))].filter((item) => item.name !== '');
}

function line(label: string, value: string): string[] {
  return value.trim() === '' ? [] : [`${label}: ${value.trim()}`];
}

/** Fields without a place in schema v1 are kept as text in `notes` until page 2 exists. */
function legacyNotes(legacy: LegacyCharacter): string {
  const overflowPowers = legacy.disciplines
    .filter((d) => d.powers.length > POWERS_PER_DISCIPLINE)
    .map((d) => `${d.name}: ${d.powers.slice(POWERS_PER_DISCIPLINE).join(', ')}`);
  const rituals = legacy.disciplines.filter((d) => d.rituals.length > 0).map((d) => `${d.name}: ${d.rituals.join(', ')}`);

  const body = [
    ...line('Apelidos', legacy.aliases),
    ...line('Senhor (sire)', legacy.sire),
    ...line('Abraço', legacy.embrace),
    ...line('Idiomas', legacy.languages),
    ...line('XP', legacy.xpTotal === '' && legacy.xpSpent === '' ? '' : `total ${legacy.xpTotal}, gasto ${legacy.xpSpent}`),
    ...line('Convicções', legacy.convictions.join('; ')),
    ...line('Touchstones', legacy.touchstones.map((t) => (t.summary ? `${t.name} — ${t.summary}` : t.name)).join('; ')),
    ...line('Poderes excedentes', overflowPowers.join('; ')),
    ...line('Rituais', rituals.join('; ')),
    ...line('Background', legacy.background),
    ...line('Notas', legacy.notes),
  ];
  return body.length === 0 ? '' : ['— Importado do app do Pedro —', ...body].join('\n');
}

function hasContent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

export function migrateLegacyPedro(input: unknown, newId: () => string): LegacyMigration | { error: string } {
  const parsed = legacyCharacterSchema.safeParse(input);
  if (!parsed.success) return { error: 'Ficha do app do Pedro sem nome.' };

  const legacy = parsed.data;
  const warnings: string[] = [];
  const { trackers } = legacy;
  const base = createFicha(newId(), legacy.name.trim());

  const humanity = clampInt(trackers.humanity, 0, HUMANITY_SIZE);
  const stains = clampInt(trackers.humanityStains, 0, HUMANITY_SIZE - humanity);
  const dropped = (['portrait', 'backdrop', 'pools', 'inventory'] as const).filter((key) => hasContent(legacy[key]));
  if (dropped.length > 0) warnings.push(`Não importados (sem lugar no app): ${dropped.join(', ')}.`);

  const ficha: Ficha = {
    ...base,
    identity: {
      ...base.identity,
      clan: legacy.clan,
      predatorType: legacy.predatorType,
      ambition: legacy.ambition,
      sect: legacy.faction,
      generation: legacy.generation,
    },
    attributes: migrateAttributes(legacy.attributes),
    ...migrateSkills(legacy.skills),
    disciplines: migrateDisciplines(legacy.disciplines, warnings),
    trackers: {
      health: migrateDamage('Saúde', trackers.healthMax, trackers.health, warnings),
      willpower: migrateDamage('Willpower', trackers.willpowerMax, trackers.willpower, warnings),
      hunger: Math.min(HUNGER_MAX, trackers.hunger.filter(Boolean).length),
      humanity: humanityBoxes(humanity, stains),
    },
    blood: {
      ...base.blood,
      potency: clampInt(trackers.bp, BLOOD_POTENCY_RANGE.min, BLOOD_POTENCY_RANGE.max),
      resonance: trackers.resonance,
    },
    advantages: migrateAdvantages(legacy),
    notes: legacyNotes(legacy),
  };
  return { ficha, warnings };
}
