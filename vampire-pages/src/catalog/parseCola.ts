// Parses "Cola do Jogador.md" (frontmatter publicar: true): each "## Section" is a block
// of the printed cheat sheet, with its own text and optional "### Term" entries.
// "## Para saber mais" (links to the full notes) stays in Obsidian only.

import { normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedColaEntry {
  term: string;
  markdown: string;
}

export interface ParsedColaBlock {
  title: string;
  /** Text before the first "###". */
  markdown: string;
  entries: ParsedColaEntry[];
}

export type ColaParseResult = { status: 'parsed'; blocks: ParsedColaBlock[]; warnings: string[] } | { status: 'unpublished' };

const OBSIDIAN_ONLY: ReadonlySet<string> = new Set(['para saber mais']);

interface Section {
  title: string;
  lines: string[];
}

function sections(lines: readonly string[], marker: string): { before: string[]; found: Section[] } {
  const before: string[] = [];
  const found: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    if (line.startsWith(marker)) {
      current = { title: line.slice(marker.length).trim(), lines: [] };
      found.push(current);
    } else if (current === null) {
      before.push(line);
    } else {
      current.lines.push(line);
    }
  }
  return { before, found };
}

const text = (lines: readonly string[]) => lines.filter((line) => line.trim() !== '---').join('\n').trim();

export function parseColaNote(noteName: string, source: string): ColaParseResult {
  const parsed = parseFrontmatter(source);
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const blocks: ParsedColaBlock[] = [];

  for (const section of sections(parsed.body.split(/\r?\n/), '## ').found) {
    if (OBSIDIAN_ONLY.has(normalizeLabel(section.title))) continue;
    const { before, found } = sections(section.lines, '### ');
    const seen = new Set<string>();
    const entries = found.map((entry) => {
      const key = normalizeLabel(entry.title);
      if (seen.has(key)) warn(`"${entry.title}" aparece mais de uma vez em "${section.title}".`);
      seen.add(key);
      const markdown = text(entry.lines);
      if (markdown === '') warn(`"${entry.title}" (em "${section.title}") não tem texto.`);
      return { term: entry.title, markdown };
    });
    const markdown = text(before);
    if (markdown === '' && entries.length === 0) warn(`"${section.title}" não tem texto.`);
    blocks.push({ title: section.title, markdown, entries });
  }
  if (blocks.length === 0) warn('nenhuma seção "## Título".');
  return { status: 'parsed', blocks, warnings };
}
