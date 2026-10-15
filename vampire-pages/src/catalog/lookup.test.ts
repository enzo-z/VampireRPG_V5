import { describe, expect, it } from 'vitest';
import { entriesOf, findDiscipline, findEntry, indexCatalog, normalizeName } from './lookup.ts';
import type { CatalogEntry, CatalogNote, DisciplineCatalog } from './types.ts';

function entry(name: string, level: number, kind: CatalogEntry['kind'] = 'power'): CatalogEntry {
  return { name, level, kind, source: null, fields: [], descriptionHtml: '', systemHtml: '' };
}

function note(noteName: string, kind: CatalogNote['kind'], discipline: string, entries: CatalogEntry[]): CatalogNote {
  return { noteName, kind, discipline, nicknames: [], category: null, masquerade: null, resonance: null, introHtml: '', sections: [], entries };
}

const catalog: DisciplineCatalog = {
  notes: [
    note('Blood Sorcery', 'disciplina', 'Blood Sorcery', [entry('Corrosive Vitae', 1), entry('A Taste for Blood', 1)]),
    note('Rituais de Blood Sorcery', 'rituais', 'Blood Sorcery', [entry('Blood Walk', 1, 'ritual')]),
    note('Obfuscate', 'disciplina', 'Obfuscate', [entry('Cloak of Shadows', 1), entry('Chimerstry', 2), entry('Shared Name', 1)]),
    note('Auspex', 'disciplina', 'Auspex', [entry('Sense the Unseen', 1), entry('Shared Name', 2)]),
  ],
};
const index = indexCatalog(catalog);

describe('normalizeName', () => {
  it('ignores accents, case, punctuation and a leading "the"', () => {
    expect(normalizeName("  The Forgetful   Mind ")).toBe('forgetful mind');
    expect(normalizeName('Cat’s Grace')).toBe(normalizeName("Cat's Grace"));
    expect(normalizeName('Ofuscação')).toBe('ofuscacao');
  });
});

describe('findDiscipline', () => {
  it('finds disciplines by canonical name, Portuguese name or misspelling', () => {
    expect(findDiscipline(index, 'obfuscate')?.noteName).toBe('Obfuscate');
    expect(findDiscipline(index, 'Ofuscação')?.noteName).toBe('Obfuscate');
    expect(findDiscipline(index, 'Obsfucate')?.noteName).toBe('Obfuscate');
    expect(findDiscipline(index, 'Feitiçaria de Sangue')?.noteName).toBe('Blood Sorcery');
  });

  it('never returns ritual notes as disciplines', () => {
    expect(findDiscipline(index, 'Rituais de Blood Sorcery')).toBeNull();
  });
});

describe('entriesOf', () => {
  it('includes the rituals of the discipline after its powers', () => {
    expect(entriesOf(index, 'Blood Sorcery').map((e) => e.name)).toEqual(['A Taste for Blood', 'Corrosive Vitae', 'Blood Walk']);
  });

  it('is empty for unknown disciplines', () => {
    expect(entriesOf(index, 'Vicissitude')).toEqual([]);
  });
});

describe('findEntry', () => {
  it('finds powers and rituals inside the discipline, ignoring case and "the"', () => {
    expect(findEntry(index, 'Blood Sorcery', 'blood walk')?.kind).toBe('ritual');
    expect(findEntry(index, 'Auspex', 'Sense The Unseen')?.name).toBe('Sense the Unseen');
  });

  it('finds amalgams listed under their discipline', () => {
    expect(findEntry(index, 'Obfuscate', 'Chimerstry')?.level).toBe(2);
  });

  it('falls back to the whole catalog only for unique names', () => {
    expect(findEntry(index, 'Celerity', 'Cloak of Shadows')?.name).toBe('Cloak of Shadows');
    expect(findEntry(index, 'Celerity', 'Shared Name')).toBeNull();
    expect(findEntry(index, 'Auspex', 'Shared Name')?.level).toBe(2);
  });

  it('returns null for blank or unknown names', () => {
    expect(findEntry(index, 'Auspex', '  ')).toBeNull();
    expect(findEntry(index, 'Auspex', 'Telepathy')).toBeNull();
  });
});

describe('tolerant matching', () => {
  it('finds powers with typos, missing accents or only the start of the name', () => {
    expect(findEntry(index, 'Obfuscate', 'cloak of shadow')?.name).toBe('Cloak of Shadows');
    expect(findEntry(index, 'Obfuscate', 'Chimerstr')?.name).toBe('Chimerstry');
    expect(findEntry(index, 'Blood Sorcery', 'blod walk')?.name).toBe('Blood Walk');
  });

  it('finds disciplines with typos', () => {
    expect(findDiscipline(index, 'Ofuscacao')?.noteName).toBe('Obfuscate');
    expect(findDiscipline(index, 'Obfuscat')?.noteName).toBe('Obfuscate');
  });
});
