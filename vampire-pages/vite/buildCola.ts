import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseColaNote } from '../src/catalog/parseCola.ts';
import { colaCatalogSchema } from '../src/catalog/schema.ts';
import type { ColaCatalog } from '../src/catalog/types.ts';
import { renderMarkdown } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads Cola do Jogador.md (if published) and builds the cheat sheet blocks. */
export function buildCola(notePath: string): VaultModuleBuild<ColaCatalog> {
  const empty: ColaCatalog = { blocks: [] };
  if (!existsSync(notePath)) return { data: empty, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parseColaNote(basename(notePath, '.md'), readFileSync(notePath, 'utf8'));
  if (result.status === 'unpublished') return { data: empty, files: [notePath], errors: [], warnings: ['Cola do Jogador.md sem publicar: true.'] };

  const data: ColaCatalog = {
    blocks: result.blocks.map((block) => ({
      title: block.title,
      html: renderMarkdown(block.markdown),
      entries: block.entries.map((entry) => ({ term: entry.term, html: renderMarkdown(entry.markdown) })),
    })),
  };
  const validated = colaCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Cola inválida: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
