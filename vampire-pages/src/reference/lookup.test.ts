import { describe, expect, it } from 'vitest';
import { indexAdvantages } from '../catalog/advantages.ts';
import { indexCatalog } from '../catalog/lookup.ts';
import { indexClans } from '../catalog/clans.ts';
import { indexPredatorTypes } from '../catalog/predatorTypes.ts';
import type { AdvantageEntry, CatalogEntry, DisciplineCatalog } from '../catalog/types.ts';
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
function advantage(name: string, category: AdvantageEntry['category'], group: string | null, aliases: string[], label: string, max: number): AdvantageEntry {
  return { name, category, group, points: { min: 1, max }, pointsLabel: label, aliases, source: 'Core, p. 2', fields: [], descriptionHtml: '', systemHtml: '<p>Regra.</p>' };
}

const catalogs = {
  disciplines: indexCatalog(catalog),
  advantages: indexAdvantages({
    entries: [
      advantage('Allies', 'background', null, ['Aliados'], '• a ••••••', 6),
      advantage('Haven', 'background', null, ['Refúgio'], '• a •••', 3),
      advantage('Prey Exclusion', 'flaw', 'Feeding', ['Exclusão de Presa'], '•', 1),
    ],
  }),
  predatorTypes: indexPredatorTypes({
    entries: [
      { title: 'Alleycat', names: ['Alleycat'], source: null, html: '<p>Ataque direto.</p>' },
      { title: 'Headhunter/Blood Leech', names: ['Headhunter', 'Blood Leech'], source: null, html: '<p>Sangue de vampiros.</p>' },
    ],
  }),
  blood: {
    generations: [{ title: 'Neonatos: 12ª e 13ª Gerações', generations: [12, 13], html: '<p>Recém-chegados.</p>' }],
    potencyLevels: [
      { level: 1, orMore: false, html: '<p>Vampiro verdadeiro.</p>' },
      { level: 6, orMore: true, html: '<p>Alienígenas.</p>' },
    ],
    potencyTable: Array.from({ length: 11 }, (_, level) => ({
      level,
      surge: `+${level} dados`,
      mend: `${level} Superficial`,
      disciplineBonus: 'Nenhum',
      rouseReRoll: `Nível ${level}`,
      baneSeverity: String(level),
      feeding: 'Sem efeito',
    })),
  },
  clans: indexClans({
    entries: [
      {
        name: 'Banu Haqim',
        aliases: ['Assamita'],
        source: "Player's Guide, p. 18",
        sect: 'Camarilla',
        disciplines: ['Celerity', 'Obfuscate', 'Blood Sorcery'],
        baneSummary: 'Vício em vitae.',
        compulsionSummary: 'Julgamento.',
        descriptionHtml: '<p>Juízes.</p>',
        bane: { title: 'Maldição dos Banu Haqim', html: '<p>Hunger frenzy.</p>' },
        compulsion: { title: 'Julgamento', html: '<p>Punir.</p>' },
      },
      {
        name: 'Caitiff',
        aliases: ['Sem clã'],
        source: 'Core, p. 107',
        sect: 'Qualquer',
        disciplines: ['Quaisquer três'],
        baneSummary: 'Sem Bane de clã.',
        compulsionSummary: 'Sem Compulsão de clã.',
        descriptionHtml: '<p>Sem linhagem.</p>',
        bane: null,
        compulsion: null,
      },
    ],
  }),
};

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
  advantages: [
    { category: 'background' as const, name: 'Allies (Augie Mendez)', level: 2, note: 'Augie Mendez' },
    { category: 'flaw' as const, name: 'exclusao de presa', level: 1, note: '' },
    { category: 'merit' as const, name: 'Refugo', level: 1, note: '' },
    { category: 'merit' as const, name: 'Ilha Perdida', level: 1, note: '' },
  ],
};

describe('ported reference text', () => {
  it('covers every attribute and skill with five level descriptions', () => {
    for (const key of ATTRIBUTE_KEYS) expect(CORE_ATTRIBUTES[key].levels).toHaveLength(5);
    for (const key of SKILL_KEYS) expect(CORE_SKILLS[key].levels).toHaveLength(5);
  });
});

describe('referenceFor', () => {
  it('shows an attribute with its group, value and current level', () => {
    const result = referenceFor({ kind: 'attribute', key: 'manipulation' }, ficha, catalogs);
    expect(result).toMatchObject({ kicker: 'Atributo · Social', title: 'Manipulation', dots: { value: 4, max: 5 }, currentLevel: 4 });
    expect(result?.source).toMatch(/^CORE/);
  });

  it('shows a skill with its specialization', () => {
    const result = referenceFor({ kind: 'skill', key: 'performance' }, ficha, catalogs);
    expect(result?.kicker).toBe('Perícia · Social');
    expect(result?.facts[0]).toEqual({ label: 'Especialização', value: 'Canto' });
  });

  it('uses the table label for renamed skills', () => {
    expect(referenceFor({ kind: 'skill', key: 'animalKen' }, ficha, catalogs)?.title).toBe('Animal Handling');
  });

  it('shows a discipline from the catalog, matched through its Portuguese name', () => {
    expect(referenceFor({ kind: 'discipline', slot: 0 }, ficha, catalogs)).toMatchObject({
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
    const result = referenceFor({ kind: 'discipline', slot: 1 }, ficha, catalogs);
    expect(result?.paragraphs[0]).toBe('"Vicissitude" não foi encontrada no catálogo de disciplinas.');
    expect(result?.catalogLevels).toBeNull();
  });

  it('shows a power from the catalog with its fields, description and system', () => {
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 0 }, ficha, catalogs)).toMatchObject({
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
    const result = referenceFor({ kind: 'power', slot: 0, powerIndex: 1 }, ficha, catalogs);
    expect(result?.paragraphs[0]).toBe('"Inventado" não foi encontrado no catálogo de Presença.');
    expect(result?.facts).toEqual([{ label: 'Opções até o nível 2', value: 'Awe, Daunt, Lingering Kiss' }]);
  });

  it('returns null for selections outside the sheet', () => {
    expect(referenceFor({ kind: 'power', slot: 0, powerIndex: 3 }, ficha, catalogs)).toBeNull();
    expect(referenceFor({ kind: 'discipline', slot: 9 }, ficha, catalogs)).toBeNull();
  });

  it('matches identity text against the catalog or lists the options', () => {
    expect(referenceFor({ kind: 'identity', field: 'clan' }, ficha, catalogs)?.title).toBe('Banu Haqim');
    const unmatched = referenceFor({ kind: 'identity', field: 'sect' }, ficha, catalogs);
    expect(unmatched?.paragraphs[0]).toContain('Sem correspondência para "Camarila"');
    const options = unmatched?.facts[0];
    expect(options !== undefined && 'value' in options ? options.value : '').toContain('Camarilla');
  });

  it('shows the rules of a predator type from the vault note, tolerating typos', () => {
    const withType = (predatorType: string) => ({ ...ficha, identity: { ...ficha.identity, predatorType } });
    expect(referenceFor({ kind: 'identity', field: 'predatorType' }, withType('Alleycat'), catalogs)).toMatchObject({
      kicker: 'Predator Type',
      title: 'Alleycat',
      paragraphs: [],
      blocks: [{ title: null, html: '<p>Ataque direto.</p>' }],
    });
    expect(referenceFor({ kind: 'identity', field: 'predatorType' }, withType('blood leech'), catalogs)?.title).toBe('Headhunter/Blood Leech');
    expect(referenceFor({ kind: 'identity', field: 'predatorType' }, withType('Aleycat'), catalogs)?.paragraphs).toEqual(['"Aleycat" lido como Alleycat.']);
  });

  it('recognizes a predator type with no rules yet, and says so', () => {
    const trapdoor = { ...ficha, identity: { ...ficha.identity, predatorType: 'Trapdoor' } };
    expect(referenceFor({ kind: 'identity', field: 'predatorType' }, trapdoor, catalogs)).toMatchObject({
      title: 'Trapdoor',
      paragraphs: ['Reconhecido, mas ainda sem regras em Predator Type.md.'],
    });
  });

  it('shows the Blood Potency table row and the level section', () => {
    expect(referenceFor({ kind: 'tracker', tracker: 'bloodPotency' }, ficha, catalogs)).toMatchObject({
      kicker: 'The Blood',
      title: 'Blood Potency 1',
      dots: { value: 1, max: 10 },
      blocks: [{ title: null, html: '<p>Vampiro verdadeiro.</p>' }],
    });
    expect(referenceFor({ kind: 'tracker', tracker: 'bloodPotency' }, ficha, catalogs)?.facts).toEqual([
      { label: 'Blood Surge', value: '+1 dados' },
      { label: 'Mend (por Rouse Check)', value: '1 Superficial' },
      { label: 'Bônus de Disciplina', value: 'Nenhum' },
      { label: 'Re-roll do Rouse Check', value: 'Nível 1' },
      { label: 'Bane Severity', value: '1' },
      { label: 'Alimentação', value: 'Sem efeito' },
    ]);
  });

  it('uses "6 e Maior" for Blood Potency above 6, naming it', () => {
    const elder = { ...ficha, blood: { ...ficha.blood, potency: 8 } };
    expect(referenceFor({ kind: 'tracker', tracker: 'bloodPotency' }, elder, catalogs)?.blocks).toEqual([{ title: 'Blood Potency 6 e Maior', html: '<p>Alienígenas.</p>' }]);
  });

  it('shows the generation section that covers the generation on the sheet', () => {
    const neonate = { ...ficha, identity: { ...ficha.identity, generation: '13ª' } };
    expect(referenceFor({ kind: 'identity', field: 'generation' }, neonate, catalogs)).toMatchObject({
      kicker: 'Geração',
      title: '13ª geração',
      facts: [{ label: 'Blood Potency na ficha', value: '1 de 10' }],
      blocks: [{ title: 'Neonatos: 12ª e 13ª Gerações', html: '<p>Recém-chegados.</p>' }],
    });
    const blank = referenceFor({ kind: 'identity', field: 'generation' }, ficha, catalogs);
    expect(blank?.paragraphs).toEqual(['Campo vazio.']);
  });

  it('shows the clan profile with its bane and compulsion', () => {
    expect(referenceFor({ kind: 'identity', field: 'clan' }, ficha, catalogs)).toMatchObject({
      kicker: 'Clã',
      title: 'Banu Haqim',
      source: "Player's Guide, p. 18",
      paragraphs: [],
      facts: [
        { label: 'Disciplinas do clã', value: 'Celerity, Obfuscate, Blood Sorcery' },
        { label: 'Seita', value: 'Camarilla' },
      ],
      blocks: [
        { title: 'Maldição dos Banu Haqim', html: '<p>Hunger frenzy.</p>' },
        { title: 'Compulsão: Julgamento', html: '<p>Punir.</p>' },
        { title: 'Perfil', html: '<p>Juízes.</p>' },
      ],
    });
  });

  it('gives Caitiff their summaries instead of bane and compulsion sections', () => {
    const caitiff = { ...ficha, identity: { ...ficha.identity, clan: 'Caitif' } };
    const result = referenceFor({ kind: 'identity', field: 'clan' }, caitiff, catalogs);
    expect(result?.paragraphs).toEqual(['"Caitif" lido como Caitiff.']);
    expect(result?.facts.slice(-2)).toEqual([
      { label: 'Maldição', value: 'Sem Bane de clã.' },
      { label: 'Compulsão', value: 'Sem Compulsão de clã.' },
    ]);
    expect(result?.blocks.map((block) => block.title)).toEqual(['Perfil']);
  });

  it('summarizes trackers', () => {
    expect(referenceFor({ kind: 'tracker', tracker: 'health' }, ficha, catalogs)?.facts).toEqual([
      { label: 'Máximo', value: '7' },
      { label: 'Superficial', value: '0' },
      { label: 'Agravado', value: '0' },
    ]);
    expect(referenceFor({ kind: 'tracker', tracker: 'humanity' }, ficha, catalogs)?.facts[0]).toEqual({ label: 'Humanidade', value: '7' });
  });
});

describe('referenceFor advantages', () => {
  it('shows the catalog entry with category, points and system', () => {
    expect(referenceFor({ kind: 'advantage', index: 0 }, ficha, catalogs)).toMatchObject({
      kicker: 'Background',
      title: 'Allies',
      source: 'Core, p. 2',
      dots: { value: 2, max: 6 },
      facts: [
        { label: 'Na ficha', value: 'Augie Mendez' },
        { label: 'Pontos', value: '• a ••••••' },
      ],
      blocks: [{ title: 'Sistema', html: '<p>Regra.</p>' }],
    });
  });

  it('matches flaws by Portuguese alias without accents, with the group in the kicker', () => {
    expect(referenceFor({ kind: 'advantage', index: 1 }, ficha, catalogs)).toMatchObject({ kicker: 'Flaw · Feeding', title: 'Prey Exclusion' });
  });

  it('tolerates a typo in the name (Refugo → Refúgio → Haven)', () => {
    expect(referenceFor({ kind: 'advantage', index: 2 }, ficha, catalogs)?.title).toBe('Haven');
  });

  it('says when an advantage is not in Advantages.md', () => {
    const result = referenceFor({ kind: 'advantage', index: 3 }, ficha, catalogs);
    expect(result?.paragraphs[0]).toBe('"Ilha Perdida" não foi encontrado em Advantages.md.');
    expect(result?.facts).toEqual([]);
  });
});

describe('isSameSelection', () => {
  it('compares selections by value', () => {
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'brawl' })).toBe(true);
    expect(isSameSelection({ kind: 'skill', key: 'brawl' }, { kind: 'skill', key: 'melee' })).toBe(false);
    expect(isSameSelection(null, { kind: 'skill', key: 'melee' })).toBe(false);
  });
});
