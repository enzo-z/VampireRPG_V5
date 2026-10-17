// Parses the New York map note ("Narrador/Nova York/Mapa de Nova York.md",
// frontmatter publicar: true). The note is the source of truth for the map's
// content; the borough outlines live in src/features/map/geometry.ts.
//
// Sections read (H1 "# Title"):
//   O que o mapa mostra   → layer table (Camada | Símbolo | Para quê)
//   Facções e legenda     → faction table (Chave | Nome na legenda | …)
//   Visão geral da cidade → '**2021, "Title":** text [tags]', '**Antes de 1999, "Title":** …', court table
//   Distritos             → "## Borough" with **Facção:**, **Área / população:**, **Resumo:**, clan table,
//                           **Antes de 1999:**, **Observação do painel:**
//   Pontos do mapa        → "### Borough", then '- **Name** (`id`) · layers · `lon, lat` · "label" · [extras ·] sources'
//                           followed by the indented panel text
//   Fora do mapa          → '- **↑ Name** (`id`) · position · sources' plus indented text
//   Clãs por distrito     → ledger table; cells hold "● …" (base) and "○ …" (presence) marks
//   Divergências e cuidados → '- **Title.** text'
// Everything else (how-to, open decisions) stays in Obsidian.

import type { NyBoroughId, NyFactionKey, NyLayerId, NyLedgerColumn, NySourceKey } from './types.ts';
import { normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedTaggedParagraph {
  markdown: string;
  sources: NySourceKey[];
}

export interface ParsedNyBorough {
  id: NyBoroughId;
  name: string;
  faction: NyFactionKey;
  factionBefore: NyFactionKey;
  status: string;
  area: string | null;
  population: string | null;
  summary: string;
  clans: { clan: string; who: string; sources: NySourceKey[] }[];
  before: string;
  note: string | null;
}

export interface ParsedNyPoint {
  id: string;
  name: string;
  label: string;
  layers: NyLayerId[];
  borough: NyBoroughId | null;
  lon: number;
  lat: number;
  approximate: boolean;
  labelLeft: boolean;
  sources: NySourceKey[];
  text: string;
}

export interface ParsedNyEdge {
  id: string;
  label: string;
  name: string;
  sources: NySourceKey[];
  text: string;
}

export interface ParsedNyMap {
  factions: { key: NyFactionKey; name: string }[];
  layers: { id: NyLayerId; name: string }[];
  overview: { title: string; paragraphs: ParsedTaggedParagraph[] };
  overviewBefore: { title: string; paragraphs: ParsedTaggedParagraph[] };
  court: { name: string; role: string }[];
  boroughs: ParsedNyBorough[];
  points: ParsedNyPoint[];
  edges: ParsedNyEdge[];
  ledger: { clan: string; cells: Partial<Record<NyLedgerColumn, { kind: 'base' | 'presence'; markdown: string }[]>> }[];
  cards: { title: string; markdown: string }[];
}

export type NyMapParseResult =
  | { status: 'parsed'; map: ParsedNyMap; warnings: string[] }
  | { status: 'unpublished' }
  | { status: 'invalid'; errors: string[] };

const FACTION_KEYS: readonly NyFactionKey[] = ['cam', 'camSoft', 'anarch', 'anarchSoft', 'indep', 'sabbat', 'unk'];

/** Layer names in the note → ids used by the app. */
const LAYER_IDS: Readonly<Record<string, NyLayerId>> = {
  'lugares de 2021': 'now',
  coterie: 'pc',
  'auld sanguine': 'auld',
  'batalha de 1999': 'b1999',
  historia: 'hist',
};

const SOURCE_KEYS: Readonly<Record<string, NySourceKey>> = {
  'jogos v5': 'jogos',
  'livro v5': 'livro',
  notas: 'notas',
  sug: 'sug',
  'ed anterior': 'ant',
};

const BOROUGH_IDS: Readonly<Record<string, NyBoroughId>> = {
  manhattan: 'manhattan',
  brooklyn: 'brooklyn',
  queens: 'queens',
  bronx: 'bronx',
  'staten island': 'staten',
  'nova jersey': 'nj',
};

const LEDGER_COLUMNS: Readonly<Record<string, NyLedgerColumn>> = {
  manhattan: 'manhattan',
  brooklyn: 'brooklyn',
  queens: 'queens',
  bronx: 'bronx',
  'staten is': 'staten',
  'staten island': 'staten',
  'n jersey': 'nj',
  'nova jersey': 'nj',
  cidade: 'city',
};

/** One inline source tag, e.g. "[livro V5]". */
const TAG = /^\[(jogos V5|livro V5|notas|SUG|ed\. anterior)\]$/i;

interface Issues {
  error: (message: string) => void;
  warn: (message: string) => void;
}

// ---------- Generic helpers ----------

/** Splits lines into "<marker> Title" sections (marker "#", "##" or "###"). */
function sectionsOf(lines: readonly string[], marker: string): { title: string; lines: string[] }[] {
  const prefix = `${marker} `;
  const sections: { title: string; lines: string[] }[] = [];
  for (const line of lines) {
    if (line.startsWith(prefix)) sections.push({ title: line.slice(prefix.length).trim(), lines: [] });
    else sections.at(-1)?.lines.push(line);
  }
  return sections;
}

/** Table rows (header first), without the separator row. */
function tableRows(lines: readonly string[]): string[][] {
  return lines
    .filter((line) => line.trim().startsWith('|'))
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim()),
    )
    .filter((cells) => !cells.every((cell) => /^:?-+:?$/.test(cell)));
}

/** "**Label:** value" bullets of a section, keyed by normalized label. */
function labeledBullets(lines: readonly string[]): Map<string, string> {
  const bullets = new Map<string, string>();
  for (const line of lines) {
    const match = /^- \*\*(.+?):\*\*\s*(.*)$/.exec(line.trim());
    if (match !== null) bullets.set(normalizeLabel(match[1] ?? ''), (match[2] ?? '').trim());
  }
  return bullets;
}

function sourceList(text: string, separator: RegExp, where: string, issues: Issues): NySourceKey[] {
  const sources: NySourceKey[] = [];
  for (const raw of text.split(separator)) {
    const label = raw.trim();
    if (label === '') continue;
    const key = SOURCE_KEYS[normalizeLabel(label)];
    if (key === undefined) issues.error(`${where}: fonte desconhecida "${label}" (use jogos V5, livro V5, notas, SUG ou ed. anterior).`);
    else if (!sources.includes(key)) sources.push(key);
  }
  return sources;
}

function tagKey(token: string): NySourceKey | undefined {
  const tag = TAG.exec(token);
  return tag === null ? undefined : SOURCE_KEYS[normalizeLabel(tag[1] ?? '')];
}

/** Splits text at its source-tag groups: "a. [notas] b. [livro V5]" → two paragraphs, each with its tags. */
export function taggedParagraphs(text: string): ParsedTaggedParagraph[] {
  // Odd indexes are tags; even indexes the text between them.
  const tokens = text.split(/(\[(?:jogos V5|livro V5|notas|SUG|ed\. anterior)\])/i);
  const paragraphs: ParsedTaggedParagraph[] = [];
  let current: ParsedTaggedParagraph = { markdown: '', sources: [] };
  tokens.forEach((token, index) => {
    const key = tagKey(token);
    if (key === undefined) {
      // Text after a closed tag group starts a new paragraph; blanks between tags do not.
      if (token.trim() !== '' && current.sources.length > 0) {
        paragraphs.push(current);
        current = { markdown: '', sources: [] };
      }
      current.markdown += token;
    } else if (!current.sources.includes(key)) {
      current.sources.push(key);
    }
    if (index === tokens.length - 1) paragraphs.push(current);
  });
  return paragraphs
    .map((paragraph) => ({ markdown: paragraph.markdown.trim(), sources: paragraph.sources }))
    .filter((paragraph) => paragraph.markdown !== '');
}

function layerId(name: string): NyLayerId | undefined {
  return LAYER_IDS[normalizeLabel(name)];
}

// ---------- Sections ----------

function parseLayers(lines: readonly string[], issues: Issues): ParsedNyMap['layers'] {
  const layers: ParsedNyMap['layers'] = [];
  for (const [name = ''] of tableRows(lines).slice(1)) {
    const id = layerId(name);
    if (id === undefined) issues.error(`O que o mapa mostra: camada desconhecida "${name}".`);
    else layers.push({ id, name });
  }
  if (layers.length === 0) issues.error('O que o mapa mostra: nenhuma camada na tabela.');
  return layers;
}

function parseFactions(lines: readonly string[], issues: Issues): ParsedNyMap['factions'] {
  const factions: ParsedNyMap['factions'] = [];
  for (const [rawKey = '', name = ''] of tableRows(lines).slice(1)) {
    const key = rawKey.replace(/`/g, '') as NyFactionKey;
    if (!FACTION_KEYS.includes(key)) issues.error(`Facções e legenda: chave desconhecida "${rawKey}".`);
    else factions.push({ key, name });
  }
  return factions;
}

function parseOverview(lines: readonly string[], issues: Issues) {
  const empty = { title: '', paragraphs: [] as ParsedTaggedParagraph[] };
  let overview = empty;
  let overviewBefore = empty;
  for (const line of lines) {
    const match = /^\*\*(2021|Antes de 1999), "([^"]+)":\*\*\s*(.*)$/.exec(line.trim());
    if (match === null) continue;
    const parsed = { title: match[2] ?? '', paragraphs: taggedParagraphs(match[3] ?? '') };
    if (match[1] === '2021') overview = parsed;
    else overviewBefore = parsed;
  }
  if (overview.title === '') issues.error('Visão geral da cidade: falta o parágrafo **2021, "Título":**.');
  if (overviewBefore.title === '') issues.error('Visão geral da cidade: falta o parágrafo **Antes de 1999, "Título":**.');
  const court = tableRows(lines)
    .slice(1)
    .map(([name = '', role = '']) => ({ name, role }));
  if (court.length === 0) issues.error('Visão geral da cidade: a tabela da corte está vazia.');
  return { overview, overviewBefore, court };
}

function factionOf(text: string, where: string, issues: Issues): NyFactionKey {
  const key = text as NyFactionKey;
  if (FACTION_KEYS.includes(key)) return key;
  issues.error(`${where}: facção desconhecida "${text}".`);
  return 'unk';
}

function parseBorough(section: { title: string; lines: string[] }, issues: Issues): ParsedNyBorough | null {
  const id = BOROUGH_IDS[normalizeLabel(section.title)];
  const where = `Distritos > ${section.title}`;
  if (id === undefined) {
    issues.error(`${where}: distrito desconhecido (use Manhattan, Brooklyn, Queens, Bronx, Staten Island ou Nova Jersey).`);
    return null;
  }
  const bullets = labeledBullets(section.lines);
  const faction = /2021 `(\w+)`\s*\(([^)]*)\)\s*·\s*antes de 1999 `(\w+)`/.exec(bullets.get('faccao') ?? '');
  if (faction === null) issues.error(`${where}: "**Facção:** 2021 \`chave\` (status) · antes de 1999 \`chave\`" ausente ou fora do formato.`);
  const area = /([\d.,]+)\s*km²\s*·\s*([\d.]+)/.exec(bullets.get('area populacao') ?? '');
  const summary = bullets.get('resumo') ?? '';
  const before = bullets.get('antes de 1999') ?? '';
  if (summary === '') issues.error(`${where}: falta "**Resumo:**".`);
  if (before === '') issues.error(`${where}: falta "**Antes de 1999:**".`);

  const clans = tableRows(section.lines)
    .slice(1)
    .map(([clan = '', who = '', sources = '']) => ({ clan, who, sources: sourceList(sources, /\s*·\s*/, `${where}, ${clan}`, issues) }));
  if (clans.length === 0) issues.warn(`${where}: nenhum clã na tabela.`);

  return {
    id,
    name: section.title,
    faction: factionOf(faction?.[1] ?? 'unk', where, issues),
    factionBefore: factionOf(faction?.[3] ?? 'unk', where, issues),
    status: faction?.[2]?.trim() ?? '',
    area: area?.[1] ?? null,
    population: area?.[2] ?? null,
    summary,
    clans,
    before,
    note: bullets.get('observacao do painel') ?? null,
  };
}

const POINT_LINE = /^- \*\*(.+?)\*\* \(`([a-z0-9-]+)`\) · (.+)$/;

function parsePoint(
  line: string,
  textLines: readonly string[],
  borough: NyBoroughId | null,
  layersByName: (name: string) => NyLayerId | undefined,
  issues: Issues,
): ParsedNyPoint | null {
  const match = POINT_LINE.exec(line.trim());
  if (match === null) return null;
  const [, name = '', id = '', rest = ''] = match;
  const where = `Pontos do mapa > ${name}`;
  const parts = rest.split(' · ').map((part) => part.trim());
  if (parts.length < 4) {
    issues.error(`${where}: esperado "camadas · \`lon, lat\` · "rótulo" · [extras ·] fontes".`);
    return null;
  }
  const [layerText = '', coords = '', labelText = ''] = parts;
  const sourcesText = parts.at(-1) ?? '';
  const extras = parts.slice(3, -1).join(', ');

  const layers: NyLayerId[] = [];
  for (const layerName of layerText.split(',')) {
    const layer = layersByName(layerName.trim());
    if (layer === undefined) issues.error(`${where}: camada desconhecida "${layerName.trim()}".`);
    else layers.push(layer);
  }

  const position = /^`(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)`$/.exec(coords);
  const lon = Number(position?.[1]);
  const lat = Number(position?.[2]);
  if (position === null || lon < -75 || lon > -73 || lat < 40 || lat > 41.5) {
    issues.error(`${where}: coordenada "${coords}" inválida (use \`longitude, latitude\` de Nova York, como \`-73.9744, 40.7645\`).`);
  }

  const label = /^"(.+)"$/.exec(labelText)?.[1];
  if (label === undefined) issues.error(`${where}: rótulo "${labelText}" deve vir entre aspas.`);

  const flags = extras
    .split(',')
    .map((flag) => normalizeLabel(flag))
    .filter((flag) => flag !== '');
  const known = new Set(['aproximado', 'rotulo a esquerda', 'sem distrito']);
  flags.filter((flag) => !known.has(flag)).forEach((flag) => issues.warn(`${where}: extra desconhecido "${flag}".`));

  const text = textLines.map((textLine) => textLine.trim()).filter((textLine) => textLine !== '').join(' ');
  if (text === '') issues.warn(`${where}: sem texto para o painel.`);

  return {
    id,
    name,
    label: label ?? name,
    layers,
    borough: flags.includes('sem distrito') ? null : borough,
    lon,
    lat,
    approximate: flags.includes('aproximado'),
    labelLeft: flags.includes('rotulo a esquerda'),
    sources: sourceList(sourcesText, /\s*,\s*/, where, issues),
    text,
  };
}

/** Bullets that start at column 0, each with the indented lines below it. */
function bulletsWithText(lines: readonly string[]): { line: string; text: string[] }[] {
  const items: { line: string; text: string[] }[] = [];
  for (const line of lines) {
    if (line.startsWith('- ')) items.push({ line, text: [] });
    else if (/^\s+\S/.test(line)) items.at(-1)?.text.push(line);
  }
  return items;
}

function parsePoints(lines: readonly string[], layers: ParsedNyMap['layers'], issues: Issues): ParsedNyPoint[] {
  const byName = (name: string) => {
    const id = layerId(name);
    return id !== undefined && layers.some((layer) => layer.id === id) ? id : undefined;
  };
  const points: ParsedNyPoint[] = [];
  for (const group of sectionsOf(lines, '###')) {
    const borough = BOROUGH_IDS[normalizeLabel(group.title)];
    if (borough === undefined) issues.error(`Pontos do mapa: grupo "${group.title}" não é um distrito.`);
    for (const item of bulletsWithText(group.lines)) {
      const point = parsePoint(item.line, item.text, borough ?? null, byName, issues);
      if (point !== null) points.push(point);
    }
  }
  return points;
}

function parseEdges(lines: readonly string[], issues: Issues): ParsedNyEdge[] {
  const edges: ParsedNyEdge[] = [];
  for (const item of bulletsWithText(lines)) {
    const match = POINT_LINE.exec(item.line.trim());
    if (match === null) continue;
    const [, label = '', id = '', rest = ''] = match;
    const parts = rest.split(' · ');
    edges.push({
      id,
      label,
      name: label.replace(/[↑↓←→]/g, '').trim(),
      sources: sourceList(parts.at(-1) ?? '', /\s*,\s*/, `Fora do mapa > ${label}`, issues),
      text: item.text.map((line) => line.trim()).join(' '),
    });
  }
  return edges;
}

function parseLedger(lines: readonly string[], issues: Issues): ParsedNyMap['ledger'] {
  const [header = [], ...rows] = tableRows(lines);
  const columns = header.slice(1).map((title) => {
    const column = LEDGER_COLUMNS[normalizeLabel(title)];
    if (column === undefined) issues.error(`Clãs por distrito: coluna desconhecida "${title}".`);
    return column;
  });
  return rows.map(([clan = '', ...cells]) => {
    const parsed: ParsedNyMap['ledger'][number]['cells'] = {};
    cells.forEach((cell, index) => {
      const column = columns[index];
      if (column === undefined || cell === '') return;
      const marks = [...cell.matchAll(/([●○])\s*([^●○]+)/g)].map((mark) => ({
        kind: mark[1] === '●' ? ('base' as const) : ('presence' as const),
        markdown: (mark[2] ?? '').trim().replace(/;$/, '').trim(),
      }));
      if (marks.length === 0) issues.warn(`Clãs por distrito > ${clan}: célula sem ● ou ○ ("${cell}").`);
      else parsed[column] = marks;
    });
    return { clan, cells: parsed };
  });
}

function parseCards(lines: readonly string[]): ParsedNyMap['cards'] {
  return lines
    .map((line) => /^- \*\*(.+?)\*\*\s*(.*)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({ title: (match[1] ?? '').replace(/\.$/, '').trim(), markdown: (match[2] ?? '').trim() }));
}

function duplicates(ids: readonly string[]): string[] {
  return ids.filter((id, index) => ids.indexOf(id) !== index);
}

// ---------- Note ----------

export function parseNyMapNote(source: string): NyMapParseResult {
  const parsed = parseFrontmatter(source.replace(/^﻿/, ''));
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const errors: string[] = [];
  const warnings: string[] = [];
  const issues: Issues = { error: (message) => errors.push(message), warn: (message) => warnings.push(message) };

  const sections = new Map(sectionsOf(parsed.body.split(/\r?\n/), '#').map((section) => [normalizeLabel(section.title), section.lines]));
  const section = (title: string): string[] => {
    const lines = sections.get(normalizeLabel(title));
    if (lines === undefined) issues.error(`falta a seção "# ${title}".`);
    return lines ?? [];
  };

  const layers = parseLayers(section('O que o mapa mostra'), issues);
  const factions = parseFactions(section('Facções e legenda'), issues);
  const { overview, overviewBefore, court } = parseOverview(section('Visão geral da cidade'), issues);
  const boroughs = sectionsOf(section('Distritos'), '##')
    .map((borough) => parseBorough(borough, issues))
    .filter((borough): borough is ParsedNyBorough => borough !== null);
  const points = parsePoints(section('Pontos do mapa'), layers, issues);
  const edges = parseEdges(section('Fora do mapa'), issues);
  const ledger = parseLedger(section('Clãs por distrito'), issues);
  const cards = parseCards(section('Divergências e cuidados'));

  const usedFactions = new Set(boroughs.flatMap((borough) => [borough.faction, borough.factionBefore]));
  for (const key of usedFactions) {
    if (!factions.some((faction) => faction.key === key)) issues.error(`Distritos usam a facção "${key}", que não está em "Facções e legenda".`);
  }
  for (const id of duplicates(points.map((point) => point.id))) issues.error(`Pontos do mapa: id "${id}" repetido.`);
  for (const id of duplicates(edges.map((edge) => edge.id))) issues.error(`Fora do mapa: id "${id}" repetido.`);
  for (const id of duplicates(boroughs.map((borough) => borough.id))) issues.error(`Distritos: "${id}" aparece mais de uma vez.`);

  if (errors.length > 0) return { status: 'invalid', errors };
  return {
    status: 'parsed',
    warnings,
    map: { factions, layers, overview, overviewBefore, court, boroughs, points, edges, ledger, cards },
  };
}
