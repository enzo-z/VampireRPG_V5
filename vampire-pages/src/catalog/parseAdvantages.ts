import { normalizeLabel, parseEntryBlock, parseFrontmatter, type ParsedField } from './parseNote.ts';
import type { AdvantageCategory, AdvantagePoints } from './types.ts';

// Pure parser for Advantages.md:
//   frontmatter (publicar: true, tipo: vantagens)
//   # Merits | # Backgrounds | # Flaws | # Loresheets
//   ## Group (optional), ### Item with Fonte, Pontos, Apelidos and Sistema.

export interface ParsedAdvantage {
  name: string;
  category: AdvantageCategory;
  group: string | null;
  points: AdvantagePoints;
  pointsLabel: string;
  aliases: string[];
  source: string | null;
  fields: ParsedField[];
  description: string;
  system: string;
}

export type AdvantagesParseResult =
  | { status: 'parsed'; entries: ParsedAdvantage[]; warnings: string[] }
  | { status: 'unpublished' }
  | { status: 'invalid'; errors: string[] };

const CATEGORIES: Readonly<Record<string, AdvantageCategory>> = {
  merits: 'merit',
  meritos: 'merit',
  backgrounds: 'background',
  antecedentes: 'background',
  flaws: 'flaw',
  defeitos: 'flaw',
  loresheets: 'loresheet',
};

const DEFAULT_POINTS: AdvantagePoints = { min: 1, max: 5 };

/** "••" → 2..2, "• a •••" → 1..3, "• por idioma" → 1..5 (repeatable). */
export function parsePoints(label: string): AdvantagePoints | null {
  const groups = label.match(/[•●]+/g) ?? [];
  const first = groups[0]?.length;
  if (first === undefined) return null;
  const second = groups[1]?.length;
  if (/\ba\b|–|-/.test(label) && second !== undefined) return { min: Math.min(first, second), max: Math.max(first, second) };
  if (/\bpor\b/i.test(label)) return { min: first, max: DEFAULT_POINTS.max };
  return { min: first, max: first };
}

export function parseAdvantagesNote(noteName: string, text: string): AdvantagesParseResult {
  const parsed = parseFrontmatter(text.replace(/^\uFEFF/, ''));
  if (parsed === null) return { status: 'invalid', errors: [`${noteName}: sem frontmatter.`] };
  if (parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };
  if (parsed.fields['tipo'] !== 'vantagens') return { status: 'invalid', errors: [`${noteName}: "tipo" deve ser vantagens.`] };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const entries: ParsedAdvantage[] = [];
  let category: AdvantageCategory | null = null;
  let group: string | null = null;
  let current: { name: string; category: AdvantageCategory; group: string | null; lines: string[] } | null = null;

  const flush = () => {
    if (current === null) return;
    const label = `"${current.name}"`;
    const block = parseEntryBlock(label, current.lines, warn);
    const pointsField = block.fields.find((field) => field.label === 'Pontos');
    const aliasesField = block.fields.find((field) => field.label === 'Apelidos');
    const points = pointsField ? parsePoints(pointsField.markdown) : null;
    if (points === null) warn(`${label} sem Pontos legíveis.`);
    entries.push({
      name: current.name,
      category: current.category,
      group: current.group,
      points: points ?? DEFAULT_POINTS,
      pointsLabel: pointsField?.markdown ?? '',
      aliases: (aliasesField?.markdown ?? '').split(',').map((alias) => alias.trim()).filter((alias) => alias !== ''),
      source: block.source,
      fields: block.fields.filter((field) => field.label !== 'Pontos' && field.label !== 'Apelidos'),
      description: block.description,
      system: block.system,
    });
    current = null;
  };

  for (const line of parsed.body.split(/\r?\n/)) {
    const heading = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (heading === null) {
      current?.lines.push(line);
      continue;
    }
    flush();
    const [, hashes = '', title = ''] = heading;
    if (hashes === '#') {
      category = CATEGORIES[normalizeLabel(title)] ?? null;
      group = null;
      if (category === null) warn(`categoria desconhecida "# ${title}"; os itens dela são ignorados.`);
    } else if (hashes === '##') {
      group = title;
    } else if (category !== null) {
      current = { name: title, category, group, lines: [] };
    }
  }
  flush();

  const seen = new Set<string>();
  for (const entry of entries) {
    const key = normalizeLabel(entry.name);
    if (seen.has(key)) warn(`"${entry.name}" aparece mais de uma vez.`);
    seen.add(key);
  }
  return { status: 'parsed', entries, warnings };
}
