import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildPredatorTypes } from '../../vite/buildPredatorTypes.ts';
import { findPredatorType, indexPredatorTypes } from '../catalog/predatorTypes.ts';
import { matchIdentity } from '../domain/identityCatalog.ts';

// Contract between "Predator Type.md" and the app: the predator types written on
// the players' sheets must show their rules in the reference panel.
const NOTE = fileURLToPath(new URL('../../../Fome, a Caça e a Besta/Predator Type.md', import.meta.url));
const build = buildPredatorTypes(NOTE);
const index = indexPredatorTypes(build.data);

const SHEET_TYPES: readonly [string, string][] = [
  ['Scene Queen', 'Scene-Queen'],
  ['Blood Leech', 'Headhunter/Blood Leech'],
  ['Pursuer', 'Pursuer'],
  ['Alleycat', 'Alleycat'],
  ['Bagger', 'Bagger'],
];

describe('Predator Type.md', () => {
  it('builds without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it.each(SHEET_TYPES)('"%s" (as on the sheet) shows the rules of %s', (written, title) => {
    expect(findPredatorType(index, written)?.title).toBe(title);
  });

  it('every section is a predator type the identity field recognizes', () => {
    const unknown = build.data.entries.filter((entry) => !entry.names.some((name) => matchIdentity('predatorType', name).matched));
    expect(unknown.map((entry) => entry.title)).toEqual([]);
  });

  it('the Pursuer cites its book', () => {
    expect(findPredatorType(index, 'Pursuer')?.source).toContain("Player's Guide");
  });
});
