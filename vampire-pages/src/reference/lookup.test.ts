import { describe, expect, it } from 'vitest';
import { indexCatalog } from '../catalog/lookup.ts';
import type { CatalogEntry, DisciplineCatalog } from '../catalog/types.ts';
import { createFicha } from '../domain/defaults.ts';
import { ATTRIBUTE_KEYS, SKILL_KEYS } from '../domain/traits.ts';
import { CORE_ATTRIBUTES } from './attributes.ts';
import { CORE_SKILLS } from './skills.ts';
import { isSameSelection, referenceFor } from './lookup.ts';

function entry(name: string, level: number, kind: CatalogEntry['kind'] = 'power'): CatalogEntry {
  return {
    name,
    level,
    kind,
    source: 'Core, p. 1',
    fields: [{ label: 'Custo', html: 'Free' }],
    descriptionHtml: '<p>Descrição.</p>',
    systemHtml: '<p>Sistema.</p>',
  };
}

const catalog: DisciplineCatalog = {
  notes: [
    {
      noteName: 'Presence',
      kind: 'disciplina',
      discipline: 'Presence',
      nicknames: ['Superstardom'],
      category: 'Mental',
      masquerade: 'Baixa-Média',
      resonance: 'Sanguine',
      introHtml: '<p>Intro.</p>',
      sections: [{ title: 'Regras Gerais de Presence', html: '<p>Regra.</p>' }],
      entries: [entry('Awe', 1), entry('Daunt', 1), entry('Lingering Kiss', 2), entry('Majesty', 5)],
    },
  ],
};
const index = indexCatalog(catalog);

const base = createFicha('nina', 'Nina');
const ficha = {
  ...base,
  attributes: { ...base.attributes, manipulation: 4 },
  skills: { ...base.skills, performance: 3 },
  specs: { performance: 'Canto' },
  identity: { ...base.identity, clan: 'assamita', sect: 'Camarila' },
  disciplines: base.disciplines
    .with(0, { name: 'Presença', value: 2, powers: [{ name: 'awe', note: 'Nv 1' }, { name: 'Inventado', note: '' }] })
    .with(1, { name: 'Vicissitude', value: 1, powers: [] }),
};

describe('ported reference text', () => {
  it('covers every attribute and skill with five level descriptions', () => {
    for (const key of ATTRIBUTE_KEYS) expect(CORE_ATTRIBUTES[key].levels).toHaveLength(5);
    for (const key of SKILL_KEYS) expect(CORE_SKILLS[key].levels).toHaveLength(5);
  });
});

describe('referenceFor', () => {
  it('shows an attribute with its group, value and current level', () => {
    const result = referenceFor({ kind: 'attribute', key: 'manipulation' }, ficha, index);
    expect(result).toMatchObject({ kicker: 'Atributo · Social', title: 'Manipulation', dots: { value: 4, max: 5 }, currentLevel: 4 });
    expect(result?.source).toMatch(/^CORE/);
  });

  it('shows a skill with its specialization', () => {
    const result = referenceFor({ kind: 'skill', key: 'performance' }, ficha, index);
    expect(result?.kicker).toBe('Perícia · Social');
    expect(result?.facts[0]).toEqual({ label: 'Especialização', value: 'Canto' });
  });

  it('uses the table label for renamed skills', () => {
    expect(referenceFor({ kind: 'skill', key: 'animalKen' }, ficha, index)?.title).toBe('Animal Handling');
  });

  it('shows a discipline from the catalog, matched through its Portuguese name', () => {
    expect(referenceFor({ kind: 'discipline', slot: 0 }, ficha, index)).toMatchObject({
      kicker: 'Disciplina · Mental',
      title: 'Presence',
      dots: { value: 2, max: 5 },
      facts: [
        { label: 'Na ficha', value: 'awe, Inventado' },
        { label: 'Ameaça à Máscara', value: 'Baixa-Média' },
        { label: 'Resonance', value: 'Sanguine' },
        { label: 'Apelidos', value: 'Superstardom' },
      ],
      blocks: [
        { title: null, html: '<p>Intro.</p>' },
        { title: 'Regras Gerais de Presence', html: '<p>Regra.</p>' },
      ],
      catalogLevels: [
        { level: 1, names: ['Awe', 'Daunt'] },
        { level: 2, names: ['Lingering Kiss'] },
        { level: 5, names: ['Majesty'] },
      ],
    });
  });

  it('says when a discipline is not in the catalog', () => {
    const result = referenceFor({ kind: 'discipline', slot: 1 }, ficha, index);
    expect(result?.paragraphs[0]).toBe('"Vicissitude" não foi encontrada no catálogo de disciplinas.');
    expect(result?.catalogLevels).toBeNull();
  });

  it('shows a power from the catalog with its fields, description and system', () => {
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 0 }, ficha, index)).toMatchObject({
      kicker: 'Poder · Presence',
      title: 'Awe',
      source: 'Core, p. 1',
      dots: { value: 1, max: 5 },
      facts: [
        { label: 'Custo', html: 'Free' },
        { label: 'Nota na ficha', value: 'Nv 1' },
      ],
      blocks: [
        { title: null, html: '<p>Descrição.</p>' },
        { title: 'Sistema', html: '<p>Sistema.</p>' },
      ],
    });
  });

  it('lists the options up to the discipline level when a power is not found', () => {
    const result = referenceFor({ kind: 'power', slot: 0, powerIndex: 1 }, ficha, index);
    expect(result?.paragraphs[0]).toBe('"Inventado" não foi encontrado no catálogo de Presença.');
    expect(result?.facts).toEqual([{ label: 'Opções até o nível 2', value: 'Awe, Daunt, Lingering Kiss' }]);
  });

  it('returns null for selections outside the sheet', () => {
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 3 }, ficha, index)).toBeNull();
    expect(referenceFor({ kind: 'discipline', slot: 9 }, ficha, index)).toBeNull();
  });

  it('matches identity text against the catalog or lists the options', () => {
    expect(referenceFor({ kind: 'identity', field: 'clan' }, ficha, index)?.title).toBe('Banu Haqim');
    const unmatched = referenceFor({ kind: 'identity', field: 'sect' }, ficha, index);
    expect(unmatched?.paragraphs[0]).toContain('Sem correspondência para "Camarila"');
    const options = unmatched?.facts[0];
    expect(options !== undefined && 'value' in options ? options.value : '').toContain('Camarilla');
  });

  it('summarizes trackers', () => {
    expect(referenceFor({ kind: 'tracker', tracker: 'health' }, ficha, index)?.facts).toEqual([
      { label: 'Máximo', value: '7' },
      { label: 'Superficial', value: '0' },
      { label: 'Agravado', value: '0' },
    ]);
    expect(referenceFor({ kind: 'tracker', tracker: 'humanity' }, ficha, index)?.facts[0]).toEqual({ label: 'Humanidade', value: '7' });
  });
});

describe('isSameSelection', () => {
  it('compares selections by value', () => {
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'brawl' })).toBe(true);
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'melee' })).toBe(false);
    expect(isSameSelection(null, { kind: 'skill', key: 'melee' })).toBe(false);
  });
});
