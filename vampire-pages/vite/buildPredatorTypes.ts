import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parsePredatorTypeNote } from '../src/catalog/parsePredatorTypes.ts';
import { predatorTypeCatalogSchema } from '../src/catalog/schema.ts';
import type { PredatorTypeCatalog } from '../src/catalog/types.ts';
import { renderMarkdown, toPlainText } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads Predator Type.md (if published) and builds the validated predator type catalog. */
export function buildPredatorTypes(notePath: string): VaultModuleBuild<PredatorTypeCatalog> {
  const empty: PredatorTypeCatalog = { entries: [] };
  if (!existsSync(notePath)) return { data: empty, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parsePredatorTypeNote(basename(notePath, '.md'), readFileSync(notePath, 'utf8'));
  if (result.status === 'unpublished') return { data: empty, files: [notePath], errors: [], warnings: ['Predator Type.md sem publicar: true.'] };

  const data: PredatorTypeCatalog = {
    entries: result.entries.map((entry) => ({
      title: entry.title,
      names: entry.names,
      source: entry.source === null ? null : toPlainText(entry.source),
      html: renderMarkdown(entry.markdown),
    })),
  };
  const validated = predatorTypeCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Catálogo de Predator Types inválido: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
