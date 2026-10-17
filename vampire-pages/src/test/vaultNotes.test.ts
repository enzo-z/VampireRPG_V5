import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildVault } from '../../vite/buildVault.ts';

// Contract between the vault notes marked "vault: <group>" and the app's Vault view.
const VAULT_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const build = buildVault({
  root: VAULT_ROOT,
  folders: ['Regras', 'Fome, a Caça e a Besta', 'O Sangue (Vitae)', 'Lore'],
  attachmentFolders: ['Images', 'Audio'],
});
const notes = build.data.notes;
const note = (slug: string) => notes.find((candidate) => candidate.slug === slug);

describe('Vault notes', () => {
  it('build without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it('publish the agreed notes, in reading order', () => {
    expect(notes.map((candidate) => candidate.slug)).toEqual([
      'kindred',
      'regras-fundamentais',
      'dificuldade-contests-e-conflitos',
      'dano',
      'regras-avancadas',
      'fome',
      'frenzy',
      'hunting-and-feeding',
      'predator-type',
      'perigos-do-sangue',
      'camarilla',
    ]);
  });

  it('bundle only files that exist', () => {
    expect(build.assets?.filter((file) => !existsSync(file))).toEqual([]);
  });

  it.each(notes.map((candidate) => candidate.slug))('%s: keeps Obsidian-only syntax out', (slug) => {
    const html = note(slug)?.html ?? '';
    expect(html).not.toMatch(/\[\[|\]\]|!\[|Sumário|TODO|table-of-contents/);
    expect(html).not.toMatch(/#(concept|rules|lore|important)\b/);
  });

  it('turns the difficulty table image into a zebra-ready table', () => {
    const html = note('dificuldade-contests-e-conflitos')?.html ?? '';
    expect(html).toContain('<div data-table-scroll><table>');
    expect(html).toContain('Quase impossível');
  });
});
