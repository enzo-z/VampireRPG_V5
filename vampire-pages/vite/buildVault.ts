import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { normalizeLabel } from '../src/catalog/parseNote.ts';
import { parseVaultNote, type ParsedVaultNote } from '../src/catalog/parseVaultNote.ts';
import { vaultCatalogSchema } from '../src/catalog/schema.ts';
import type { VaultCatalog, VaultNote } from '../src/catalog/types.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';
import { collectVaultHeadings, renderVaultMarkdown, slugify, type VaultEmbed, type VaultLinkTarget } from './vaultMarkdown.ts';

export interface VaultSources {
  /** Vault root; only its own .md files are read (subfolders come from `folders`). */
  root: string;
  /** Folders read recursively. Narrator material stays out by not being listed. */
  folders: readonly string[];
  /** Folders where embedded files (images, audio) are looked up by file name, like Obsidian does. */
  attachmentFolders: readonly string[];
}

const IMAGE_EXTENSIONS: ReadonlySet<string> = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const AUDIO_EXTENSIONS: ReadonlySet<string> = new Set(['.m4a', '.mp3', '.ogg', '.wav']);

function listFiles(dir: string, recursive: boolean, accept: (name: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return recursive ? listFiles(path, true, accept) : [];
    return accept(entry.name) ? [path] : [];
  });
}

const isNote = (name: string) => name.toLowerCase().endsWith('.md');
const noteKey = (name: string) => normalizeLabel(name.split('/').at(-1)?.replace(/\.md$/i, '') ?? name);

/** Every .md file the Vault may publish: the root's own notes plus the listed folders. */
export function vaultNoteFiles(sources: VaultSources): string[] {
  return [
    ...listFiles(sources.root, false, isNote),
    ...sources.folders.flatMap((folder) => listFiles(join(sources.root, folder), true, isNote)),
  ];
}

/** Attachments by lower-case file name; the first one found wins. */
function attachmentIndex(sources: VaultSources): Map<string, string> {
  const index = new Map<string, string>();
  for (const folder of sources.attachmentFolders) {
    const accept = (name: string) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()) || AUDIO_EXTENSIONS.has(extname(name).toLowerCase());
    for (const file of listFiles(join(sources.root, folder), true, accept)) {
      const key = basename(file).toLowerCase();
      if (!index.has(key)) index.set(key, file);
    }
  }
  return index;
}

interface PublishedNote {
  file: string;
  slug: string;
  parsed: ParsedVaultNote;
}

/** Reads every note with publicar: true and vault: <group>, and renders it for the Vault view. */
export function buildVault(sources: VaultSources): VaultModuleBuild<VaultCatalog> {
  const files = vaultNoteFiles(sources);
  const errors: string[] = [];
  const warnings: string[] = [];

  const published: PublishedNote[] = [];
  for (const file of files) {
    const result = parseVaultNote(basename(file, '.md'), readFileSync(file, 'utf8'));
    if (result.status === 'unpublished') continue;
    warnings.push(...result.warnings);
    published.push({ file, slug: slugify(result.note.noteName), parsed: result.note });
  }

  const targets = new Map<string, VaultLinkTarget>();
  for (const note of published) {
    const key = noteKey(note.parsed.noteName);
    if (targets.has(key)) {
      errors.push(`Duas notas publicadas com o nome "${note.parsed.noteName}"; renomeie uma delas.`);
      continue;
    }
    const headingIds = new Set(collectVaultHeadings(note.parsed.markdown).map((heading) => heading.id));
    targets.set(key, { slug: note.slug, headingIds });
  }

  const attachments = attachmentIndex(sources);
  const assets: string[] = [];
  const embed = (fileName: string): VaultEmbed | null => {
    const file = attachments.get(fileName.toLowerCase());
    if (file === undefined) return null;
    let asset = assets.indexOf(file);
    if (asset === -1) asset = assets.push(file) - 1;
    return { kind: IMAGE_EXTENSIONS.has(extname(file).toLowerCase()) ? 'image' : 'audio', asset };
  };

  const notes: VaultNote[] = published.map(({ slug, parsed }) => {
    const warn = (message: string) => warnings.push(`${parsed.noteName}: ${message}`);
    const self = targets.get(noteKey(parsed.noteName)) ?? null;
    const rendered = renderVaultMarkdown(parsed.markdown, {
      findNote: (name) => (name === '' ? self : (targets.get(noteKey(name)) ?? null)),
      embed,
      warn,
    });
    let banner: number | null = null;
    if (parsed.banner !== null) {
      const found = embed(parsed.banner);
      if (found?.kind === 'image') banner = found.asset;
      else warn(`banner "${parsed.banner}" não encontrado em ${sources.attachmentFolders.join(', ')}.`);
    }
    return {
      slug,
      title: parsed.noteName,
      group: parsed.group,
      order: parsed.order,
      banner,
      html: rendered.html,
      headings: rendered.headings,
      sections: rendered.sections,
    };
  });
  notes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'pt-BR'));

  const data: VaultCatalog = { notes };
  const validated = vaultCatalogSchema.safeParse(data);
  if (!validated.success) errors.push(`Vault inválido: ${validated.error.message}`);
  return { data, files, errors, warnings, assets };
}
