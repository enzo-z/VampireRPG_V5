import { bestMatch, type MatchCandidate } from './fuzzy.ts';
import type { PredatorTypeCatalog, PredatorTypeEntry } from './types.ts';

export interface PredatorTypeIndex {
  entries: readonly PredatorTypeEntry[];
  candidates: readonly MatchCandidate<PredatorTypeEntry>[];
}

export function indexPredatorTypes(catalog: PredatorTypeCatalog): PredatorTypeIndex {
  return {
    entries: catalog.entries,
    candidates: catalog.entries.map((entry) => ({ item: entry, names: [...entry.names, entry.title] })),
  };
}

/** The predator type written on a sheet, tolerating accents, case, plural and small typos. */
export function findPredatorType(index: PredatorTypeIndex, text: string): PredatorTypeEntry | null {
  if (text.trim() === '') return null;
  return bestMatch(text, index.candidates)?.item ?? null;
}
