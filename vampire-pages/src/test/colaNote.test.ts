import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildCola } from '../../vite/buildCola.ts';
import { colaBlock } from '../catalog/cola.ts';

// Contract between "Regras/Cola do Jogador.md" and the printed cheat sheet: the
// page lays out these blocks, so the note must have all of them.
const NOTE = fileURLToPath(new URL('../../../Regras/Cola do Jogador.md', import.meta.url));
const build = buildCola(NOTE);

const REQUIRED = ['Como rolar', 'Lendo os dados', 'Fome', 'Rouse Check', 'Willpower', 'Blood Surge', 'Curar (Mending)', 'Humanidade', 'Termos', 'Clãs'];

describe('Cola do Jogador.md', () => {
  it('builds without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it.each(REQUIRED)('has the "%s" block', (title) => {
    expect(colaBlock(build.data, title), title).not.toBeNull();
  });

  it('keeps the Obsidian-only links out of the page', () => {
    expect(colaBlock(build.data, 'Para saber mais')).toBeNull();
  });

  it('lists terms and clans as entries', () => {
    expect(colaBlock(build.data, 'Termos')?.entries.length).toBeGreaterThanOrEqual(8);
    expect(colaBlock(build.data, 'Clãs')?.entries.map((entry) => entry.term)).toContain('Toreador');
  });
});
