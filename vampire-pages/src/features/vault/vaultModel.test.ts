import { describe, expect, it } from 'vitest';
import type { VaultNote } from '../../catalog/types.ts';
import { resolveVaultAssets } from './vaultAssets.ts';
import { groupVaultNotes, vaultNeighbors, vaultToc } from './vaultIndex.ts';
import { isVaultHash, parseVaultHash, vaultHash } from './vaultRoute.ts';
import { foldText, queryWords, searchVault, snippetAround } from './vaultSearch.ts';

function vaultNote(slug: string, group: string, sections: VaultNote['sections'] = [], headings: VaultNote['headings'] = []): VaultNote {
  return { slug, title: slug.toUpperCase(), group, order: 0, banner: null, html: '<p></p>', headings, sections };
}

describe('vault route', () => {
  it('round-trips home, note and heading', () => {
    expect(parseVaultHash(vaultHash(null))).toEqual({ slug: null, headingId: null });
    expect(parseVaultHash(vaultHash('dano'))).toEqual({ slug: 'dano', headingId: null });
    expect(parseVaultHash(vaultHash('dano', 'margem'))).toEqual({ slug: 'dano', headingId: 'margem' });
  });

  it('ignores other hashes and survives malformed ones', () => {
    expect(isVaultHash('#/vaultx')).toBe(false);
    expect(parseVaultHash('')).toBeNull();
    expect(parseVaultHash('#/vault/%E0%A4%A')).toEqual({ slug: null, headingId: null });
  });
});

describe('resolveVaultAssets', () => {
  it('replaces asset markers with bundled URLs', () => {
    expect(resolveVaultAssets('<img data-vault-asset="1" alt="">', ['/a.png', '/b "x".png'])).toBe('<img src="/b &quot;x&quot;.png" alt="">');
    expect(resolveVaultAssets('<img data-vault-asset="9">', [])).toBe('<img data-vault-asset="9">');
  });
});

describe('vault index', () => {
  const notes = [vaultNote('kindred', 'Regras'), vaultNote('fome', 'Fome'), vaultNote('dano', 'Regras')];

  it('groups notes in order of first appearance', () => {
    expect(groupVaultNotes(notes).map((group) => [group.name, group.notes.map((note) => note.slug)])).toEqual([
      ['Regras', ['kindred', 'dano']],
      ['Fome', ['fome']],
    ]);
  });

  it('finds the previous and next notes', () => {
    expect(vaultNeighbors(notes, 'fome')).toEqual({ previous: notes[0], next: notes[2] });
    expect(vaultNeighbors(notes, 'nada')).toEqual({ previous: null, next: null });
  });

  it('keeps the two outermost heading levels in the table of contents', () => {
    const note = vaultNote('x', 'g', [], [
      { id: 'a', title: 'A', depth: 2 },
      { id: 'b', title: 'B', depth: 3 },
      { id: 'c', title: 'C', depth: 4 },
    ]);
    expect(vaultToc(note).map((heading) => heading.id)).toEqual(['a', 'b']);
  });
});

describe('vault search', () => {
  it('folds accents and case, mapping back to the original text', () => {
    expect(foldText('Ação É')).toEqual({ folded: 'acao e', map: [0, 1, 2, 3, 4, 5] });
    expect(queryWords('  a ')).toEqual([]);
    expect(queryWords('Rouse  CHECK')).toEqual(['rouse', 'check']);
  });

  it('cuts a snippet around the match, keeping the original accents', () => {
    expect(snippetAround('O vampiro entra em torpor por décadas.', 'decadas')).toEqual({
      before: 'O vampiro entra em torpor por ',
      match: 'décadas',
      after: '.',
    });
  });

  it('needs every word, and ranks title matches first', () => {
    const notes = [
      vaultNote('kindred', 'Regras', [{ headingId: 'rouse', title: 'Introdução', text: 'Faça um Rouse Check ao acordar.' }]),
      vaultNote('fome', 'Fome', [{ headingId: 'rouse-check', title: 'Rouse Check', text: 'Role um dado.' }]),
    ];
    expect(searchVault(notes, 'rouse check').map((hit) => hit.slug)).toEqual(['fome', 'kindred']);
    expect(searchVault(notes, 'rouse sangue')).toEqual([]);
    expect(searchVault(notes, 'acordar')[0]?.snippet.match).toBe('acordar');
  });
});
