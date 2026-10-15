import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseAdvantagesNote } from '../src/catalog/parseAdvantages.ts';
import { advantageCatalogSchema } from '../src/catalog/schema.ts';
import type { AdvantageCatalog } from '../src/catalog/types.ts';
import { renderInline, renderMarkdown, toPlainText } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads Advantages.md (if published) and builds the validated advantage catalog. */
export function buildAdvantages(notePath: string): VaultModuleBuild<AdvantageCatalog> {
  const empty: AdvantageCatalog = { entries: [] };
  if (!existsSync(notePath)) return { data: empty, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parseAdvantagesNote(basename(notePath, '.md'), readFileSync(notePath, 'utf8'));
  if (result.status === 'invalid') return { data: empty, files: [notePath], errors: result.errors, warnings: [] };
  if (result.status === 'unpublished') return { data: empty, files: [notePath], errors: [], warnings: ['Advantages.md sem publicar: true.'] };

  const data: AdvantageCatalog = {
    entries: result.entries.map((entry) => ({
      name: entry.name,
      category: entry.category,
      group: entry.group,
      points: entry.points,
      pointsLabel: toPlainText(entry.pointsLabel),
      aliases: entry.aliases.map(toPlainText),
      source: entry.source === null ? null : toPlainText(entry.source),
      fields: entry.fields.map((field) => ({ label: field.label, html: renderInline(field.markdown) })),
      descriptionHtml: renderMarkdown(entry.description),
      systemHtml: renderMarkdown(entry.system),
    })),
  };
  const validated = advantageCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Catálogo de vantagens inválido: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
