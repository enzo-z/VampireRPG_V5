// Tolerant matching of what is written on a sheet against catalog names and
// their aliases: ignores accents, case and punctuation, then tries, in order of
// confidence, exact names, singular/plural, prefixes, small typos and words.

export interface MatchCandidate<T> {
  item: T;
  /** Canonical name first, then aliases. */
  names: readonly string[];
}

export interface Match<T> {
  item: T;
  score: number;
  /** The name or alias that matched. */
  via: string;
}

export const MATCH_SCORES = {
  exact: 100,
  singular: 95,
  prefix: 85,
  typo: 75,
  words: 65,
} as const;

const MIN_PREFIX_LENGTH = 4;
const MIN_TYPO_LENGTH = 5;

export function normalizeName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^the /, '');
}

const singularWord = (word: string) => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word);
const singular = (text: string) => text.split(' ').map(singularWord).join(' ');

/** Ways a sheet entry may be written: "Allies (Augie Mendez)", "Looks: Beautiful", "Loresheet: Sect War Veteran". */
export function queryVariants(raw: string): string[] {
  const withoutDetail = raw.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const afterColon = withoutDetail.includes(':') ? withoutDetail.slice(withoutDetail.indexOf(':') + 1) : '';
  return [...new Set([raw, withoutDetail, afterColon].map(normalizeName).filter((variant) => variant !== ''))];
}

/** Damerau-Levenshtein distance (optimal string alignment), capped for speed. */
export function editDistance(a: string, b: string, cap = 3): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  const at = (i: number, j: number) => d[i]?.[j] ?? Number.POSITIVE_INFINITY;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, at(i - 2, j - 2) + 1);
      const row = d[i];
      if (row !== undefined) row[j] = value;
    }
  }
  return at(a.length, b.length);
}

function typoLimit(length: number): number {
  if (length < MIN_TYPO_LENGTH) return 0;
  return length < 8 ? 1 : 2;
}

function scoreName(query: string, name: string): number {
  if (query === name) return MATCH_SCORES.exact;
  const q = singular(query);
  const n = singular(name);
  if (q === n) return MATCH_SCORES.singular;
  if (q.length >= MIN_PREFIX_LENGTH && n.startsWith(q)) return MATCH_SCORES.prefix;
  const limit = typoLimit(Math.min(q.length, n.length));
  if (limit > 0 && editDistance(q, n, limit) <= limit) return MATCH_SCORES.typo;
  const queryWords = q.split(' ').filter((word) => word.length >= 3);
  const nameWords = n.split(' ');
  if (queryWords.length > 0 && queryWords.every((word) => nameWords.some((candidate) => candidate === word || (word.length >= MIN_PREFIX_LENGTH && candidate.startsWith(word))))) {
    return MATCH_SCORES.words;
  }
  return 0;
}

/** Scores every candidate; returns them best first (score > 0 only). */
export function rankMatches<T>(raw: string, candidates: readonly MatchCandidate<T>[]): Match<T>[] {
  const variants = queryVariants(raw);
  const ranked: Match<T>[] = [];
  for (const candidate of candidates) {
    let best: Match<T> | null = null;
    for (const name of candidate.names) {
      const normalized = normalizeName(name);
      for (const variant of variants) {
        const score = scoreName(variant, normalized);
        if (score > (best?.score ?? 0)) best = { item: candidate.item, score, via: name };
      }
    }
    if (best !== null) ranked.push(best);
  }
  return ranked.sort((a, b) => b.score - a.score);
}

/** Best match, or null when nothing matches or two different items tie for the top score. */
export function bestMatch<T>(raw: string, candidates: readonly MatchCandidate<T>[]): Match<T> | null {
  const [first, second] = rankMatches(raw, candidates);
  if (first === undefined) return null;
  if (second !== undefined && second.score === first.score && second.item !== first.item) return null;
  return first;
}
