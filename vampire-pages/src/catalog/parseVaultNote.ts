// Parses one vault note for the app's "Vault" (format agreed on 2026-10-17):
//   frontmatter: publicar: true, vault: <group shown in the index>, ordem: <number>,
//                optional ocultos: [Heading, ...] (sections kept in Obsidian, left out of the app)
//   an optional banner: the first embed before any text, e.g. ![[Pasted image ….png]]
//   then free markdown with Obsidian syntax.
// Obsidian-only parts stay out of the app: tag lines, "Sumário" sections,
// table-of-contents blocks and %% comments. Rendering happens in the Vite plugin.

import { hiddenItems, normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedVaultNote {
  noteName: string;
  group: string;
  order: number;
  /** Embedded file name of the banner ("Pasted image ….png"), or null. */
  banner: string | null;
  /** Markdown body without the Obsidian-only parts. */
  markdown: string;
}

export type VaultParseResult =
  | { status: 'parsed'; note: ParsedVaultNote; warnings: string[] }
  | { status: 'unpublished' };

const TAG_LINE = /^\s*(#[^\s#]+\s*)+$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;
const EMBED_LINE = /^\s*!\[\[([^\]]+)\]\]\s*$/;
const OBSIDIAN_ONLY_SECTIONS: ReadonlySet<string> = new Set(['sumario']);
const DEFAULT_ORDER = 1000;

/** "# # Sumário" and "### Sumário" are both the table of contents. */
function headingTitle(rawTitle: string): string {
  return rawTitle.replace(/^#+\s*/, '').trim();
}

/** Removes "## Title" sections (heading plus everything up to the next heading of the same or higher level). */
function removeSections(lines: readonly string[], shouldRemove: (title: string) => boolean): string[] {
  const kept: string[] = [];
  let removingDepth: number | null = null;
  let inFence = false;
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence;
    const heading = inFence ? null : HEADING.exec(line);
    if (heading !== null) {
      const depth = (heading[1] ?? '').length;
      if (removingDepth !== null && depth <= removingDepth) removingDepth = null;
      if (removingDepth === null && shouldRemove(headingTitle(heading[2] ?? ''))) {
        removingDepth = depth;
        continue;
      }
    }
    if (removingDepth === null) kept.push(line);
  }
  return kept;
}

/** The first embed before any text or heading is the note's banner. */
function extractBanner(lines: string[]): string | null {
  const index = lines.findIndex((line) => line.trim() !== '' && line.trim() !== '---');
  const embed = index === -1 ? null : EMBED_LINE.exec(lines[index] ?? '');
  if (embed === null) return null;
  lines.splice(index, 1);
  return (embed[1] ?? '').split('|')[0]?.trim() ?? null;
}

function trimBlankEdges(lines: readonly string[]): string {
  let start = 0;
  let end = lines.length;
  const blank = (line: string | undefined) => line === undefined || ['', '---'].includes(line.trim());
  while (start < end && blank(lines[start])) start += 1;
  while (end > start && blank(lines[end - 1])) end -= 1;
  return lines.slice(start, end).join('\n');
}

export function parseVaultNote(noteName: string, source: string): VaultParseResult {
  const parsed = parseFrontmatter(source.replace(/^﻿/, ''));
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };
  const group = parsed.fields['vault'];
  if (typeof group !== 'string' || group.trim() === '') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const rawOrder = parsed.fields['ordem'];
  const order = typeof rawOrder === 'string' && /^\d+$/.test(rawOrder) ? Number(rawOrder) : DEFAULT_ORDER;
  if (order === DEFAULT_ORDER) warn('sem "ordem" numérica; vai para o fim do grupo.');

  const hidden = hiddenItems(parsed.fields);
  const body = parsed.body
    .replace(/```table-of-contents[\s\S]*?```/g, '')
    .replace(/%%[\s\S]*?%%/g, '');
  const lines = removeSections(
    body.split(/\r?\n/).filter((line) => !TAG_LINE.test(line)),
    (title) => OBSIDIAN_ONLY_SECTIONS.has(normalizeLabel(title)) || hidden.isHidden(title),
  );
  for (const name of hidden.unmatched()) warn(`"${name}" está em "ocultos", mas não há seção com esse título.`);

  const banner = extractBanner(lines);
  const markdown = trimBlankEdges(lines);
  if (markdown === '') warn('nota sem texto.');

  return { status: 'parsed', warnings, note: { noteName, group: group.trim(), order, banner, markdown } };
}
