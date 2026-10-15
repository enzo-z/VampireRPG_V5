import { bestMatch, rankMatches, type MatchCandidate } from './fuzzy.ts';
import type { AdvantageCatalog, AdvantageCategory, AdvantageEntry } from './types.ts';

// Matches advantage/flaw text from a sheet ("Allies (Augie Mendez)", "refugio",
// "Infamy") against Advantages.md, by name, alias and tolerant spelling.

/** Column of the sheet: merits, backgrounds and loresheets vs. flaws. */
export type AdvantageSide = 'advantage' | 'flaw';

export const SIDE_CATEGORIES: Readonly<Record<AdvantageSide, readonly AdvantageCategory[]>> = {
  advantage: ['merit', 'background', 'loresheet'],
  flaw: ['flaw'],
};

export interface AdvantageIndex {
  entries: readonly AdvantageEntry[];
  candidates: Readonly<Record<AdvantageSide, readonly MatchCandidate<AdvantageEntry>[]>>;
}

export function indexAdvantages(catalog: AdvantageCatalog): AdvantageIndex {
  const candidatesFor = (side: AdvantageSide) =>
    catalog.entries
      .filter((entry) => SIDE_CATEGORIES[side].includes(entry.category))
      .map((entry) => ({ item: entry, names: [entry.name, ...entry.aliases] }));
  return { entries: catalog.entries, candidates: { advantage: candidatesFor('advantage'), flaw: candidatesFor('flaw') } };
}

export function findAdvantage(index: AdvantageIndex, side: AdvantageSide, text: string): AdvantageEntry | null {
  if (text.trim() === '') return null;
  return bestMatch(text, index.candidates[side])?.item ?? null;
}

/** Closest entries for text that did not match, best first. */
export function suggestAdvantages(index: AdvantageIndex, side: AdvantageSide, text: string, limit = 5): AdvantageEntry[] {
  return rankMatches(text, index.candidates[side]).slice(0, limit).map((match) => match.item);
}

export function sideOf(category: AdvantageCategory): AdvantageSide {
  return category === 'flaw' ? 'flaw' : 'advantage';
}
