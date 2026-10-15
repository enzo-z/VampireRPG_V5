import { findAdvantage, sideOf, suggestAdvantages, type AdvantageIndex } from '../catalog/advantages.ts';
import { generationEntry, potencyLevelEntry, potencyRow } from '../catalog/blood.ts';
import { entriesOf, findDiscipline, findEntry, type CatalogIndex } from '../catalog/lookup.ts';
import { findPredatorType, type PredatorTypeIndex } from '../catalog/predatorTypes.ts';
import type { AdvantageCategory, BloodCatalog, CatalogEntry } from '../catalog/types.ts';
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
  | { kind: 'tracker'; tracker: TrackerKind }
  | { kind: 'advantage'; index: number };

/** Catalogs built from the vault notes. */
export interface ReferenceCatalogs {
  disciplines: CatalogIndex;
  advantages: AdvantageIndex;
  predatorTypes: PredatorTypeIndex;
  blood: BloodCatalog;
}

/** A labeled value; `html` comes pre-rendered from the vault notes. */
export type ReferenceFact = { label: string; value: string } | { label: string; html: string };

/** Pre-rendered HTML from the vault notes, optionally under a title. */
export interface ReferenceBlock {
  title: string | null;
  html: string;
}

export interface CatalogLevel {
  level: number;
  names: readonly string[];
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
  blocks: readonly ReferenceBlock[];
  /** Powers of a discipline grouped by level, from the catalog. */
  catalogLevels: readonly CatalogLevel[] | null;
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
  blocks: [],
  catalogLevels: null,
};

const ADVANTAGE_CATEGORY_LABELS: Readonly<Record<AdvantageCategory, string>> = {
  merit: 'Merit',
  background: 'Background',
  flaw: 'Flaw',
  loresheet: 'Loresheet',
};

const ENTRY_KIND_LABELS: Readonly<Record<CatalogEntry['kind'], string>> = {
  power: 'Poder',
  ritual: 'Ritual',
  ceremony: 'Cerimônia',
  formula: 'Fórmula',
};

function htmlBlocks(...blocks: ReferenceBlock[]): ReferenceBlock[] {
  return blocks.filter((block) => block.html !== '');
}

function groupByLevel(entries: readonly CatalogEntry[]): CatalogLevel[] {
  const levels = [...new Set(entries.map((entry) => entry.level))].sort((a, b) => a - b);
  return levels.map((level) => ({ level, names: entries.filter((entry) => entry.level === level).map((entry) => entry.name) }));
}

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

function disciplineEntry(ficha: Ficha, slot: number, catalog: CatalogIndex): ReferenceEntry | null {
  const discipline = ficha.disciplines[slot];
  if (discipline === undefined) return null;
  const onSheet = discipline.powers.filter((power) => power.name !== '').map((power) => power.name);
  const sheetFact: ReferenceFact[] = onSheet.length > 0 ? [{ label: 'Na ficha', value: onSheet.join(', ') }] : [];
  const dots = { value: discipline.value, max: DISCIPLINE_RANGE.max };
  const note = discipline.name === '' ? null : findDiscipline(catalog, discipline.name);

  if (note === null) {
    return {
      ...EMPTY_ENTRY,
      kicker: 'Disciplina',
      title: discipline.name || 'Disciplina sem nome',
      dots,
      paragraphs: discipline.name === '' ? [] : [`"${discipline.name}" não foi encontrada no catálogo de disciplinas.`],
      facts: [...sheetFact, { label: 'Disciplinas no catálogo', value: catalog.disciplines.map((d) => d.discipline).join(', ') }],
    };
  }
  return {
    ...EMPTY_ENTRY,
    kicker: note.category ? `Disciplina · ${note.category}` : 'Disciplina',
    title: note.discipline,
    dots,
    facts: [
      ...sheetFact,
      ...(note.masquerade ? [{ label: 'Ameaça à Máscara', value: note.masquerade }] : []),
      ...(note.resonance ? [{ label: 'Resonance', value: note.resonance }] : []),
      ...(note.nicknames.length > 0 ? [{ label: 'Apelidos', value: note.nicknames.join(', ') }] : []),
    ],
    blocks: htmlBlocks({ title: null, html: note.introHtml }, ...note.sections),
    catalogLevels: groupByLevel(entriesOf(catalog, note.discipline)),
  };
}

function powerEntry(ficha: Ficha, slot: number, powerIndex: number, catalog: CatalogIndex): ReferenceEntry | null {
  const discipline = ficha.disciplines[slot];
  const power = discipline?.powers[powerIndex];
  if (discipline === undefined || power === undefined) return null;
  const disciplineName = discipline.name || 'Disciplina sem nome';
  const noteFact: ReferenceFact[] = power.note ? [{ label: 'Nota na ficha', value: power.note }] : [];
  const entry = findEntry(catalog, discipline.name, power.name);

  if (entry === null) {
    const available = entriesOf(catalog, discipline.name).filter((candidate) => candidate.level <= Math.max(discipline.value, 1));
    return {
      ...EMPTY_ENTRY,
      kicker: `Poder · ${disciplineName}`,
      title: power.name || 'Poder sem nome',
      paragraphs: power.name === '' ? [] : [`"${power.name}" não foi encontrado no catálogo de ${disciplineName}.`],
      facts: [
        ...noteFact,
        ...(available.length > 0 ? [{ label: `Opções até o nível ${Math.max(discipline.value, 1)}`, value: available.map((c) => c.name).join(', ') }] : []),
      ],
    };
  }
  return {
    ...EMPTY_ENTRY,
    kicker: `${ENTRY_KIND_LABELS[entry.kind]} · ${catalog.disciplineOfEntry.get(entry) ?? disciplineName}`,
    title: entry.name,
    source: entry.source,
    dots: { value: entry.level, max: DISCIPLINE_RANGE.max },
    facts: [...entry.fields.map((field) => ({ label: field.label, html: field.html })), ...noteFact],
    blocks: htmlBlocks({ title: null, html: entry.descriptionHtml }, { title: 'Sistema', html: entry.systemHtml }),
  };
}

function advantageEntry(ficha: Ficha, index: number, catalog: AdvantageIndex): ReferenceEntry | null {
  const item = ficha.advantages[index];
  if (item === undefined) return null;
  const side = sideOf(item.category);
  const sideLabel = side === 'flaw' ? 'Defeito' : 'Vantagem';
  const noteFact: ReferenceFact[] = item.note ? [{ label: 'Na ficha', value: item.note }] : [];
  const entry = findAdvantage(catalog, side, item.name);

  if (entry === null) {
    const suggestions = item.name.trim() === '' ? [] : suggestAdvantages(catalog, side, item.name);
    return {
      ...EMPTY_ENTRY,
      kicker: sideLabel,
      title: item.name || `${sideLabel} sem nome`,
      dots: { value: item.level, max: Math.max(5, item.level) },
      paragraphs: item.name === '' ? [] : [`"${item.name}" não foi encontrado em Advantages.md.`],
      facts: [...noteFact, ...(suggestions.length > 0 ? [{ label: 'Parecidos', value: suggestions.map((s) => s.name).join(', ') }] : [])],
    };
  }
  const kicker = [ADVANTAGE_CATEGORY_LABELS[entry.category], entry.group].filter((part) => part !== null).join(' · ');
  return {
    ...EMPTY_ENTRY,
    kicker,
    title: entry.name,
    source: entry.source,
    dots: { value: item.level, max: Math.max(entry.points.max, item.level) },
    facts: [
      ...noteFact,
      { label: 'Pontos', value: entry.pointsLabel },
      ...entry.fields.map((field) => ({ label: field.label, html: field.html })),
    ],
    blocks: htmlBlocks({ title: null, html: entry.descriptionHtml }, { title: 'Sistema', html: entry.systemHtml }),
  };
}

/** Whether an identity field reads as a known value (names list or, for predator types, the vault note). */
export function isIdentityRecognized(field: CatalogField, text: string, predatorTypes: PredatorTypeIndex): boolean {
  return matchIdentity(field, text).matched || (field === 'predatorType' && findPredatorType(predatorTypes, text) !== null);
}

function predatorTypeEntry(text: string, predatorTypes: PredatorTypeIndex): ReferenceEntry | null {
  const match = matchIdentity('predatorType', text);
  const rules = findPredatorType(predatorTypes, match.canonical ?? text);
  const kicker = IDENTITY_FIELD_LABELS.predatorType;
  if (rules !== null) {
    const readAs = match.matched ? [] : [`"${text.trim()}" lido como ${rules.title}.`];
    return { ...EMPTY_ENTRY, kicker, title: rules.title, source: rules.source, paragraphs: readAs, blocks: htmlBlocks({ title: null, html: rules.html }) };
  }
  if (match.matched && match.canonical !== null) {
    return { ...EMPTY_ENTRY, kicker, title: match.canonical, paragraphs: ['Reconhecido, mas ainda sem regras em Predator Type.md.'] };
  }
  return null;
}

function generationReference(ficha: Ficha, blood: BloodCatalog): ReferenceEntry | null {
  const digits = /\d+/.exec(ficha.identity.generation);
  const match = matchIdentity('generation', ficha.identity.generation);
  if (digits === null || !match.matched || match.canonical === null) return null;
  const section = generationEntry(blood, Number(digits[0]));
  return {
    ...EMPTY_ENTRY,
    kicker: IDENTITY_FIELD_LABELS.generation,
    title: match.canonical,
    facts: [{ label: 'Blood Potency na ficha', value: `${ficha.blood.potency} de ${BLOOD_POTENCY_RANGE.max}` }],
    blocks: section === null ? [] : htmlBlocks({ title: section.title, html: section.html }),
  };
}

function identityEntry(ficha: Ficha, field: CatalogField, catalogs: ReferenceCatalogs): ReferenceEntry {
  const text = ficha.identity[field];
  if (field === 'predatorType' && text.trim() !== '') {
    const entry = predatorTypeEntry(text, catalogs.predatorTypes);
    if (entry !== null) return entry;
  }
  if (field === 'generation') {
    const entry = generationReference(ficha, catalogs.blood);
    if (entry !== null) return entry;
  }
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

/** Labels of the Blood Potency table columns, in note order. */
const POTENCY_COLUMNS = [
  ['surge', 'Blood Surge'],
  ['mend', 'Mend (por Rouse Check)'],
  ['disciplineBonus', 'Bônus de Disciplina'],
  ['rouseReRoll', 'Re-roll do Rouse Check'],
  ['baneSeverity', 'Bane Severity'],
  ['feeding', 'Alimentação'],
] as const;

function bloodPotencyFacts(potency: number, blood: BloodCatalog): { facts: ReferenceFact[]; blocks: ReferenceBlock[] } {
  const row = potencyRow(blood, potency);
  const level = potencyLevelEntry(blood, potency);
  const levelTitle = level === null ? null : level.orMore && level.level !== potency ? `Blood Potency ${level.level} e Maior` : null;
  return {
    facts: row === null ? [] : POTENCY_COLUMNS.map(([key, label]) => ({ label, value: row[key] })),
    blocks: level === null ? [] : htmlBlocks({ title: levelTitle, html: level.html }),
  };
}

function trackerEntry(ficha: Ficha, tracker: TrackerKind, bloodCatalog: BloodCatalog): ReferenceEntry {
  const base = { ...EMPTY_ENTRY, kicker: 'Trilha', title: TRACKER_LABELS[tracker] };
  const { trackers } = ficha;
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
        title: `Blood Potency ${ficha.blood.potency}`,
        dots: { value: ficha.blood.potency, max: BLOOD_POTENCY_RANGE.max },
        ...bloodPotencyFacts(ficha.blood.potency, bloodCatalog),
      };
  }
}

export function referenceFor(selection: Selection, ficha: Ficha, catalogs: ReferenceCatalogs): ReferenceEntry | null {
  switch (selection.kind) {
    case 'attribute':
      return attributeEntry(ficha, selection.key);
    case 'skill':
      return skillEntry(ficha, selection.key);
    case 'discipline':
      return disciplineEntry(ficha, selection.slot, catalogs.disciplines);
    case 'power':
      return powerEntry(ficha, selection.slot, selection.powerIndex, catalogs.disciplines);
    case 'identity':
      return identityEntry(ficha, selection.field, catalogs);
    case 'tracker':
      return trackerEntry(ficha, selection.tracker, catalogs.blood);
    case 'advantage':
      return advantageEntry(ficha, selection.index, catalogs.advantages);
  }
}

export function isSameSelection(a: Selection | null, b: Selection): boolean {
  return a !== null && JSON.stringify(a) === JSON.stringify(b);
}
