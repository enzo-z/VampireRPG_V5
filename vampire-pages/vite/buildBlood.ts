import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseBloodNote } from '../src/catalog/parseBlood.ts';
import { bloodCatalogSchema } from '../src/catalog/schema.ts';
import type { BloodCatalog } from '../src/catalog/types.ts';
import { renderMarkdown, toPlainText } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads Gerações e Potência.md (if published) and builds generations and the Blood Potency table. */
export function buildBlood(notePath: string): VaultModuleBuild<BloodCatalog> {
  const empty: BloodCatalog = { generations: [], potencyLevels: [], potencyTable: [] };
  if (!existsSync(notePath)) return { data: empty, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parseBloodNote(basename(notePath, '.md'), readFileSync(notePath, 'utf8'));
  if (result.status === 'unpublished') return { data: empty, files: [notePath], errors: [], warnings: ['Gerações e Potência.md sem publicar: true.'] };

  const data: BloodCatalog = {
    generations: result.generations
      .filter((generation) => generation.generations.length > 0)
      .map((generation) => ({ title: generation.title, generations: generation.generations, html: renderMarkdown(generation.markdown) })),
    potencyLevels: result.levels.map((level) => ({ level: level.level, orMore: level.orMore, html: renderMarkdown(level.markdown) })),
    potencyTable: result.table.map((row) => ({
      level: row.level,
      surge: toPlainText(row.surge),
      mend: toPlainText(row.mend),
      disciplineBonus: toPlainText(row.disciplineBonus),
      rouseReRoll: toPlainText(row.rouseReRoll),
      baneSeverity: toPlainText(row.baneSeverity),
      feeding: toPlainText(row.feeding),
    })),
  };
  const validated = bloodCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Catálogo de Gerações e Potência inválido: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
