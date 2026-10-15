import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildBlood } from '../../vite/buildBlood.ts';
import { generationEntry, potencyLevelEntry, potencyRow } from '../catalog/blood.ts';
import { BLOOD_POTENCY_RANGE } from '../domain/character.ts';

// Contract between "Gerações e Potência.md" and the app: every generation the
// sheet accepts and every Blood Potency level must have something to show.
const NOTE = fileURLToPath(new URL('../../../O Sangue (Vitae)/Gerações e Potência.md', import.meta.url));
const build = buildBlood(NOTE);

describe('Gerações e Potência.md', () => {
  it('builds without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it('covers every generation the sheet accepts (4ª to 16ª)', () => {
    const missing = Array.from({ length: 13 }, (_, offset) => offset + 4).filter((generation) => generationEntry(build.data, generation) === null);
    expect(missing).toEqual([]);
    expect(generationEntry(build.data, 12)?.title).toBe('Neonatos: 12ª e 13ª Gerações');
  });

  it('has a table row and a section for every Blood Potency level', () => {
    for (let level = BLOOD_POTENCY_RANGE.min; level <= BLOOD_POTENCY_RANGE.max; level += 1) {
      expect(potencyRow(build.data, level)?.level, `row ${level}`).toBe(level);
      expect(potencyLevelEntry(build.data, level), `section ${level}`).not.toBeNull();
    }
  });

  // Companion p. 63 errata: Blood Surge and Bane Severity are one higher than the first Core printing.
  it('follows the Companion errata (spot check)', () => {
    expect(potencyRow(build.data, 0)).toMatchObject({ surge: '+1 dado', mend: '1 Superficial', rouseReRoll: 'Nenhum', baneSeverity: '0' });
    expect(potencyRow(build.data, 1)).toMatchObject({ surge: '+2 dados', mend: '1 Superficial', rouseReRoll: 'Nível 1', baneSeverity: '2' });
    expect(potencyRow(build.data, 3)).toMatchObject({ surge: '+3 dados', mend: '2 Superficial', rouseReRoll: 'Nível 2 ou menor', baneSeverity: '3' });
    expect(potencyRow(build.data, 5)).toMatchObject({ surge: '+4 dados', mend: '3 Superficial', rouseReRoll: 'Nível 3 ou menor', baneSeverity: '4' });
    expect(potencyRow(build.data, 10)).toMatchObject({ surge: '+6 dados', mend: '5 Superficial', rouseReRoll: 'Nível 5 ou menor', baneSeverity: '6' });
  });
});
