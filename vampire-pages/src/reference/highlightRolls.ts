// Marks the mechanics a reader scans for in reference text: dice pools
// ("Resolve + Awareness", "Manipulation + Dominate vs Composure + Wits"),
// difficulties ("Dificuldade 3", "Difficulty (Nível do Ritual + 1)") and Rouse
// Checks. Works on rendered HTML: only text between tags is touched, never
// inside <code>/<pre>, so the vault markup stays intact.

import { ATTRIBUTE_LABELS, SKILL_LABELS } from '../domain/traits.ts';

export type RollKind = 'pool' | 'difficulty' | 'rouse';

/** Names that make "A + B" a dice pool (at least one term must be one of these). */
const TRAIT_NAMES: readonly string[] = [
  ...Object.values(ATTRIBUTE_LABELS),
  ...Object.values(SKILL_LABELS),
  'Animal Ken', 'Occult',
  'Animalism', 'Auspex', 'Blood Sorcery', 'Celerity', 'Dominate', 'Fortitude', 'Obfuscate', 'Oblivion', 'Potence',
  'Presence', 'Protean', 'Thin-blood Alchemy', 'Alchemy',
  'Blood Potency', 'Humanity', 'Humanidade', 'Willpower',
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KNOWN = [...new Set(TRAIT_NAMES)].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|');
const KNOWN_ONLY = new RegExp(`(?<!\\p{L})(?:${KNOWN})(?!\\p{L})`, 'u');

// A term is a known trait or any capitalized word (so a misspelled trait next to a known one still counts).
const TERM = `(?:${KNOWN}|\\p{Lu}[\\p{L}-]*)(?!\\p{L})`;
const POOL = `${TERM}(?:\\s*\\+\\s*${TERM})+`;
// After "vs"/"contra" only another pool or a known trait ("vs Willpower"), never a plain word.
const VERSUS = `(?:\\s+(?:vs\\.?|versus|contra)\\s+(?:${POOL}|(?:${KNOWN})(?!\\p{L})))?`;
const DIFFICULTY = '(?:[Dd]ifficulty|[Dd]ificuldade|[Dd]if\\.)(?:\\s+(?:de|igual a))?\\s+(?:\\d+|\\([^()]*\\d[^()]*\\))';
const ROUSE = '[Rr]ouse [Cc]hecks?';

// Case-sensitive on purpose: a pool term must start with a capital letter.
const ROLLS = new RegExp(`(?<!\\p{L})(?:(?<pool>${POOL}${VERSUS})|(?<difficulty>${DIFFICULTY})|(?<rouse>${ROUSE}))`, 'gu');

const KIND_TITLES: Readonly<Record<RollKind, string>> = {
  pool: 'Teste',
  difficulty: 'Dificuldade',
  rouse: 'Rouse Check',
};

function mark(kind: RollKind, text: string): string {
  return `<mark class="roll" data-roll="${kind}" title="${KIND_TITLES[kind]}">${text}</mark>`;
}

function markText(text: string): string {
  return text.replace(ROLLS, (match: string, ...args: unknown[]) => {
    const groups = args.at(-1) as Partial<Record<RollKind, string>>;
    if (groups.pool !== undefined) return KNOWN_ONLY.test(match) ? mark('pool', match) : match;
    if (groups.difficulty !== undefined) return mark('difficulty', match);
    return mark('rouse', match);
  });
}

const SKIPPED_TAGS = /^<\/?(code|pre)\b/i;

/** Highlights rolls in rendered (already escaped) HTML. */
export function highlightRolls(html: string): string {
  let skipDepth = 0;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (SKIPPED_TAGS.test(part)) skipDepth += part.startsWith('</') ? -1 : 1;
        return part;
      }
      return skipDepth > 0 ? part : markText(part);
    })
    .join('');
}

const ESCAPES: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes plain text (e.g. what a player wrote) and highlights its rolls. */
export function highlightPlainText(text: string): string {
  return highlightRolls(text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char));
}
