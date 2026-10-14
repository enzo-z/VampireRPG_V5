import { ATTRIBUTE_RANGE, BLOOD_POTENCY_RANGE, DISCIPLINE_RANGE, HUNGER_MAX, SKILL_RANGE, type Ficha } from '../domain/character.ts';
import { matchIdentity, type CatalogField } from '../domain/identityCatalog.ts';
import { damageSummary, humanitySummary } from '../domain/trackers.ts';
import {
  ATTRIBUTE_GROUPS,
  ATTRIBUTE_LABELS,
  SKILL_GROUPS,
  SKILL_LABELS,
  TRAIT_GROUP_LABELS,
  TRAIT_GROUPS,
  type AttributeKey,
  type SkillKey,
  type TraitGroup,
} from '../domain/traits.ts';
import { CORE_ATTRIBUTES } from './attributes.ts';
import { CORE_SKILLS } from './skills.ts';

export type TrackerKind = 'health' | 'willpower' | 'hunger' | 'humanity' | 'bloodPotency';

/** What the reference panel is showing. */
export type Selection =
  | { kind: 'attribute'; key: AttributeKey }
  | { kind: 'skill'; key: SkillKey }
  | { kind: 'discipline'; slot: number }
  | { kind: 'power'; slot: number; powerIndex: number }
  | { kind: 'identity'; field: CatalogField }
  | { kind: 'tracker'; tracker: TrackerKind };

export interface ReferenceFact {
  label: string;
  value: string;
}

export interface ReferenceEntry {
  kicker: string;
  title: string;
  source: string | null;
  paragraphs: readonly string[];
  dots: { value: number; max: number } | null;
  /** Level descriptions 1..N; `currentLevel` is highlighted. */
  levels: readonly string[] | null;
  currentLevel: number;
  facts: readonly ReferenceFact[];
}

export const IDENTITY_FIELD_LABELS: Readonly<Record<CatalogField, string>> = {
  clan: 'Clã',
  sect: 'Facção',
  predatorType: 'Predator Type',
  generation: 'Geração',
};

export const TRACKER_LABELS: Readonly<Record<TrackerKind, string>> = {
  health: 'Saúde',
  willpower: 'Willpower',
  hunger: 'Fome',
  humanity: 'Humanidade',
  bloodPotency: 'Blood Potency',
};

const EMPTY_ENTRY: Omit<ReferenceEntry, 'kicker' | 'title'> = {
  source: null,
  paragraphs: [],
  dots: null,
  levels: null,
  currentLevel: 0,
  facts: [],
};

function groupOf<K extends string>(groups: Readonly<Record<TraitGroup, readonly K[]>>, key: K): TraitGroup {
  return TRAIT_GROUPS.find((group) => groups[group].includes(key)) ?? 'physical';
}

function attributeEntry(ficha: Ficha, key: AttributeKey): ReferenceEntry {
  const text = CORE_ATTRIBUTES[key];
  const value = ficha.attributes[key];
  return {
    ...EMPTY_ENTRY,
    kicker: `Atributo · ${TRAIT_GROUP_LABELS[groupOf(ATTRIBUTE_GROUPS, key)]}`,
    title: ATTRIBUTE_LABELS[key],
    source: text.source,
    paragraphs: [text.body],
    dots: { value, max: ATTRIBUTE_RANGE.max },
    levels: text.levels,
    currentLevel: value,
  };
}

function skillEntry(ficha: Ficha, key: SkillKey): ReferenceEntry {
  const text = CORE_SKILLS[key];
  const value = ficha.skills[key];
  const spec = ficha.specs[key];
  return {
    ...EMPTY_ENTRY,
    kicker: `Perícia · ${TRAIT_GROUP_LABELS[groupOf(SKILL_GROUPS, key)]}`,
    title: SKILL_LABELS[key],
    source: text.source,
    paragraphs: [text.body],
    dots: { value, max: SKILL_RANGE.max },
    levels: text.levels,
    currentLevel: value,
    facts: [
      ...(spec ? [{ label: 'Especialização', value: spec }] : []),
      { label: 'Especialidades sugeridas', value: text.specialties },
    ],
  };
}

function disciplineEntry(ficha: Ficha, slot: number): ReferenceEntry | null {
  const discipline = ficha.disciplines[slot];
  if (discipline === undefined) return null;
  const powers = discipline.powers.filter((power) => power.name !== '').map((power) => power.name);
  return {
    ...EMPTY_ENTRY,
    kicker: 'Disciplina',
    title: discipline.name || 'Disciplina sem nome',
    dots: { value: discipline.value, max: DISCIPLINE_RANGE.max },
    facts: powers.length > 0 ? [{ label: 'Poderes', value: powers.join(', ') }] : [],
  };
}

function powerEntry(ficha: Ficha, slot: number, powerIndex: number): ReferenceEntry | null {
  const discipline = ficha.disciplines[slot];
  const power = discipline?.powers[powerIndex];
  if (discipline === undefined || power === undefined) return null;
  return {
    ...EMPTY_ENTRY,
    kicker: `Poder · ${discipline.name || 'Disciplina sem nome'}`,
    title: power.name || 'Poder sem nome',
    facts: power.note ? [{ label: 'Nota', value: power.note }] : [],
  };
}

function identityEntry(ficha: Ficha, field: CatalogField): ReferenceEntry {
  const text = ficha.identity[field];
  const match = matchIdentity(field, text);
  const kicker = IDENTITY_FIELD_LABELS[field];
  if (match.matched && match.canonical !== null) {
    return { ...EMPTY_ENTRY, kicker, title: match.canonical, paragraphs: ['Reconhecido no catálogo.'] };
  }
  return {
    ...EMPTY_ENTRY,
    kicker,
    title: text.trim() || '—',
    paragraphs: [text.trim() === '' ? 'Campo vazio.' : `Sem correspondência para "${text.trim()}". Confira a grafia.`],
    facts: [{ label: 'Opções', value: match.options.join(', ') }],
  };
}

function trackerEntry(ficha: Ficha, tracker: TrackerKind): ReferenceEntry {
  const base = { ...EMPTY_ENTRY, kicker: 'Trilha', title: TRACKER_LABELS[tracker] };
  const { trackers, blood } = ficha;
  switch (tracker) {
    case 'health':
    case 'willpower': {
      const track = trackers[tracker];
      const summary = damageSummary(track);
      return {
        ...base,
        paragraphs: [
          'Os círculos definem o máximo (lápis para editar, disquete para salvar). Reduzir o máximo esconde o dano, sem apagá-lo.',
          'Clique numa caixa para alternar: vazia → superficial (barra) → agravada (cheia).',
        ],
        facts: [
          { label: 'Máximo', value: String(track.max) },
          { label: 'Superficial', value: String(summary.superficial) },
          { label: 'Agravado', value: String(summary.aggravated) },
        ],
      };
    }
    case 'hunger':
      return {
        ...base,
        paragraphs: ['Clique no N-ésimo quadrado para definir a Fome; clique no último cheio para reduzir um.'],
        facts: [{ label: 'Atual', value: `${trackers.hunger} de ${HUNGER_MAX}` }],
      };
    case 'humanity': {
      const summary = humanitySummary(trackers.humanity);
      return {
        ...base,
        paragraphs: ['Clique numa caixa para alternar: vazia → mancha (barra) → cheia.'],
        facts: [
          { label: 'Humanidade', value: String(summary.humanity) },
          { label: 'Manchas', value: String(summary.stains) },
        ],
      };
    }
    case 'bloodPotency':
      return {
        ...base,
        kicker: 'The Blood',
        dots: { value: blood.potency, max: BLOOD_POTENCY_RANGE.max },
        facts: [{ label: 'Atual', value: `${blood.potency} de ${BLOOD_POTENCY_RANGE.max}` }],
      };
  }
}

export function referenceFor(selection: Selection, ficha: Ficha): ReferenceEntry | null {
  switch (selection.kind) {
    case 'attribute':
      return attributeEntry(ficha, selection.key);
    case 'skill':
      return skillEntry(ficha, selection.key);
    case 'discipline':
      return disciplineEntry(ficha, selection.slot);
    case 'power':
      return powerEntry(ficha, selection.slot, selection.powerIndex);
    case 'identity':
      return identityEntry(ficha, selection.field);
    case 'tracker':
      return trackerEntry(ficha, selection.tracker);
  }
}

export function isSameSelection(a: Selection | null, b: Selection): boolean {
  return a !== null && JSON.stringify(a) === JSON.stringify(b);
}
