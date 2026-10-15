// Parses "Gerações e Potência.md" (frontmatter publicar: true):
//   # Lista de Gerações   → "### Neonatos: 12ª e 13ª Gerações" sections; the
//                            ordinals in the heading say which generations it covers
//                            ("6ª até 9ª" and "14ª a 16ª" are ranges).
//   # Blood Potency       → the table whose header starts with "| Blood Potency"
//                            (one row per level, 0–10) and the "### Blood Potency N"
//                            sections ("### Blood Potency 6 e Maior" covers 6 and up).

import { normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedGeneration {
  title: string;
  generations: number[];
  markdown: string;
}

export interface ParsedPotencyLevel {
  level: number;
  /** "Blood Potency 6 e Maior": also covers every higher level. */
  orMore: boolean;
  markdown: string;
}

/** One row of the Blood Potency table, cells as written. */
export interface PotencyRow {
  level: number;
  surge: string;
  mend: string;
  disciplineBonus: string;
  rouseReRoll: string;
  baneSeverity: string;
  feeding: string;
}

export type BloodParseResult =
  | { status: 'parsed'; generations: ParsedGeneration[]; levels: ParsedPotencyLevel[]; table: PotencyRow[]; warnings: string[] }
  | { status: 'unpublished' };

export const POTENCY_TABLE_LEVELS = 11;

interface Section {
  title: string;
  lines: string[];
}

function sections(lines: readonly string[], marker: string): Section[] {
  const found: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    if (line.startsWith(marker)) {
      current = { title: line.slice(marker.length).trim(), lines: [] };
      found.push(current);
    } else {
      current?.lines.push(line);
    }
  }
  return found;
}

const sectionText = (lines: readonly string[]) => lines.filter((line) => line.trim() !== '---').join('\n').trim();

/** "Anciões: 6ª até 9ª Geração" → [6, 7, 8, 9]; "Neonatos: 12ª e 13ª" → [12, 13]. */
export function generationsInTitle(title: string): number[] {
  const ordinals = [...title.matchAll(/(\d+)ª/g)].map((match) => Number(match[1]));
  const [first, last] = [ordinals[0], ordinals.at(-1)];
  if (first === undefined || last === undefined) return [];
  if (ordinals.length === 2 && /\d+ª\s+(até|a)\s+\d+ª/.test(title)) {
    return Array.from({ length: last - first + 1 }, (_, offset) => first + offset);
  }
  return ordinals;
}

const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());

function parseTable(lines: readonly string[], warn: (message: string) => void): PotencyRow[] {
  const start = lines.findIndex((line) => normalizeLabel(cells(line)[0] ?? '') === 'blood potency' && line.trim().startsWith('|'));
  if (start === -1) {
    warn('tabela "| Blood Potency | …" não encontrada.');
    return [];
  }
  const rows: PotencyRow[] = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.trim().startsWith('|')) break;
    const [level, surge, mend, disciplineBonus, rouseReRoll, baneSeverity, feeding, ...extra] = cells(line);
    if (feeding === undefined || extra.length > 0 || !/^\d+$/.test(level ?? '')) {
      warn(`linha da tabela ilegível: ${line.trim()}`);
      continue;
    }
    rows.push({ level: Number(level), surge: surge ?? '', mend: mend ?? '', disciplineBonus: disciplineBonus ?? '', rouseReRoll: rouseReRoll ?? '', baneSeverity: baneSeverity ?? '', feeding });
  }
  const expected = Array.from({ length: POTENCY_TABLE_LEVELS }, (_, level) => level);
  if (rows.map((row) => row.level).join() !== expected.join()) warn(`a tabela deve ter os níveis 0 a ${POTENCY_TABLE_LEVELS - 1}, em ordem.`);
  return rows;
}

export function parseBloodNote(noteName: string, text: string): BloodParseResult {
  const parsed = parseFrontmatter(text);
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const chapters = sections(parsed.body.split(/\r?\n/), '# ');
  const chapter = (name: string) => chapters.find((section) => normalizeLabel(section.title) === normalizeLabel(name));

  const generationChapter = chapter('Lista de Gerações');
  if (generationChapter === undefined) warn('"# Lista de Gerações" não encontrada.');
  const generations = sections(generationChapter?.lines ?? [], '### ').map((section) => ({
    title: section.title,
    generations: generationsInTitle(section.title),
    markdown: sectionText(section.lines),
  }));
  for (const generation of generations) {
    if (generation.generations.length === 0) warn(`"${generation.title}" não diz quais gerações cobre (ex.: "12ª e 13ª").`);
  }

  const potencyChapter = chapter('Blood Potency');
  if (potencyChapter === undefined) warn('"# Blood Potency" não encontrada.');
  const table = potencyChapter === undefined ? [] : parseTable(potencyChapter.lines, warn);
  const levels: ParsedPotencyLevel[] = [];
  for (const section of sections(potencyChapter?.lines ?? [], '### ')) {
    const heading = /^Blood Potency (\d+)( e Maior)?$/.exec(section.title);
    if (heading === null) continue;
    levels.push({ level: Number(heading[1]), orMore: heading[2] !== undefined, markdown: sectionText(section.lines) });
  }
  if (levels.length === 0) warn('nenhuma seção "### Blood Potency N".');

  return { status: 'parsed', generations, levels, table, warnings };
}
