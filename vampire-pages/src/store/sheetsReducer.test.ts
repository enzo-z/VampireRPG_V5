import { describe, expect, it } from 'vitest';
import { createFicha } from '../domain/defaults.ts';
import { sheetsReducer, type SheetsAction, type SheetsState } from './sheetsReducer.ts';

const nina = createFicha('nina', 'Nina');
const vincent = createFicha('vincent', 'Vincent');
const khalid = createFicha('khalid', 'Khalid');

function stateOf(activeId: string | null, ...fichas: ReturnType<typeof createFicha>[]): SheetsState {
  return Object.freeze({ fichas: Object.freeze(fichas) as typeof fichas, activeId });
}

function run(state: SheetsState, ...actions: SheetsAction[]): SheetsState {
  return actions.reduce(sheetsReducer, state);
}

function ficha(state: SheetsState, id: string) {
  const found = state.fichas.find((f) => f.id === id);
  if (found === undefined) throw new Error(`ficha ${id} not found`);
  return found;
}

describe('sheetsReducer', () => {
  it('changes only the targeted ficha', () => {
    const next = run(stateOf('nina', nina, vincent), { type: 'hunger/picked', id: 'vincent', index: 2 });
    expect(ficha(next, 'vincent').trackers.hunger).toBe(3);
    expect(ficha(next, 'nina')).toBe(nina);
  });

  it('ignores actions for unknown ids', () => {
    const state = stateOf('nina', nina);
    expect(run(state, { type: 'notes/changed', id: 'ghost', value: 'x' })).toBe(state);
  });

  it('creates and activates a new ficha', () => {
    const next = run(stateOf(null), { type: 'ficha/created', ficha: nina });
    expect(next).toEqual({ fichas: [nina], activeId: 'nina' });
  });

  it('activates the next ficha when the active one is deleted, or the previous one at the end', () => {
    expect(run(stateOf('vincent', nina, vincent, khalid), { type: 'ficha/deleted', id: 'vincent' }).activeId).toBe('khalid');
    expect(run(stateOf('khalid', nina, vincent, khalid), { type: 'ficha/deleted', id: 'khalid' }).activeId).toBe('vincent');
    expect(run(stateOf('nina', nina), { type: 'ficha/deleted', id: 'nina' })).toEqual({ fichas: [], activeId: null });
  });

  it('imports by replacing fichas with the same id and appending the rest', () => {
    const renamedNina = { ...nina, name: 'Nina Volkov' };
    const next = run(stateOf('vincent', nina, vincent), { type: 'fichas/imported', fichas: [renamedNina, khalid] });

    expect(next.fichas.map((f) => f.name)).toEqual(['Nina Volkov', 'Vincent', 'Khalid']);
    expect(next.activeId).toBe('nina');
  });

  it('ignores blank names when renaming', () => {
    const state = stateOf('nina', nina);
    expect(run(state, { type: 'ficha/renamed', id: 'nina', name: '   ' })).toBe(state);
    expect(ficha(run(state, { type: 'ficha/renamed', id: 'nina', name: ' Nina V ' }), 'nina').name).toBe('Nina V');
  });

  it('applies the dot rules to attributes, skills, disciplines and blood potency', () => {
    const next = run(
      stateOf('nina', nina),
      { type: 'attribute/picked', id: 'nina', key: 'wits', index: 2 },
      { type: 'skill/picked', id: 'nina', key: 'occult', index: 1 },
      { type: 'discipline/picked', id: 'nina', slot: 0, index: 2 },
      { type: 'blood/potencyPicked', id: 'nina', index: 0 },
    );
    const result = ficha(next, 'nina');
    expect([result.attributes.wits, result.skills.occult, result.disciplines[0]?.value, result.blood.potency]).toEqual([3, 2, 3, 0]);
  });

  it('keeps hidden damage when the maximum shrinks and grows again', () => {
    const next = run(
      stateOf('nina', nina),
      { type: 'tracker/boxCycled', id: 'nina', track: 'health', index: 5 },
      { type: 'tracker/maxSet', id: 'nina', track: 'health', max: 3 },
      { type: 'tracker/boxCycled', id: 'nina', track: 'health', index: 5 },
      { type: 'tracker/maxSet', id: 'nina', track: 'health', max: 7 },
    );
    expect(ficha(next, 'nina').trackers.health.boxes.slice(0, 7)).toEqual([0, 0, 0, 0, 0, 1, 0]);
  });

  it('cycles Humanidade boxes', () => {
    const next = run(stateOf('nina', nina), { type: 'humanity/cycled', id: 'nina', index: 8 });
    expect(ficha(next, 'nina').trackers.humanity).toEqual([2, 2, 2, 2, 2, 2, 2, 0, 1, 0]);
  });

  it('stores specializations and removes them when cleared', () => {
    const withSpec = run(stateOf('nina', nina), { type: 'spec/changed', id: 'nina', key: 'performance', value: 'Canto' });
    expect(ficha(withSpec, 'nina').specs).toEqual({ performance: 'Canto' });
    const cleared = run(withSpec, { type: 'spec/changed', id: 'nina', key: 'performance', value: '' });
    expect(ficha(cleared, 'nina').specs).toEqual({});
  });

  it('edits power rows, creating them on demand and dropping empty trailing rows', () => {
    const typed = run(stateOf('nina', nina), { type: 'power/changed', id: 'nina', slot: 1, powerIndex: 2, field: 'name', value: 'Awe' });
    expect(ficha(typed, 'nina').disciplines[1]?.powers).toEqual([
      { name: '', note: '' },
      { name: '', note: '' },
      { name: 'Awe', note: '' },
    ]);
    const erased = run(typed, { type: 'power/changed', id: 'nina', slot: 1, powerIndex: 2, field: 'name', value: '' });
    expect(ficha(erased, 'nina').disciplines[1]?.powers).toEqual([]);
  });

  it('updates identity, discipline names, blood text and notes', () => {
    const next = run(
      stateOf('nina', nina),
      { type: 'identity/changed', id: 'nina', field: 'clan', value: 'Toreador' },
      { type: 'discipline/renamed', id: 'nina', slot: 5, name: 'Auspex' },
      { type: 'blood/changed', id: 'nina', field: 'baneSeverity', value: '2' },
      { type: 'notes/changed', id: 'nina', value: 'nota' },
    );
    const result = ficha(next, 'nina');
    expect([result.identity.clan, result.disciplines[5]?.name, result.blood.baneSeverity, result.notes]).toEqual([
      'Toreador', 'Auspex', '2', 'nota',
    ]);
  });
});

describe('advantages', () => {
  const start = stateOf('nina', nina);

  it('adds advantages and flaws with level 1', () => {
    const next = run(start, { type: 'advantage/added', id: 'nina', side: 'advantage' }, { type: 'advantage/added', id: 'nina', side: 'flaw' });
    expect(ficha(next, 'nina').advantages).toEqual([
      { category: 'merit', name: '', level: 1, note: '' },
      { category: 'flaw', name: '', level: 1, note: '' },
    ]);
  });

  it('renames with the matched category, edits the note and picks dots', () => {
    const next = run(
      start,
      { type: 'advantage/added', id: 'nina', side: 'advantage' },
      { type: 'advantage/renamed', id: 'nina', index: 0, name: 'Allies', category: 'background' },
      { type: 'advantage/noteChanged', id: 'nina', index: 0, note: 'Augie Mendez' },
      { type: 'advantage/picked', id: 'nina', index: 0, dotIndex: 1 },
    );
    expect(ficha(next, 'nina').advantages[0]).toEqual({ category: 'background', name: 'Allies', level: 2, note: 'Augie Mendez' });
  });

  it('removes an item and ignores unknown indexes', () => {
    const withTwo = run(start, { type: 'advantage/added', id: 'nina', side: 'advantage' }, { type: 'advantage/added', id: 'nina', side: 'flaw' });
    expect(ficha(run(withTwo, { type: 'advantage/removed', id: 'nina', index: 0 }), 'nina').advantages.map((a) => a.category)).toEqual(['flaw']);
    expect(run(withTwo, { type: 'advantage/removed', id: 'nina', index: 5 })).toEqual(withTwo);
  });
});
