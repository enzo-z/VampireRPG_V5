import { existsSync, readFileSync } from 'node:fs';
import { parseNyMapNote, type ParsedTaggedParagraph } from '../src/catalog/parseNyMap.ts';
import { nyMapCatalogSchema } from '../src/catalog/schema.ts';
import type { NyMapCatalog, NyTaggedParagraph } from '../src/catalog/types.ts';
import { renderInline } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

const paragraphs = (parsed: readonly ParsedTaggedParagraph[]): NyTaggedParagraph[] =>
  parsed.map((paragraph) => ({ html: renderInline(paragraph.markdown), sources: paragraph.sources }));

/** Reads "Narrador/Nova York/Mapa de Nova York.md" into the map's content (outlines live in the app). */
export function buildNyMap(notePath: string): VaultModuleBuild<NyMapCatalog | null> {
  if (!existsSync(notePath)) return { data: null, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parseNyMapNote(readFileSync(notePath, 'utf8'));
  if (result.status === 'unpublished') return { data: null, files: [notePath], errors: [], warnings: ['Mapa de Nova York sem "publicar: true".'] };
  if (result.status === 'invalid') return { data: null, files: [notePath], errors: result.errors, warnings: [] };

  const { map } = result;
  const data: NyMapCatalog = {
    factions: map.factions,
    layers: map.layers,
    overview: { title: map.overview.title, paragraphs: paragraphs(map.overview.paragraphs) },
    overviewBefore: { title: map.overviewBefore.title, paragraphs: paragraphs(map.overviewBefore.paragraphs) },
    court: map.court,
    boroughs: map.boroughs.map(({ summary, clans, before, note, ...borough }) => ({
      ...borough,
      summaryHtml: renderInline(summary),
      clans: clans.map(({ who, ...clan }) => ({ ...clan, whoHtml: renderInline(who) })),
      beforeHtml: renderInline(before),
      noteHtml: note === null ? null : renderInline(note),
    })),
    points: map.points.map(({ text, ...point }) => ({ ...point, html: renderInline(text) })),
    edges: map.edges.map(({ text, ...edge }) => ({ ...edge, html: renderInline(text) })),
    ledger: map.ledger.map((row) => ({
      clan: row.clan,
      cells: Object.fromEntries(
        Object.entries(row.cells).map(([column, marks]) => [column, marks.map((mark) => ({ kind: mark.kind, html: renderInline(mark.markdown) }))]),
      ),
    })),
    cards: map.cards.map((card) => ({ title: card.title, html: renderInline(card.markdown) })),
  };

  const validated = nyMapCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Mapa de Nova York inválido: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
