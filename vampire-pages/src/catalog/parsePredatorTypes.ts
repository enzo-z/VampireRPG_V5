// Parses "Predator Type.md": frontmatter (publicar: true), an intro, then one
// "# Name" section per predator type ("# Sumário" is skipped). A heading like
// "Headhunter/Blood Leech" is one entry known by both names; a "**Fonte:** …"
// paragraph inside a section becomes its source.

import { normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedPredatorType {
  /** Heading as written, e.g. "Headhunter/Blood Leech". */
  title: string;
  /** Each name in the heading, e.g. ["Headhunter", "Blood Leech"]. */
  names: string[];
  source: string | null;
  markdown: string;
}

export type PredatorTypeParseResult =
  | { status: 'parsed'; entries: ParsedPredatorType[]; warnings: string[] }
  | { status: 'unpublished' };

const SKIPPED_HEADINGS: ReadonlySet<string> = new Set(['sumario']);
const HEADING = /^# (.+?)\s*$/;
const SOURCE_LINE = /^\*\*Fonte:?\*\*:?\s*(.+?)\s*$/;

interface Section {
  title: string;
  lines: string[];
}

function sectionsOf(body: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of body.split(/\r?\n/)) {
    const heading = HEADING.exec(line);
    if (heading !== null) {
      current = { title: (heading[1] ?? '').trim(), lines: [] };
      sections.push(current);
    } else {
      current?.lines.push(line);
    }
  }
  return sections;
}

export function parsePredatorTypeNote(noteName: string, text: string): PredatorTypeParseResult {
  const parsed = parseFrontmatter(text);
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const entries: ParsedPredatorType[] = [];
  const seen = new Set<string>();

  for (const section of sectionsOf(parsed.body)) {
    if (SKIPPED_HEADINGS.has(normalizeLabel(section.title))) continue;
    const names = section.title.split('/').map((name) => name.trim()).filter((name) => name !== '');
    let source: string | null = null;
    const kept = section.lines.filter((line) => {
      if (line.trim() === '---') return false;
      const sourceLine = SOURCE_LINE.exec(line.trim());
      if (sourceLine === null) return true;
      source = sourceLine[1] ?? null;
      return false;
    });
    const markdown = kept.join('\n').trim();
    if (markdown === '') warn(`"${section.title}" não tem texto.`);
    for (const name of names) {
      const key = normalizeLabel(name);
      if (seen.has(key)) warn(`"${name}" aparece mais de uma vez.`);
      seen.add(key);
    }
    entries.push({ title: section.title, names, source, markdown });
  }
  if (entries.length === 0) warn('nenhum Predator Type em "# Nome".');
  return { status: 'parsed', entries, warnings };
}
