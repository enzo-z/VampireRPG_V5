import type { CatalogEntryKind, CatalogNoteKind } from './types.ts';

// Pure parser for one discipline note (format agreed on 2026-10-15):
//   frontmatter (publicar, tipo, disciplina, apelidos, categoria, ameaca_mascara, resonance)
//   # Discipline
//   intro, then "## Section" blocks, then "## Nível N" with "### Entry" blocks.
// Each entry: optional description, then a blockquote with "- **Label**: value"
// fields; everything after "- **Sistema**:" is the system text.
// Returns markdown; rendering to HTML happens in the Vite plugin.

export interface ParsedField {
  label: string;
  markdown: string;
}

export interface ParsedEntry {
  name: string;
  level: number;
  kind: CatalogEntryKind;
  source: string | null;
  fields: ParsedField[];
  description: string;
  system: string;
}

export interface ParsedNote {
  noteName: string;
  kind: CatalogNoteKind;
  discipline: string;
  nicknames: string[];
  category: string | null;
  masquerade: string | null;
  resonance: string | null;
  intro: string;
  sections: { title: string; markdown: string }[];
  entries: ParsedEntry[];
}

export type ParseResult =
  | { status: 'parsed'; note: ParsedNote; warnings: string[] }
  | { status: 'unpublished' }
  | { status: 'invalid'; errors: string[] };

const NOTE_KINDS: readonly CatalogNoteKind[] = ['disciplina', 'rituais', 'cerimonias'];

/** Canonical field labels; keys are normalized labels found in the notes. */
const FIELD_LABELS: Readonly<Record<string, string>> = {
  fonte: 'Fonte',
  custo: 'Custo',
  'dice pool': 'Dice Pool',
  'dice pools': 'Dice Pool',
  duracao: 'Duração',
  'pre requisito': 'Pré-requisito',
  amalgama: 'Amálgama',
  'casting time': 'Casting Time',
  ingredientes: 'Ingredientes',
  'teste de ritual': 'Teste de Ritual',
  'teste de cerimonia': 'Teste de Cerimônia',
  teste: 'Teste',
  processo: 'Processo',
  sistema: 'Sistema',
  system: 'Sistema',
  'system regras': 'Sistema',
  pontos: 'Pontos',
  apelidos: 'Apelidos',
};

const META_BULLET = /^- (\*\*)?(Nicknames|Tipo|Ameaça|Masquerade Threat|Blood Resonance|\[\[Resonance\]\])/;
const FIELD_BULLET = /^ ?- +\*\*(.+?)\*\*(.*)$/;

export function normalizeLabel(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// ---------- Frontmatter ----------

export function parseFrontmatter(text: string): { fields: Record<string, string | string[]>; body: string } | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (match === null) return null;
  const fields: Record<string, string | string[]> = {};
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (pair === null) continue;
    const [, key = '', raw = ''] = pair;
    const value = raw.trim();
    fields[key] = value.startsWith('[') && value.endsWith(']') ? splitList(value.slice(1, -1)) : unquote(value);
  }
  return { fields, body: text.slice(match[0].length) };
}

function unquote(value: string): string {
  return /^".*"$/.test(value) || /^'.*'$/.test(value) ? value.slice(1, -1) : value;
}

function splitList(inner: string): string[] {
  return (inner.match(/"[^"]*"|'[^']*'|[^,]+/g) ?? []).map((item) => unquote(item.trim())).filter((item) => item !== '');
}

// ---------- Helpers ----------

function trimBlank(lines: readonly string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && ['', '---'].includes((lines[start] ?? '').trim())) start += 1;
  while (end > start && ['', '---'].includes((lines[end - 1] ?? '').trim())) end -= 1;
  return lines.slice(start, end);
}

/** Expands tabs and removes the common indentation, so nested bullets keep their relative depth. */
export function dedent(lines: readonly string[]): string {
  const expanded = lines.map((line) => line.replace(/\t/g, '    ').replace(/\s+$/, ''));
  const indents = expanded.filter((line) => line.trim() !== '').map((line) => /^ */.exec(line)?.[0].length ?? 0);
  const common = indents.length === 0 ? 0 : Math.min(...indents);
  return trimBlank(expanded.map((line) => line.slice(common))).join('\n');
}

/** Removes the blockquote marker (">" plus surrounding spaces of the marker itself). */
function unquoteLine(line: string): string {
  return line.replace(/^\s*>/, '');
}

function fieldValue(rest: string): string {
  return rest.replace(/^\s*(\([^)]*\))?\s*:?\s*/, '').trim();
}

// ---------- Entries ----------

export interface ParsedBlock {
  source: string | null;
  /** Every field except Fonte, in note order. */
  fields: ParsedField[];
  description: string;
  system: string;
}

/**
 * Parses the lines under a "### Item" heading: optional description, then a
 * blockquote with "- **Label**: value" fields; "- **Sistema**:" starts the system text.
 * `label` identifies the item in warnings, e.g. `"Cat's Grace" (nível 1)`.
 */
export function parseEntryBlock(label: string, rawLines: readonly string[], warn: (message: string) => void): ParsedBlock {
  const lines = rawLines.filter((line) => line.trim() !== '---');
  const quoted = lines.map((line) => line.trimStart().startsWith('>'));
  const firstQuote = quoted.indexOf(true);
  const lastQuote = quoted.lastIndexOf(true);

  if (firstQuote === -1) {
    warn(`${label} não tem bloco de campos; o texto inteiro vira o Sistema.`);
    return { source: null, fields: [], description: '', system: dedent(lines) };
  }

  const description: string[] = [...lines.slice(0, firstQuote)];
  const fields: { label: string; lines: string[] }[] = [];
  const system: string[] = [];
  let inSystem = false;

  for (const raw of lines.slice(firstQuote, lastQuote + 1)) {
    const content = unquoteLine(raw);
    if (inSystem) {
      system.push(content);
      continue;
    }
    const bullet = FIELD_BULLET.exec(content);
    if (bullet !== null) {
      const rawLabel = (bullet[1] ?? '').replace(/:\s*$/, '').trim();
      const label = FIELD_LABELS[normalizeLabel(rawLabel)] ?? rawLabel;
      const value = fieldValue(bullet[2] ?? '');
      if (label === 'Sistema') {
        inSystem = true;
        if (value !== '') system.push(value);
      } else {
        fields.push({ label, lines: value === '' ? [] : [value] });
      }
      continue;
    }
    const current = fields.at(-1);
    if (current === undefined) description.push(content.trim());
    else current.lines.push(content);
  }
  system.push(...lines.slice(lastQuote + 1));

  const parsedFields = fields.map((field) => ({ label: field.label, markdown: dedent(field.lines) }));
  const source = parsedFields.find((field) => field.label === 'Fonte')?.markdown ?? null;
  if (source === null) warn(`${label} sem Fonte.`);
  if (!inSystem) warn(`${label} sem Sistema.`);

  return {
    source,
    fields: parsedFields.filter((field) => field.label !== 'Fonte'),
    description: dedent(description),
    system: dedent(system),
  };
}

function parseEntry(name: string, level: number, kind: CatalogEntryKind, lines: readonly string[], warn: (message: string) => void): ParsedEntry {
  return { name, level, kind, ...parseEntryBlock(`"${name}" (nível ${level})`, lines, warn) };
}

function entryKindOf(noteKind: CatalogNoteKind, entries: string | undefined): CatalogEntryKind {
  if (noteKind === 'rituais') return 'ritual';
  if (noteKind === 'cerimonias') return 'ceremony';
  return entries === 'formulas' ? 'formula' : 'power';
}

// ---------- Note ----------

function introOf(lines: readonly string[]): string {
  const kept: string[] = [];
  let skippingContinuation = false;
  let skippingCallout = false;
  for (const line of lines) {
    if (/^!\[\[.*\]\]\s*$/.test(line.trim())) continue;
    if (/^>\s*\[!info\]/.test(line)) {
      skippingCallout = true;
      continue;
    }
    if (skippingCallout && line.trimStart().startsWith('>')) continue;
    skippingCallout = false;
    if (META_BULLET.test(line)) {
      skippingContinuation = true;
      continue;
    }
    if (skippingContinuation && /^\s+\S/.test(line)) continue;
    skippingContinuation = false;
    kept.push(line);
  }
  return dedent(kept);
}

export function parseDisciplineNote(noteName: string, text: string): ParseResult {
  const parsed = parseFrontmatter(text.replace(/^﻿/, ''));
  if (parsed === null) return { status: 'invalid', errors: [`${noteName}: sem frontmatter.`] };
  const { fields, body } = parsed;
  if (fields['publicar'] !== 'true') return { status: 'unpublished' };

  const errors: string[] = [];
  const kind = fields['tipo'];
  const discipline = fields['disciplina'];
  if (typeof kind !== 'string' || !NOTE_KINDS.includes(kind as CatalogNoteKind)) {
    errors.push(`${noteName}: "tipo" deve ser ${NOTE_KINDS.join(', ')}.`);
  }
  if (typeof discipline !== 'string' || discipline === '') errors.push(`${noteName}: falta "disciplina".`);

  const lines = body.split(/\r?\n/);
  const titleIndex = lines.findIndex((line) => /^# /.test(line));
  if (titleIndex === -1) errors.push(`${noteName}: sem título "# ".`);
  if (errors.length > 0) return { status: 'invalid', errors };

  const noteKind = kind as CatalogNoteKind;
  const entryKind = entryKindOf(noteKind, typeof fields['entradas'] === 'string' ? fields['entradas'] : undefined);
  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);

  // Split the body after the title into H2 segments.
  const segments: { title: string | null; lines: string[] }[] = [{ title: null, lines: [] }];
  for (const line of lines.slice(titleIndex + 1)) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2 !== null && !line.startsWith('###')) segments.push({ title: h2[1] ?? '', lines: [] });
    else segments.at(-1)?.lines.push(line);
  }

  const sections: { title: string; markdown: string }[] = [];
  const entries: ParsedEntry[] = [];
  for (const segment of segments.slice(1)) {
    const level = /^Nível (\d+)$/.exec(segment.title ?? '');
    if (level === null) {
      const markdown = dedent(trimBlank(segment.lines));
      if (markdown !== '') sections.push({ title: segment.title ?? '', markdown });
      continue;
    }
    let current: { name: string; lines: string[] } | null = null;
    const flush = () => {
      if (current !== null) entries.push(parseEntry(current.name, Number(level[1]), entryKind, current.lines, warn));
    };
    for (const line of segment.lines) {
      const h3 = /^###\s+(.+?)\s*$/.exec(line);
      if (h3 !== null) {
        flush();
        current = { name: h3[1] ?? '', lines: [] };
      } else if (current !== null) {
        current.lines.push(line);
      }
    }
    flush();
  }

  const seen = new Set<string>();
  for (const entry of entries) {
    const key = normalizeLabel(entry.name);
    if (seen.has(key)) warn(`"${entry.name}" aparece mais de uma vez.`);
    seen.add(key);
  }
  if (entries.length === 0) warn('nenhum item em "## Nível N".');

  const text0 = (key: string) => (typeof fields[key] === 'string' && fields[key] !== '' ? (fields[key] as string) : null);
  const nicknames = fields['apelidos'];

  return {
    status: 'parsed',
    warnings,
    note: {
      noteName,
      kind: noteKind,
      discipline: discipline as string,
      nicknames: Array.isArray(nicknames) ? nicknames : [],
      category: text0('categoria'),
      masquerade: text0('ameaca_mascara'),
      resonance: text0('resonance'),
      intro: introOf(segments[0]?.lines ?? []),
      sections,
      entries,
    },
  };
}
