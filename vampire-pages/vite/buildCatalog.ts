import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseDisciplineNote, type ParsedNote } from '../src/catalog/parseNote.ts';
import { disciplineCatalogSchema } from '../src/catalog/schema.ts';
import type { CatalogNote, DisciplineCatalog } from '../src/catalog/types.ts';
import { renderInline, renderMarkdown, toPlainText } from './markdown.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

export interface CatalogBuild {
  catalog: DisciplineCatalog;
  files: string[];
  errors: string[];
  warnings: string[];
}

export function buildDisciplineModule(notesDir: string): VaultModuleBuild<DisciplineCatalog> {
  const { catalog, ...rest } = buildCatalog(notesDir);
  return { data: catalog, ...rest };
}

function toCatalogNote(note: ParsedNote): CatalogNote {
  return {
    noteName: note.noteName,
    kind: note.kind,
    discipline: note.discipline,
    nicknames: note.nicknames,
    category: note.category,
    masquerade: note.masquerade,
    resonance: note.resonance,
    introHtml: renderMarkdown(note.intro),
    sections: note.sections.map((section) => ({ title: section.title, html: renderMarkdown(section.markdown) })),
    entries: note.entries.map((entry) => ({
      name: entry.name,
      level: entry.level,
      kind: entry.kind,
      source: entry.source === null ? null : toPlainText(entry.source),
      fields: entry.fields.map((field) => ({ label: field.label, html: renderInline(field.markdown) })),
      descriptionHtml: renderMarkdown(entry.description),
      systemHtml: renderMarkdown(entry.system),
    })),
  };
}

/** Reads every published note in the directory and builds the validated catalog. */
export function buildCatalog(notesDir: string): CatalogBuild {
  const files = readdirSync(notesDir)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(notesDir, name));
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: CatalogNote[] = [];

  for (const file of files) {
    const result = parseDisciplineNote(basename(file, '.md'), readFileSync(file, 'utf8'));
    if (result.status === 'invalid') errors.push(...result.errors);
    if (result.status === 'parsed') {
      warnings.push(...result.warnings);
      notes.push(toCatalogNote(result.note));
    }
  }

  const validated = disciplineCatalogSchema.safeParse({ notes });
  if (!validated.success) errors.push(`Catálogo inválido: ${validated.error.message}`);
  return { catalog: { notes }, files, errors, warnings };
}
