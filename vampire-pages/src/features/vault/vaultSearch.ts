import type { VaultNote } from '../../catalog/types.ts';

// Full-text search over the Vault: accent- and case-insensitive, every word of
// the query must appear in the section (title or text). Sections whose title
// matches come first; the rest keep the Vault's reading order.

export interface VaultSnippet {
  before: string;
  match: string;
  after: string;
}

export interface VaultSearchHit {
  slug: string;
  noteTitle: string;
  /** Null for the text before the note's first heading. */
  headingId: string | null;
  sectionTitle: string;
  snippet: VaultSnippet;
}

const MIN_QUERY_LENGTH = 2;
const SNIPPET_RADIUS = 70;

interface FoldedText {
  folded: string;
  /** folded[i] came from original[map[i]]. */
  map: number[];
}

/** Lower case without accents, keeping a map back to the original positions. */
export function foldText(text: string): FoldedText {
  let folded = '';
  const map: number[] = [];
  let index = 0;
  for (const character of text) {
    const simple = character.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    folded += simple;
    for (let i = 0; i < simple.length; i += 1) map.push(index);
    index += character.length;
  }
  return { folded, map };
}

export function queryWords(query: string): string[] {
  const words = foldText(query).folded.split(/\s+/).filter((word) => word !== '');
  return words.join('').length < MIN_QUERY_LENGTH ? [] : words;
}

/** Text around the first occurrence of `word` (folded), cut at word boundaries. */
export function snippetAround(text: string, word: string): VaultSnippet {
  const { folded, map } = foldText(text);
  const at = word === '' ? -1 : folded.indexOf(word);
  if (at === -1) {
    const cut = text.length > SNIPPET_RADIUS * 2 ? `${text.slice(0, SNIPPET_RADIUS * 2).replace(/\s+\S*$/, '')}…` : text;
    return { before: '', match: '', after: cut };
  }
  const start = map[at] ?? 0;
  const lastFolded = at + word.length - 1;
  const end = (map[lastFolded] ?? start) + 1;
  const from = Math.max(0, start - SNIPPET_RADIUS);
  const to = Math.min(text.length, end + SNIPPET_RADIUS);
  const before = text.slice(from, start).replace(from > 0 ? /^\S*\s/ : /^/, '');
  const after = text.slice(end, to).replace(to < text.length ? /\s\S*$/ : /$/, '');
  return {
    before: `${from > 0 ? '…' : ''}${before}`,
    match: text.slice(start, end),
    after: `${after}${to < text.length ? '…' : ''}`,
  };
}

export function searchVault(notes: readonly VaultNote[], query: string, limit = 40): VaultSearchHit[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  const longest = words.reduce((best, word) => (word.length > best.length ? word : best), '');

  const ranked: { rank: number; hit: VaultSearchHit }[] = [];
  for (const note of notes) {
    const noteTitle = foldText(note.title).folded;
    for (const section of note.sections) {
      const title = foldText(section.title).folded;
      const text = foldText(section.text).folded;
      const haystack = `${noteTitle} ${title} ${text}`;
      if (!words.every((word) => haystack.includes(word))) continue;
      const rank = words.every((word) => title.includes(word)) ? 0 : 1;
      ranked.push({
        rank,
        hit: {
          slug: note.slug,
          noteTitle: note.title,
          headingId: section.headingId,
          sectionTitle: section.title,
          snippet: snippetAround(section.text, longest),
        },
      });
    }
  }
  // Array.prototype.sort is stable: equal ranks keep the Vault's reading order.
  return ranked.sort((a, b) => a.rank - b.rank).slice(0, limit).map((entry) => entry.hit);
}
