import type { CatalogEntry, CatalogNote, DisciplineCatalog } from './types.ts';

// Matches what is written on a sheet (free text) against the discipline catalog.

export function normalizeName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

/** Portuguese names, older names and common misspellings → canonical discipline. */
const DISCIPLINE_ALIASES: Readonly<Record<string, string>> = {
  animalismo: 'Animalism',
  auspicios: 'Auspex',
  'feiticaria de sangue': 'Blood Sorcery',
  taumaturgia: 'Blood Sorcery',
  thaumaturgy: 'Blood Sorcery',
  rapidez: 'Celerity',
  celeridade: 'Celerity',
  dominacao: 'Dominate',
  fortitude: 'Fortitude',
  obsfucate: 'Obfuscate',
  ofuscacao: 'Obfuscate',
  obtenebration: 'Oblivion',
  obtenebracao: 'Oblivion',
  potencia: 'Potence',
  presenca: 'Presence',
  metamorfose: 'Protean',
  'alquimia de sangue fraco': 'Thin-blood Alchemy',
  'thin blood alchemy': 'Thin-blood Alchemy',
};

const KIND_ORDER: Readonly<Record<CatalogEntry['kind'], number>> = { power: 0, formula: 0, ritual: 1, ceremony: 2 };

export interface CatalogIndex {
  disciplines: readonly CatalogNote[];
  /** Normalized discipline name → entries of the discipline and of its ritual/ceremony notes. */
  entriesByDiscipline: ReadonlyMap<string, readonly CatalogEntry[]>;
  /** Normalized entry name → every entry with that name, across disciplines. */
  entriesByName: ReadonlyMap<string, readonly CatalogEntry[]>;
  disciplineOfEntry: ReadonlyMap<CatalogEntry, string>;
}

export function indexCatalog(catalog: DisciplineCatalog): CatalogIndex {
  const disciplines = catalog.notes.filter((note) => note.kind === 'disciplina');
  const entriesByDiscipline = new Map<string, CatalogEntry[]>();
  const entriesByName = new Map<string, CatalogEntry[]>();
  const disciplineOfEntry = new Map<CatalogEntry, string>();

  for (const note of catalog.notes) {
    const key = normalizeName(note.discipline);
    const list = entriesByDiscipline.get(key) ?? [];
    list.push(...note.entries);
    entriesByDiscipline.set(key, list);
    for (const entry of note.entries) {
      const nameKey = normalizeName(entry.name);
      entriesByName.set(nameKey, [...(entriesByName.get(nameKey) ?? []), entry]);
      disciplineOfEntry.set(entry, note.discipline);
    }
  }
  for (const list of entriesByDiscipline.values()) {
    list.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.level - b.level || a.name.localeCompare(b.name));
  }
  return { disciplines, entriesByDiscipline, entriesByName, disciplineOfEntry };
}

function canonicalKey(disciplineName: string): string {
  const key = normalizeName(disciplineName);
  const alias = DISCIPLINE_ALIASES[key];
  return alias === undefined ? key : normalizeName(alias);
}

export function findDiscipline(index: CatalogIndex, name: string): CatalogNote | null {
  const key = canonicalKey(name);
  return index.disciplines.find((note) => normalizeName(note.discipline) === key) ?? null;
}

export function entriesOf(index: CatalogIndex, disciplineName: string): readonly CatalogEntry[] {
  return index.entriesByDiscipline.get(canonicalKey(disciplineName)) ?? [];
}

/**
 * Finds a power, ritual, ceremony or formula by name inside the discipline.
 * Falls back to the whole catalog only when the name is unique, to avoid homonyms.
 */
export function findEntry(index: CatalogIndex, disciplineName: string, entryName: string): CatalogEntry | null {
  const key = normalizeName(entryName);
  if (key === '') return null;
  const inDiscipline = entriesOf(index, disciplineName).find((entry) => normalizeName(entry.name) === key);
  if (inDiscipline !== undefined) return inDiscipline;
  const anywhere = index.entriesByName.get(key) ?? [];
  return anywhere.length === 1 ? (anywhere[0] ?? null) : null;
}
