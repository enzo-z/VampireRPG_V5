import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../../../vite/buildCatalog.ts';
import { buildPlayerColas } from '../../../vite/buildPlayerColas.ts';
import { indexCatalog } from '../../catalog/lookup.ts';
import { findPlayerCola } from '../../catalog/playerColas.ts';
import { createFicha } from '../../domain/defaults.ts';
import type { Ficha } from '../../domain/character.ts';
import { buildPlayerCola, isShortField, type PlayerColaCatalogs } from './playerCola.ts';

// Real vault notes, so a note edit that breaks the player's page fails here.
const vault = (path: string) => fileURLToPath(new URL(`../../../../${path}`, import.meta.url));

const playerColas = buildPlayerColas(vault('Regras/Colas dos Jogadores'));
const catalogs: PlayerColaCatalogs = {
  disciplines: indexCatalog(buildCatalog(vault('O Sangue (Vitae)/Disciplinas')).catalog),
  playerColas: playerColas.data,
};

function gideon(): Ficha {
  const ficha = createFicha('gideon', 'Gideon Nicols', 'Victor Polck');
  ficha.identity = { ...ficha.identity, clan: 'Toreador', predatorType: 'Scene Queen', generation: '12th' };
  ficha.attributes.manipulation = 4;
  ficha.skills.persuasion = 3;
  ficha.skills.subterfuge = 3;
  ficha.skills.streetwise = 1;
  ficha.specs.etiquette = 'Camarilla';
  ficha.disciplines[0] = {
    name: 'Auspex',
    value: 3,
    powers: [
      { name: 'Heightened Senses', note: '' },
      { name: 'Sense the Unseen', note: '' },
      { name: 'Share the Senses', note: '' },
    ],
  };
  ficha.disciplines[1] = { name: 'Celerity', value: 1, powers: [{ name: 'Rapid Reflexes', note: '' }] };
  ficha.disciplines[2] = { name: 'Potence', value: 1, powers: [{ name: 'Soaring Leap', note: '' }] };
  return ficha;
}

describe('buildPlayerCola', () => {
  const cola = buildPlayerCola(gideon(), catalogs);

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual([
      'Heightened Senses',
      'Sense The Unseen',
      'Share the Senses',
      'Rapid Reflexes',
      'Soaring Leap',
    ]);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('takes cost and duration from the note, and drops long fields that the Cola line covers', () => {
    const share = cola.disciplines[0]?.powers.find((power) => power.name === 'Share the Senses');
    // Its Dice Pool field is a long contest note, so only Custo and Duração stay.
    expect(share?.fields.map((field) => field.label)).toEqual(['Custo', 'Duração']);
    expect(share?.fields[0]?.html).toContain('Rouse Check');
  });

  it('keeps the rules that matter in the summaries', () => {
    const summary = (name: string) =>
      cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
    expect(summary('Heightened Senses')).toContain('−3 dados');
    expect(summary('Share the Senses')).toContain('Rouse Check');
    expect(summary('Soaring Leap')).toContain('3 × Potence');
  });

  it('lists only strong skills, best first', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.dice])).toEqual([
      ['Persuasion', 7],
      ['Subterfuge', 7],
    ]);
  });

  it('warns about names that match nothing, instead of failing', () => {
    const ficha = gideon();
    ficha.name = 'Personagem Sem Nota';
    ficha.disciplines[3] = { name: 'Auspex', value: 1, powers: [{ name: 'Poder Inexistente Xyz', note: '' }] };
    const result = buildPlayerCola(ficha, catalogs);
    expect(result.lore).toEqual([]);
    expect(result.warnings.some((warning) => warning.includes('Personagem Sem Nota'))).toBe(true);
    expect(result.warnings.some((warning) => warning.includes('Poder Inexistente Xyz'))).toBe(true);
  });
});

describe("Gideon's lore note", () => {
  const lore = findPlayerCola(catalogs.playerColas, 'Gideon Nicols');
  const blocks = lore?.blocks ?? [];

  it('builds without errors or warnings', () => {
    expect(playerColas.errors).toEqual([]);
    expect(playerColas.warnings).toEqual([]);
  });

  it('is found by the sheet name, tolerating the other spelling', () => {
    expect(lore).not.toBeNull();
    expect(findPlayerCola(catalogs.playerColas, 'gideon nichols')).not.toBeNull();
  });

  it('has the blocks the page places by title, each with terms', () => {
    const titles = blocks.map((block) => block.title);
    const expected = ['A corte de Nova York', 'NPCs que você conhece', 'Jogadores (a coterie)', 'Facções e organizações', 'Nova York por distrito'];
    for (const title of expected) {
      expect(titles, title).toContain(title);
    }
    for (const block of blocks) expect(block.entries.length, block.title).toBeGreaterThan(0);
  });

  it('names the court, with the positions Gideon answers to', () => {
    const court = blocks.find((block) => block.title === 'A corte de Nova York');
    const terms = court?.entries.map((entry) => entry.term).join(' | ') ?? '';
    for (const name of ['Panhard', 'Qadir', 'Arturo', 'Duval', 'Samira', 'Sturbridge']) expect(terms, name).toContain(name);
  });

  it("keeps Gideon's secrets off the printed sheet", () => {
    const text = JSON.stringify(blocks);
    for (const secret of ['Julian', 'Jiménez', 'Mary Winchester', 'Harbor Ledger', 'diablerie', 'Ravnos', 'Caitiff']) {
      expect(text, secret).not.toContain(secret);
    }
  });
});

function herta(): Ficha {
  const ficha = createFicha('herta', 'Herta Müller', 'Rebeca');
  ficha.identity = { ...ficha.identity, clan: 'Ventrue', predatorType: 'Pursuer', generation: '13th' };
  ficha.attributes.composure = 4;
  ficha.attributes.charisma = 3;
  ficha.skills.insight = 4;
  ficha.skills.investigation = 3;
  ficha.skills.persuasion = 3;
  ficha.skills.politics = 3;
  ficha.specs.insight = 'mentiras';
  ficha.disciplines[0] = {
    name: 'Fortitude',
    value: 2,
    powers: [
      { name: 'Unswayable Mind', note: '' },
      { name: 'Resilience', note: '' },
    ],
  };
  ficha.disciplines[1] = { name: 'Presence', value: 1, powers: [{ name: 'Awe', note: '' }] };
  ficha.disciplines[2] = { name: 'Auspex', value: 1, powers: [{ name: 'Heightened Senses', note: '' }] };
  return ficha;
}

describe("Herta's page", () => {
  const cola = buildPlayerCola(herta(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Herta Müller');
  const blocks = lore?.blocks ?? [];

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual(['Unswayable Mind', 'Resilience', 'Awe', 'Heightened Senses']);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    const summary = (name: string) =>
      cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
    expect(summary('Unswayable Mind')).toContain('Dominate');
    expect(summary('Awe')).toContain('Composure + Intelligence');
    expect(summary('Heightened Senses')).toContain('−3 dados');
  });

  it('lists the strong pools, best first', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.dice])).toEqual([
      ['Insight', 8],
      ['Persuasion', 7],
      ['Investigation', 7],
      ['Politics', 7],
    ]);
  });

  it('builds the lore note without errors, with the blocks the page places by title', () => {
    expect(playerColas.errors).toEqual([]);
    expect(playerColas.warnings).toEqual([]);
    const titles = blocks.map((block) => block.title);
    const expected = ['A corte de Nova York', 'NPCs que você conhece', 'Jogadores (a coterie)', 'Facções e organizações', 'Nova York por distrito'];
    for (const title of expected) expect(titles, title).toContain(title);
    for (const block of blocks) expect(block.entries.length, block.title).toBeGreaterThan(0);
  });

  it("keeps Herta's secrets and what she cannot know off the printed sheet", () => {
    const text = JSON.stringify(blocks);
    const secrets = ['Walter', 'Ingrid', 'Göttingen', 'Stasi', 'reassentamento', 'Nizar', 'Dragomir', 'Segunda Inquisição'];
    const unknownToHer = ['Ravnos', 'Jiménez', 'Caitiff', 'Nathan', 'Cordelia', 'Elias'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...secrets, ...unknownToHer, ...spoilers]) expect(text, term).not.toContain(term);
  });

  it('only names the characters she has not met, with nothing else about them', () => {
    const others = blocks
      .find((block) => block.title === 'Jogadores (a coterie)')
      ?.entries.find((entry) => entry.term.includes('outros personagens'));
    const text = JSON.stringify(others);
    for (const name of ['Gideon Nicols', 'Daniel Mercer', 'Nina Calloway', 'Gusman Gutierrez', 'Jesse Calloway']) {
      expect(text, name).toContain(name);
    }
    expect(text).toContain('não sabe nada');
  });
});

function nina(): Ficha {
  const ficha = createFicha('nina', 'Nina Calloway', 'Marcelle');
  ficha.identity = { ...ficha.identity, clan: 'Toreador', predatorType: 'Scene Queen', generation: '13th' };
  ficha.attributes.wits = 4;
  ficha.attributes.charisma = 3;
  ficha.skills.insight = 3;
  ficha.skills.performance = 3;
  ficha.skills.awareness = 3;
  ficha.specs.performance = 'Saxophone';
  ficha.disciplines[0] = {
    name: 'Auspex',
    value: 2,
    powers: [
      { name: 'Heightened Senses', note: '' },
      { name: 'Premonition', note: '' },
    ],
  };
  ficha.disciplines[1] = { name: 'Presence', value: 1, powers: [{ name: 'Awe', note: '' }] };
  ficha.disciplines[2] = { name: 'Dominate', value: 1, powers: [{ name: 'Cloud Memory', note: '' }] };
  return ficha;
}

describe("Nina's page", () => {
  const cola = buildPlayerCola(nina(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Nina Calloway');
  const blocks = lore?.blocks ?? [];

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual(['Heightened Senses', 'Premonition', 'Awe', 'Cloud Memory']);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    const summary = (name: string) =>
      cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
    expect(summary('Premonition')).toContain('Rouse Check');
    expect(summary('Cloud Memory')).toContain('Esqueça');
    expect(summary('Cloud Memory')).toContain('Wits + Resolve');
  });

  it('lists the strong pools with the best attribute', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.dice])).toEqual([
      ['Insight', 7],
      ['Performance', 7],
      ['Awareness', 7],
    ]);
  });

  it('builds the lore note without errors, with the blocks the page places by title', () => {
    expect(playerColas.errors).toEqual([]);
    expect(playerColas.warnings).toEqual([]);
    const titles = blocks.map((block) => block.title);
    const expected = ['A corte de Nova York', 'NPCs que você conhece', 'Jogadores (a coterie)', 'Facções e organizações', 'Nova York por distrito'];
    for (const title of expected) expect(titles, title).toContain(title);
    for (const block of blocks) expect(block.entries.length, block.title).toBeGreaterThan(0);
  });

  it("keeps Nina's secrets and what she cannot know off the printed sheet", () => {
    const text = JSON.stringify(blocks);
    const secrets = ['não sabe o que você se tornou', 'cena do crime', 'Prey Exclusion', 'Harbor Ledger', 'Isabella'];
    const unknownToHer = ['Ravnos', 'Jiménez', 'Julian', 'Caitiff', 'Nizar', 'Dragomir', 'Nathan', 'Heinrich'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...secrets, ...unknownToHer, ...spoilers]) expect(text, term).not.toContain(term);
  });

  it('only names the characters she has not met, with nothing else about them', () => {
    const others = blocks
      .find((block) => block.title === 'Jogadores (a coterie)')
      ?.entries.find((entry) => entry.term.includes('outros personagens'));
    const text = JSON.stringify(others);
    for (const name of ['Daniel Mercer', 'Gusman Gutierrez', 'Herta Müller', 'Jesse Calloway']) expect(text, name).toContain(name);
    expect(text).toContain('quase nada');
  });
});

function vincent(): Ficha {
  const ficha = createFicha('vincent', 'Vincent Marchetti', 'Pedro');
  ficha.identity = { ...ficha.identity, clan: 'Tzimisce', predatorType: 'Blood Leech', generation: '12th' };
  ficha.attributes.manipulation = 4;
  ficha.skills.athletics = 3;
  ficha.skills.brawl = 3;
  ficha.skills.persuasion = 3;
  ficha.specs.brawl = 'Kindred';
  ficha.disciplines[0] = {
    name: 'Dominate',
    value: 3,
    powers: [
      { name: 'Compel', note: '' },
      { name: 'Mesmerize', note: '' },
      { name: 'The Forgetful Mind', note: '' },
    ],
  };
  ficha.disciplines[1] = {
    name: 'Protean',
    value: 2,
    powers: [
      { name: 'Eyes of the Beast', note: '' },
      { name: 'Feral Weapons', note: '' },
    ],
  };
  return ficha;
}

describe("Vincent's page", () => {
  const cola = buildPlayerCola(vincent(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Vincent Marchetti');
  const blocks = lore?.blocks ?? [];
  const summary = (name: string) =>
    cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual([
      'Compel',
      'Mesmerize',
      'The Forgetful Mind',
      'Eyes of the Beast',
      'Feral Weapons',
    ]);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    expect(summary('Compel')).toContain('Intelligence + Resolve');
    expect(summary('Mesmerize')).toContain('Rouse Check');
    expect(summary('The Forgetful Mind')).toContain('margem');
    expect(summary('Eyes of the Beast')).toContain('+2 dados em Intimidation');
    expect(summary('Feral Weapons')).toContain('Agravado');
  });

  it('lists the strong pools with the best attribute', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.dice])).toEqual([
      ['Athletics', 7],
      ['Brawl', 7],
      ['Persuasion', 7],
    ]);
  });

  it('builds the lore note without errors, with the blocks the page places by title', () => {
    expect(playerColas.errors).toEqual([]);
    expect(playerColas.warnings).toEqual([]);
    const titles = blocks.map((block) => block.title);
    const expected = ['A corte de Nova York', 'NPCs que você conhece', 'Jogadores (a coterie)', 'Facções e organizações', 'Nova York por distrito'];
    for (const title of expected) expect(titles, title).toContain(title);
    for (const block of blocks) expect(block.entries.length, block.title).toBeGreaterThan(0);
  });

  it('names the court and the 1999 history he knows from the inside', () => {
    const terms = (title: string) =>
      blocks.find((block) => block.title === title)?.entries.map((entry) => entry.term).join(' | ') ?? '';
    for (const name of ['Panhard', 'Qadir', 'Arturo', 'Duval', 'Samira', 'Sturbridge']) expect(terms('A corte de Nova York'), name).toContain(name);
    for (const name of ['Polonia', 'Orozco', 'Dragomir']) expect(terms('NPCs que você conhece'), name).toContain(name);
    for (const name of ['Sabbat', 'Batalha de Nova York', 'Anarquistas']) expect(terms('Facções e organizações'), name).toContain(name);
  });

  it("shows Gusman's mark only as a possible Sabbat sign", () => {
    const gusman = blocks
      .find((block) => block.title === 'Jogadores (a coterie)')
      ?.entries.find((entry) => entry.term.includes('Gusman'));
    const text = JSON.stringify(gusman);
    expect(text).toContain('marca');
    expect(text).toContain('Sabbat');
    expect(text).toContain('não o rito');
  });

  it("keeps Vincent's secrets and what he cannot know off the printed sheet", () => {
    const text = JSON.stringify(blocks);
    const secrets = ['decapit', 'bebeu', 'Carmine', 'Silas', 'Redd', 'quarto', 'Terceira Tradição', 'Diablerist', 'diablerie'];
    const gusmanAndOthers = ['Ravnos', 'Jiménez', 'Julian', 'Caitiff', 'Nizar', 'Nathan', 'Iggy', 'Mary Winchester'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...secrets, ...gusmanAndOthers, ...spoilers]) expect(text, term).not.toContain(term);
  });
});

describe('isShortField', () => {
  it('accepts a one-line fact and rejects a field with a rules sub-paragraph', () => {
    expect(isShortField('Um <strong>Rouse Check</strong>.')).toBe(true);
    expect(isShortField(`Até ser desativado ${'Manter o poder ativo por períodos prolongados. '.repeat(3)}`)).toBe(false);
  });
});
