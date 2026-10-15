// Parses "Clãs.md" (frontmatter publicar: true):
//   # Banes (Maldições)   → "### Maldição dos Brujah" (also "do"/"da") sections;
//   # Compulsões de Clã   → "## Brujah: Rebelião" sections;
//   # Perfis dos Clãs     → "## Brujah" profiles with Fonte, Apelidos, Seita,
//                            Disciplinas, Bane (resumo), Compulsão (resumo) and Sistema.
// Each profile gets the bane and compulsion of the same clan from the sections above.

import { normalizeLabel, parseEntryBlock, parseFrontmatter } from './parseNote.ts';

export interface ParsedClanSection {
  title: string;
  markdown: string;
}

export interface ParsedClan {
  name: string;
  aliases: string[];
  source: string | null;
  sect: string;
  disciplines: string[];
  baneSummary: string;
  compulsionSummary: string;
  description: string;
  bane: ParsedClanSection | null;
  compulsion: ParsedClanSection | null;
}

export type ClanParseResult = { status: 'parsed'; clans: ParsedClan[]; warnings: string[] } | { status: 'unpublished' };

/** Clans with no bane nor compulsion of their own. */
const CLANLESS: ReadonlySet<string> = new Set(['caitiff', 'thin blood']);

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
const key = (name: string) => normalizeLabel(name.replace(/-/g, ' '));
const splitList = (text: string) => text.split(',').map((item) => item.trim()).filter((item) => item !== '');

export function parseClansNote(noteName: string, text: string): ClanParseResult {
  const parsed = parseFrontmatter(text);
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const chapters = sections(parsed.body.split(/\r?\n/), '# ');
  const chapter = (name: string) => {
    const found = chapters.find((section) => normalizeLabel(section.title) === normalizeLabel(name));
    if (found === undefined) warn(`"# ${name}" não encontrada.`);
    return found?.lines ?? [];
  };

  const banes = new Map<string, ParsedClanSection>();
  for (const section of sections(chapter('Banes (Maldições)'), '### ')) {
    const clan = /^Maldição d[aeo]s? (.+)$/.exec(section.title)?.[1];
    if (clan === undefined) continue;
    banes.set(key(clan), { title: section.title, markdown: sectionText(section.lines) });
  }

  const compulsions = new Map<string, ParsedClanSection>();
  for (const section of sections(chapter('Compulsões de Clã'), '## ')) {
    const [clan, name] = section.title.split(':').map((part) => part.trim());
    if (clan === undefined || name === undefined) continue;
    compulsions.set(key(clan), { title: name, markdown: sectionText(section.lines) });
  }

  const clans: ParsedClan[] = [];
  for (const section of sections(chapter('Perfis dos Clãs'), '## ')) {
    const block = parseEntryBlock(`"${section.title}"`, section.lines.filter((line) => line.trim() !== '---'), warn);
    const field = (label: string) => block.fields.find((item) => normalizeLabel(item.label) === normalizeLabel(label))?.markdown ?? '';
    const clanKey = key(section.title);
    const clan: ParsedClan = {
      name: section.title,
      aliases: splitList(field('Apelidos')),
      source: block.source,
      sect: field('Seita'),
      disciplines: splitList(field('Disciplinas')),
      baneSummary: field('Bane (resumo)'),
      compulsionSummary: field('Compulsão (resumo)'),
      description: block.system,
      bane: banes.get(clanKey) ?? null,
      compulsion: compulsions.get(clanKey) ?? null,
    };
    if (clan.disciplines.length === 0) warn(`"${clan.name}" sem Disciplinas.`);
    if (clan.baneSummary === '' || clan.compulsionSummary === '') warn(`"${clan.name}" sem os resumos de Bane e Compulsão.`);
    if (!CLANLESS.has(clanKey) && clan.bane === null) warn(`"${clan.name}" sem "### Maldição dos ${clan.name}".`);
    if (!CLANLESS.has(clanKey) && clan.compulsion === null) warn(`"${clan.name}" sem "## ${clan.name}: …" em Compulsões.`);
    clans.push(clan);
  }

  const profiled = new Set(clans.map((clan) => key(clan.name)));
  for (const [clanKey, bane] of banes) if (!profiled.has(clanKey)) warn(`"${bane.title}" não tem perfil em "# Perfis dos Clãs".`);
  for (const [clanKey, compulsion] of compulsions) if (!profiled.has(clanKey)) warn(`Compulsão "${compulsion.title}" não tem perfil em "# Perfis dos Clãs".`);
  if (clans.length === 0) warn('nenhum perfil em "# Perfis dos Clãs".');

  return { status: 'parsed', clans, warnings };
}
