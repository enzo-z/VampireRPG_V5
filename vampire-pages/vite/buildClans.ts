import { existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseClansNote } from '../src/catalog/parseClans.ts';
import { clanCatalogSchema } from '../src/catalog/schema.ts';
import type { ClanCatalog } from '../src/catalog/types.ts';
import { renderMarkdown, toPlainText } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads Clãs.md (if published) and builds the clan profiles with their banes and compulsions. */
export function buildClans(notePath: string): VaultModuleBuild<ClanCatalog> {
  const empty: ClanCatalog = { entries: [] };
  if (!existsSync(notePath)) return { data: empty, files: [], errors: [], warnings: [`${notePath} não encontrado.`] };

  const result = parseClansNote(basename(notePath, '.md'), readFileSync(notePath, 'utf8'));
  if (result.status === 'unpublished') return { data: empty, files: [notePath], errors: [], warnings: ['Clãs.md sem publicar: true.'] };

  const data: ClanCatalog = {
    entries: result.clans.map((clan) => ({
      name: clan.name,
      aliases: clan.aliases.map(toPlainText),
      source: clan.source === null ? null : toPlainText(clan.source),
      sect: toPlainText(clan.sect),
      disciplines: clan.disciplines.map(toPlainText),
      baneSummary: toPlainText(clan.baneSummary),
      compulsionSummary: toPlainText(clan.compulsionSummary),
      descriptionHtml: renderMarkdown(clan.description),
      bane: clan.bane === null ? null : { title: clan.bane.title, html: renderMarkdown(clan.bane.markdown) },
      compulsion: clan.compulsion === null ? null : { title: clan.compulsion.title, html: renderMarkdown(clan.compulsion.markdown) },
    })),
  };
  const validated = clanCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Catálogo de clãs inválido: ${validated.error.message}`];
  return { data, files: [notePath], errors, warnings: result.warnings };
}
