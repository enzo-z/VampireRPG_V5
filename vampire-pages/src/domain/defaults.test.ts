import { describe, expect, it } from 'vitest';
import { createFicha } from './defaults.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS } from './traits.ts';

describe('createFicha', () => {
  const ficha = createFicha('id-1', 'Nina', 'Jogador 1');

  it('starts Saúde at 7 and Willpower at 5 with 12 empty boxes each', () => {
    expect(ficha.trackers.health).toEqual({ max: 7, boxes: Array(12).fill(0) });
    expect(ficha.trackers.willpower).toEqual({ max: 5, boxes: Array(12).fill(0) });
  });

  it('starts with no Hunger and Humanidade 7', () => {
    expect(ficha.trackers.hunger).toBe(0);
    expect(ficha.trackers.humanity).toEqual([2, 2, 2, 2, 2, 2, 2, 0, 0, 0]);
  });

  it('has six empty discipline slots', () => {
    expect(ficha.disciplines).toHaveLength(6);
    expect(ficha.disciplines.every((d) => d.name === '' && d.value === 0 && d.powers.length === 0)).toBe(true);
  });

  it('has every attribute at 1 and every skill at 0', () => {
    expect(Object.keys(ficha.attributes)).toEqual([...ATTRIBUTE_KEYS]);
    expect(Object.values(ficha.attributes).every((v) => v === 1)).toBe(true);
    expect(Object.keys(ficha.skills)).toEqual([...SKILL_KEYS]);
    expect(Object.values(ficha.skills).every((v) => v === 0)).toBe(true);
  });

  it('keeps id, name and player', () => {
    expect([ficha.id, ficha.name, ficha.identity.player]).toEqual(['id-1', 'Nina', 'Jogador 1']);
  });
});
