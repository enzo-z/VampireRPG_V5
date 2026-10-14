import { describe, expect, it } from 'vitest';
import { createFicha } from '../domain/defaults.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS } from '../domain/traits.ts';
import { CORE_ATTRIBUTES } from './attributes.ts';
import { CORE_SKILLS } from './skills.ts';
import { isSameSelection, referenceFor } from './lookup.ts';

const base = createFicha('nina', 'Nina');
const ficha = {
  ...base,
  attributes: { ...base.attributes, manipulation: 4 },
  skills: { ...base.skills, performance: 3 },
  specs: { performance: 'Canto' },
  identity: { ...base.identity, clan: 'assamita', sect: 'Camarila' },
  disciplines: base.disciplines.with(0, { name: 'Presence', value: 3, powers: [{ name: 'Awe', note: 'Nv 1' }] }),
};

describe('ported reference text', () => {
  it('covers every attribute and skill with five level descriptions', () => {
    for (const key of ATTRIBUTE_KEYS) expect(CORE_ATTRIBUTES[key].levels).toHaveLength(5);
    for (const key of SKILL_KEYS) expect(CORE_SKILLS[key].levels).toHaveLength(5);
  });
});

describe('referenceFor', () => {
  it('shows an attribute with its group, value and current level', () => {
    const entry = referenceFor({ kind: 'attribute', key: 'manipulation' }, ficha);
    expect(entry).toMatchObject({ kicker: 'Atributo · Social', title: 'Manipulation', dots: { value: 4, max: 5 }, currentLevel: 4 });
    expect(entry?.source).toMatch(/^CORE/);
  });

  it('shows a skill with its specialization', () => {
    const entry = referenceFor({ kind: 'skill', key: 'performance' }, ficha);
    expect(entry?.kicker).toBe('Perícia · Social');
    expect(entry?.facts[0]).toEqual({ label: 'Especialização', value: 'Canto' });
  });

  it('uses the table label for renamed skills', () => {
    expect(referenceFor({ kind: 'skill', key: 'animalKen' }, ficha)?.title).toBe('Animal Handling');
  });

  it('shows disciplines and powers from the ficha', () => {
    expect(referenceFor({ kind: 'discipline', slot: 0 }, ficha)).toMatchObject({
      title: 'Presence',
      dots: { value: 3, max: 5 },
      facts: [{ label: 'Poderes', value: 'Awe' }],
    });
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 0 }, ficha)).toMatchObject({
      kicker: 'Poder · Presence',
      title: 'Awe',
      facts: [{ label: 'Nota', value: 'Nv 1' }],
    });
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 3 }, ficha)).toBeNull();
    expect(referenceFor({ kind: 'discipline', slot: 9 }, ficha)).toBeNull();
  });

  it('matches identity text against the catalog or lists the options', () => {
    expect(referenceFor({ kind: 'identity', field: 'clan' }, ficha)?.title).toBe('Banu Haqim');
    const unmatched = referenceFor({ kind: 'identity', field: 'sect' }, ficha);
    expect(unmatched?.paragraphs[0]).toContain('Sem correspondência para "Camarila"');
    expect(unmatched?.facts[0]?.value).toContain('Camarilla');
  });

  it('summarizes trackers', () => {
    expect(referenceFor({ kind: 'tracker', tracker: 'health' }, ficha)?.facts).toEqual([
      { label: 'Máximo', value: '7' },
      { label: 'Superficial', value: '0' },
      { label: 'Agravado', value: '0' },
    ]);
    expect(referenceFor({ kind: 'tracker', tracker: 'humanity' }, ficha)?.facts[0]).toEqual({ label: 'Humanidade', value: '7' });
  });
});

describe('isSameSelection', () => {
  it('compares selections by value', () => {
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'brawl' })).toBe(true);
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'melee' })).toBe(false);
    expect(isSameSelection(null, { kind: 'skill', key: 'melee' })).toBe(false);
  });
});
