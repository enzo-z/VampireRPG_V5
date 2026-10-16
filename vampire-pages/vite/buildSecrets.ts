import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { normalizeLabel } from '../src/catalog/parseNote.ts';
import { parseSecretNote } from '../src/catalog/parseSecret.ts';
import { secretsCatalogSchema } from '../src/catalog/schema.ts';
import type { SecretDocument, SecretsCatalog } from '../src/catalog/types.ts';
import { renderMarkdown } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

const README_FILE = /^README\s*-\s*.+\.md$/i;

/** Reads every published "README - Name.md" in the players' folder and builds their secret documents. */
export function buildSecrets(notesDir: string): VaultModuleBuild<SecretsCatalog> {
  if (!existsSync(notesDir)) return { data: { documents: [] }, files: [], errors: [], warnings: [`${notesDir} não encontrado.`] };

  const files = readdirSync(notesDir)
    .filter((name) => README_FILE.test(name))
    .map((name) => join(notesDir, name));
  const warnings: string[] = [];
  const documents: SecretDocument[] = [];
  for (const file of files) {
    const result = parseSecretNote(basename(file, '.md'), readFileSync(file, 'utf8'));
    if (result.status === 'unpublished') continue;
    warnings.push(...result.warnings);
    const { document } = result;
    documents.push({
      slug: normalizeLabel(document.character).replace(/ /g, '-'),
      character: document.character,
      title: document.title,
      introHtml: renderMarkdown(document.intro),
      sections: document.sections.map((section) => ({ title: section.title, html: renderMarkdown(section.markdown) })),
    });
  }
  documents.sort((a, b) => a.character.localeCompare(b.character, 'pt-BR'));

  const data: SecretsCatalog = { documents };
  const validated = secretsCatalogSchema.safeParse(data);
  const errors = validated.success ? [] : [`Segredos inválidos: ${validated.error.message}`];
  return { data, files, errors, warnings };
}
