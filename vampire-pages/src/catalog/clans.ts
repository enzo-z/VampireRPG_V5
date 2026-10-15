import { bestMatch, type MatchCandidate } from './fuzzy.ts';
import type { ClanCatalog, ClanEntry } from './types.ts';

export interface ClanIndex {
  entries: readonly ClanEntry[];
  candidates: readonly MatchCandidate<ClanEntry>[];
}

export function indexClans(catalog: ClanCatalog): ClanIndex {
  return {
    entries: catalog.entries,
    candidates: catalog.entries.map((entry) => ({ item: entry, names: [entry.name, ...entry.aliases] })),
  };
}

/** The clan written on a sheet, tolerating accents, case, aliases ("Assamita") and small typos. */
export function findClan(index: ClanIndex, text: string): ClanEntry | null {
  if (text.trim() === '') return null;
  return bestMatch(text, index.candidates)?.item ?? null;
}
