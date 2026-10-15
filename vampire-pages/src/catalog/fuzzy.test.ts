import { describe, expect, it } from 'vitest';
import { bestMatch, editDistance, queryVariants, rankMatches, type MatchCandidate } from './fuzzy.ts';

const candidates: MatchCandidate<string>[] = [
  { item: 'Haven', names: ['Haven', 'Refúgio', 'Abrigo'] },
  { item: 'Contacts', names: ['Contacts', 'Contatos', 'Contact'] },
  { item: 'Allies', names: ['Allies', 'Aliados', 'Ally'] },
  { item: 'Infamous', names: ['Infamous', 'Infamy', 'Infâmia'] },
  { item: 'Beautiful', names: ['Beautiful', 'Looks: Beautiful', 'Beleza'] },
  { item: 'Sect War Veteran', names: ['Sect War Veteran', 'Loresheet: Sect War Veteran', 'Veterano da Guerra de Seitas'] },
  { item: 'Prey Exclusion', names: ['Prey Exclusion', 'Exclusão de Presa'] },
  { item: 'Resources', names: ['Resources', 'Recursos'] },
  { item: 'Mask', names: ['Mask', 'Máscara'] },
  { item: 'Mawla', names: ['Mawla', 'Mentor'] },
];
const match = (text: string) => bestMatch(text, candidates)?.item ?? null;

describe('queryVariants', () => {
  it('drops details in parentheses and reads what follows a colon', () => {
    expect(queryVariants('Allies (Augie Mendez)')).toEqual(['allies augie mendez', 'allies']);
    expect(queryVariants('Looks: Beautiful')).toEqual(['looks beautiful', 'beautiful']);
  });
});

describe('editDistance', () => {
  it('counts insertions, deletions, substitutions and swaps', () => {
    expect(editDistance('refugio', 'refujio')).toBe(1);
    expect(editDistance('haven', 'haevn')).toBe(1);
    expect(editDistance('contacts', 'contacs')).toBe(1);
  });
});

describe('bestMatch', () => {
  it('ignores accents and case (refugio → Refúgio)', () => {
    expect(match('refugio')).toBe('Haven');
    expect(match('MÁSCARA')).toBe('Mask');
  });

  it('matches canonical names, aliases and singular/plural', () => {
    expect(match('Contact')).toBe('Contacts');
    expect(match('contato')).toBe('Contacts');
    expect(match('Infamy')).toBe('Infamous');
    expect(match('Aliado')).toBe('Allies');
  });

  it('reads sheet entries with details and group prefixes', () => {
    expect(match('Allies (Augie Mendez)')).toBe('Allies');
    expect(match('Prey Exclusion (fora da cena do jazz)')).toBe('Prey Exclusion');
    expect(match('Looks: Beautiful')).toBe('Beautiful');
    expect(match('Loresheet: Sect War Veteran')).toBe('Sect War Veteran');
  });

  it('accepts the start of a name and small typos', () => {
    expect(match('refug')).toBe('Haven');
    expect(match('Refujio')).toBe('Haven');
    expect(match('Resorces')).toBe('Resources');
  });

  it('accepts words in any position', () => {
    expect(match('veterano guerra')).toBe('Sect War Veteran');
    expect(match('exclusão')).toBe('Prey Exclusion');
  });

  it('does not guess on short or unrelated text', () => {
    expect(match('ma')).toBeNull();
    expect(match('Telepathy')).toBeNull();
  });

  it('refuses ties between different items', () => {
    const tie: MatchCandidate<string>[] = [
      { item: 'A', names: ['Statue'] },
      { item: 'B', names: ['Stature'] },
    ];
    expect(bestMatch('Statu', tie)).toBeNull();
    expect(bestMatch('Statur', tie)?.item).toBe('B');
  });

  it('ranks the best candidates first', () => {
    expect(rankMatches('mas', candidates).map((m) => m.item)).toEqual([]);
    expect(rankMatches('Mask', candidates)[0]).toMatchObject({ item: 'Mask', score: 100, via: 'Mask' });
  });
});
