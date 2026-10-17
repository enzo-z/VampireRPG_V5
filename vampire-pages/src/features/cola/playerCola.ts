import { entriesOf, findEntry, type CatalogIndex } from '../../catalog/lookup.ts';
import { findPlayerCola } from '../../catalog/playerColas.ts';
import type { CatalogEntry, ColaBlock, PlayerColaCatalog } from '../../catalog/types.ts';
import type { Ficha } from '../../domain/character.ts';
import {
  ATTRIBUTE_LABELS,
  SKILL_KEYS,
  SKILL_LABELS,
  type AttributeKey,
  type SkillKey,
} from '../../domain/traits.ts';

/** Catalogs the player's page reads from; injected so the builder stays pure and testable. */
export interface PlayerColaCatalogs {
  disciplines: CatalogIndex;
  playerColas: PlayerColaCatalog;
}

/** A field of a power as written in the note, already rendered to HTML. */
export interface PowerField {
  label: string;
  html: string;
}

export interface PlayerPower {
  /** As written on the sheet. */
  name: string;
  /** Power level in its discipline; null when the power is not in the catalog. */
  level: number | null;
  /** Custo, Duração and Dice Pool, in that order, straight from the note. */
  fields: PowerField[];
  /** The note's "Cola" line: the short summary written for this sheet. */
  summaryHtml: string | null;
}

export interface PlayerDiscipline {
  name: string;
  value: number;
  powers: PlayerPower[];
}

export interface PlayerPool {
  skill: string;
  dots: number;
  specialty: string;
  attribute: string;
  dice: number;
}

export interface PlayerCola {
  name: string;
  clan: string;
  predatorType: string;
  generation: string;
  bloodPotency: number;
  ambition: string;
  desire: string;
  disciplines: PlayerDiscipline[];
  pools: PlayerPool[];
  /** The character's lore blocks, from Regras/Colas dos Jogadores/; empty when there is no note. */
  lore: ColaBlock[];
  /** Sheet texts that matched nothing in the vault; shown on screen only. */
  warnings: string[];
}

const POWER_FIELD_LABELS = ['Custo', 'Duração', 'Dice Pool'] as const;
const COLA_LABEL = 'Cola';
/** Skills worth a ready-made pool on the sheet. */
export const STRONG_SKILL_DOTS = 3;
const FIELD_MAX_LENGTH = 60;

function plainText(html: string): string {
  return html
    .replace(/<\/(p|li|div|h\d)>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A field fits the sheet's one-line facts when it is short. Longer ones carry a
 * sub-paragraph of rules, which the power's Cola line is written to cover.
 */
export function isShortField(html: string): boolean {
  return plainText(html).length <= FIELD_MAX_LENGTH;
}

function field(entry: CatalogEntry, label: string): string | null {
  return entry.fields.find((candidate) => candidate.label === label)?.html ?? null;
}

function buildPower(entry: CatalogEntry | null, name: string): PlayerPower {
  if (entry === null) return { name, level: null, fields: [], summaryHtml: null };
  const summaryHtml = field(entry, COLA_LABEL);
  // Without a Cola line nothing covers a long field, so it is printed whole.
  const fields = POWER_FIELD_LABELS.flatMap((label) => {
    const html = field(entry, label);
    return html === null || (summaryHtml !== null && !isShortField(html)) ? [] : [{ label, html }];
  });
  return { name: entry.name, level: entry.level, fields, summaryHtml };
}

function buildDisciplines(ficha: Ficha, catalogs: PlayerColaCatalogs, warnings: string[]): PlayerDiscipline[] {
  return ficha.disciplines
    .filter((discipline) => discipline.name.trim() !== '' && discipline.value > 0)
    .map((discipline) => {
      const known = entriesOf(catalogs.disciplines, discipline.name).length > 0;
      if (!known) warnings.push(`Disciplina "${discipline.name}" não encontrada no vault.`);
      const powers = discipline.powers
        .filter((power) => power.name.trim() !== '')
        .map((power) => {
          const entry = findEntry(catalogs.disciplines, discipline.name, power.name);
          if (known && entry === null) warnings.push(`Poder "${power.name}" (${discipline.name}) não encontrado no vault.`);
          const built = buildPower(entry, power.name);
          if (entry !== null && built.summaryHtml === null) warnings.push(`Poder "${entry.name}" sem linha Cola na nota.`);
          return built;
        });
      return { name: discipline.name, value: discipline.value, powers };
    });
}

/**
 * Attributes the V5 book usually pairs with each skill, in order of preference.
 * The pool uses the highest of them on the sheet (ties keep the first listed).
 */
export const SKILL_ATTRIBUTES: Readonly<Record<SkillKey, readonly [AttributeKey, ...AttributeKey[]]>> = {
  athletics: ['strength', 'dexterity'],
  brawl: ['strength', 'dexterity'],
  craft: ['dexterity', 'intelligence'],
  drive: ['dexterity', 'wits'],
  firearms: ['dexterity'],
  larceny: ['dexterity', 'wits'],
  melee: ['strength', 'dexterity'],
  stealth: ['dexterity', 'wits'],
  survival: ['stamina', 'wits'],
  animalKen: ['charisma', 'manipulation'],
  etiquette: ['charisma', 'manipulation'],
  insight: ['wits', 'resolve', 'intelligence'],
  intimidation: ['strength', 'manipulation'],
  leadership: ['charisma', 'manipulation'],
  performance: ['charisma', 'manipulation'],
  persuasion: ['charisma', 'manipulation'],
  streetwise: ['charisma', 'manipulation', 'wits'],
  subterfuge: ['manipulation', 'composure'],
  academics: ['intelligence', 'resolve'],
  awareness: ['wits', 'resolve'],
  finance: ['intelligence', 'wits'],
  investigation: ['intelligence', 'wits'],
  medicine: ['intelligence', 'wits'],
  occult: ['intelligence', 'resolve'],
  politics: ['intelligence', 'charisma', 'manipulation'],
  science: ['intelligence', 'resolve'],
  technology: ['intelligence', 'wits'],
};

function bestAttributeFor(ficha: Ficha, skill: SkillKey): AttributeKey {
  const [first, ...rest] = SKILL_ATTRIBUTES[skill];
  return rest.reduce<AttributeKey>((top, key) => (ficha.attributes[key] > ficha.attributes[top] ? key : top), first);
}

/** Strong skills with the pool of their usual attribute: a starting point, the Narrator decides the pair. */
function buildPools(ficha: Ficha): PlayerPool[] {
  return SKILL_KEYS.filter((key) => ficha.skills[key] >= STRONG_SKILL_DOTS)
    .sort((a, b) => ficha.skills[b] - ficha.skills[a])
    .map((key) => {
      const attribute = bestAttributeFor(ficha, key);
      return {
        skill: SKILL_LABELS[key],
        dots: ficha.skills[key],
        specialty: ficha.specs[key] ?? '',
        attribute: ATTRIBUTE_LABELS[attribute],
        dice: ficha.attributes[attribute] + ficha.skills[key],
      };
    });
}

export function buildPlayerCola(ficha: Ficha, catalogs: PlayerColaCatalogs): PlayerCola {
  const warnings: string[] = [];
  const { identity, blood } = ficha;

  const lore = findPlayerCola(catalogs.playerColas, ficha.name);
  if (lore === null) warnings.push(`Sem nota de lore em "Regras/Colas dos Jogadores" para "${ficha.name}".`);

  return {
    name: ficha.name,
    clan: identity.clan,
    predatorType: identity.predatorType,
    generation: identity.generation,
    bloodPotency: blood.potency,
    ambition: identity.ambition,
    desire: identity.desire,
    disciplines: buildDisciplines(ficha, catalogs, warnings),
    pools: buildPools(ficha),
    lore: lore?.blocks ?? [],
    warnings,
  };
}
