import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../../../vite/buildCatalog.ts';
import { buildPlayerColas } from '../../../vite/buildPlayerColas.ts';
import { indexCatalog } from '../../catalog/lookup.ts';
import { findPlayerCola } from '../../catalog/playerColas.ts';
import { createFicha } from '../../domain/defaults.ts';
import type { Ficha } from '../../domain/character.ts';
import { ATTRIBUTE_GROUPS, SKILL_KEYS } from '../../domain/traits.ts';
import { buildPlayerCola, isShortField, SKILL_ATTRIBUTES, type PlayerColaCatalogs } from './playerCola.ts';

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
  ficha.attributes.manipulation = 3;
  ficha.attributes.intelligence = 3;
  ficha.attributes.wits = 2;
  ficha.attributes.resolve = 2;
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
      ['Insight', 7],
      ['Persuasion', 6],
      ['Investigation', 6],
      ['Politics', 6],
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
      ['Performance', 6],
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
  ficha.attributes.strength = 3;
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
      ['Athletics', 6],
      ['Brawl', 6],
      ['Persuasion', 7],
    ]);
  });

  it('pairs each strong skill with an attribute that fits it', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.attribute])).toEqual([
      ['Athletics', 'Strength'],
      ['Brawl', 'Strength'],
      ['Persuasion', 'Manipulation'],
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

function gusman(): Ficha {
  const ficha = createFicha('gusman', 'Gusman Gutierrez', 'Oliveira');
  ficha.identity = { ...ficha.identity, predatorType: 'Bagger', generation: '13th' };
  ficha.attributes.charisma = 4;
  ficha.attributes.manipulation = 3;
  ficha.attributes.wits = 3;
  ficha.attributes.resolve = 3;
  ficha.skills.streetwise = 3;
  ficha.skills.persuasion = 3;
  ficha.skills.insight = 3;
  ficha.specs.persuasion = 'Bargaining';
  ficha.disciplines[0] = { name: 'Presence', value: 1, powers: [{ name: 'Awe', note: '' }] };
  ficha.disciplines[1] = {
    name: 'Obfuscate',
    value: 3,
    powers: [
      { name: 'Chimerstry', note: '' },
      { name: 'Unseen Passage', note: '' },
      { name: 'Cloak of Shadows', note: '' },
    ],
  };
  return ficha;
}

describe("Gusman's page", () => {
  const cola = buildPlayerCola(gusman(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Gusman Gutierrez');
  const blocks = lore?.blocks ?? [];
  const summary = (name: string) =>
    cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
  const entry = (title: string, term: string) =>
    JSON.stringify(blocks.find((block) => block.title === title)?.entries.find((candidate) => candidate.term.includes(term)));

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual(['Awe', 'Chimerstry', 'Unseen Passage', 'Cloak of Shadows']);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    expect(summary('Chimerstry')).toContain('−2 dados');
    expect(summary('Unseen Passage')).toContain('Rouse Check');
    expect(summary('Cloak of Shadows')).toContain('Parado');
  });

  it('lists the strong pools with the best attribute', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.dice])).toEqual([
      ['Insight', 6],
      ['Persuasion', 7],
      ['Streetwise', 7],
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

  it('shows the mark as a possible Sabbat sign, and Iggy as only very strange', () => {
    const mark = entry('Facções e organizações', 'marca');
    expect(mark).toContain('Sabbat');
    expect(mark).toContain('devanágari');
    const iggy = entry('NPCs que você conhece', 'Iggy');
    expect(iggy).toContain('relógios quebrados');
    expect(iggy).toContain('Relojoeiro');
    expect(iggy).toContain('apenas bem estranho');
    for (const hint of ['Kindred', 'vampiro']) expect(iggy, hint).not.toContain(hint);
  });

  it('lists the quirks he lives as personal flaws, with the real name in the Unbirth Name entry', () => {
    const titles = blocks.map((block) => block.title);
    expect(titles).toContain('O que há de estranho em você');
    const fate = entry('O que há de estranho em você', 'Tempting Fate');
    expect(fate).toContain('−2 dados');
    const name = entry('O que há de estranho em você', 'Unbirth Name');
    expect(name).toContain('Julian Jiménez');
    expect(name).toContain('Gideon');
    expect(entry('O que há de estranho em você', 'Alho')).toContain('Folkloric Bane');
  });

  it('tells the 2017 scam of the Italians and briefly explains the Anarchs', () => {
    const scam = entry('Facções e organizações', 'italianos');
    for (const term of ['Submariner', 'Bellandi', 'Tic-Tac', 'Mike']) expect(scam, term).toContain(term);
    const anarchs = entry('Facções e organizações', 'Anarquistas');
    for (const term of ['Camarilla', 'Bronx', 'Staten Island']) expect(anarchs, term).toContain(term);
  });

  it("keeps Gusman's secrets and what he cannot know off the printed sheet", () => {
    const text = JSON.stringify(blocks);
    const secrets = ['Ravnos', 'plaquinha', 'quarto'];
    const unknownToHim = ['Heinrich', 'Elias', 'Nizar', 'Dragomir', 'Orozco', 'Polonia', 'Semana de Pesadelos'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...secrets, ...unknownToHim, ...spoilers]) expect(text, term).not.toContain(term);
  });
});

function khalid(): Ficha {
  const ficha = createFicha('khalid', 'Khalid Hassan Yusuf', 'Klaus');
  ficha.identity = { ...ficha.identity, clan: 'Banu Haqim', predatorType: 'Pursuer', generation: '12th' };
  ficha.attributes.dexterity = 3;
  ficha.attributes.intelligence = 3;
  ficha.attributes.wits = 4;
  ficha.attributes.resolve = 3;
  ficha.skills.stealth = 3;
  ficha.skills.awareness = 3;
  ficha.skills.investigation = 3;
  ficha.specs.investigation = 'Profiling';
  ficha.disciplines[0] = {
    name: 'Celerity',
    value: 2,
    powers: [
      { name: 'Rapid Reflexes', note: '' },
      { name: 'Fleetness', note: '' },
    ],
  };
  ficha.disciplines[1] = {
    name: 'Obfuscate',
    value: 2,
    powers: [
      { name: 'Cloak of Shadows', note: '' },
      { name: 'Unseen Passage', note: '' },
    ],
  };
  ficha.disciplines[2] = { name: 'Auspex', value: 1, powers: [{ name: 'Heightened Senses', note: '' }] };
  ficha.disciplines[3] = { name: 'Blood Sorcery', value: 1, powers: [{ name: 'A Taste for Blood', note: '' }] };
  return ficha;
}

describe("Khalid's page", () => {
  const cola = buildPlayerCola(khalid(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Khalid Hassan Yusuf');
  const blocks = lore?.blocks ?? [];
  const summary = (name: string) =>
    cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
  const entry = (title: string, term: string) =>
    JSON.stringify(blocks.find((block) => block.title === title)?.entries.find((candidate) => candidate.term.includes(term)));

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual([
      'Rapid Reflexes',
      'Fleetness',
      'Cloak of Shadows',
      'Unseen Passage',
      'Heightened Senses',
      'A Taste for Blood',
    ]);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    expect(summary('Fleetness')).toContain('Dexterity');
    expect(summary('A Taste for Blood')).toContain('Resolve + Blood Sorcery');
    expect(summary('A Taste for Blood')).toContain('diablerie');
  });

  it('pairs his strong skills with Wits, his best fitting attribute', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.attribute, pool.dice])).toEqual([
      ['Stealth', 'Wits', 7],
      ['Awareness', 'Wits', 7],
      ['Investigation', 'Wits', 7],
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

  it('names the court and keeps his Blood Walk ritual', () => {
    const court = blocks.find((block) => block.title === 'A corte de Nova York')?.entries.map((e) => e.term).join(' | ') ?? '';
    for (const name of ['Panhard', 'Qadir', 'Arturo', 'Duval']) expect(court, name).toContain(name);
    expect(entry('Facções e organizações', 'Primogen')).toContain('Samira');
    expect(entry('Facções e organizações', 'Tremere')).toContain('Sturbridge');
    expect(entry('Rituais de Blood Sorcery', 'Blood Walk')).toContain('Intelligence + Blood Sorcery');
  });

  it('tells everything he found out about Gusman, inclusive the clan and the true name', () => {
    const gusman = entry('Jogadores (a coterie)', 'Gusman');
    for (const term of ['Ravnos', 'Semana de Pesadelos', 'marca', 'gravação', 'N.N.', 'Casa Santa Rita', 'Julian Jiménez', 'Julius', 'Mike', 'Terceira Tradição']) {
      expect(gusman, term).toContain(term);
    }
    expect(entry('Facções e organizações', 'Semana de Pesadelos')).toContain('1999');
  });

  it('keeps the family, the forged death, Reyes, Nathan and the surveillance network', () => {
    const family = entry('NPCs que você conhece', 'família');
    for (const term of ['morto desde 2010', 'Leila', 'Harbor Ledger', 'Amira', 'Dearborn']) expect(family, term).toContain(term);
    expect(entry('NPCs que você conhece', 'Reyes')).toContain('FBI');
    const network = entry('NPCs que você conhece', 'rede de vigília');
    for (const term of ['Tobias Grell', 'Frank Delgado', 'Tom Wieczorek']) expect(network, term).toContain(term);
    expect(entry('Jogadores (a coterie)', 'Daniel')).toContain('Nathan');
  });

  it('leaves the sire to the secrets PDF', () => {
    const sire = entry('NPCs que você conhece', 'sire');
    expect(sire).toContain('PDF de segredos');
    const text = JSON.stringify(blocks);
    for (const term of ['Nizar', 'Don Cerro', 'Justicar', 'Arconte de']) expect(text, term).not.toContain(term);
  });

  it("keeps what Khalid cannot know and the one-shot out of the printed sheet", () => {
    const text = JSON.stringify(blocks);
    const unknownToHim = ['Orozco', 'Polonia', 'Iggy', 'Unbirth', 'Tempting Fate'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...unknownToHim, ...spoilers]) expect(text, term).not.toContain(term);
  });
});

function daniel(): Ficha {
  const ficha = createFicha('daniel', 'Daniel Mercer', 'Luiz');
  ficha.identity = { ...ficha.identity, clan: 'Brujah', predatorType: 'Alleycat', generation: '13th' };
  ficha.attributes.strength = 4;
  ficha.attributes.dexterity = 3;
  ficha.attributes.stamina = 3;
  ficha.attributes.intelligence = 2;
  ficha.attributes.wits = 2;
  ficha.attributes.resolve = 3;
  ficha.skills.athletics = 3;
  ficha.skills.brawl = 3;
  ficha.skills.drive = 3;
  ficha.skills.investigation = 3;
  ficha.specs.drive = 'Motorcycles';
  ficha.disciplines[0] = {
    name: 'Potence',
    value: 2,
    powers: [
      { name: 'Lethal Body', note: '' },
      { name: 'Prowess', note: '' },
    ],
  };
  ficha.disciplines[1] = {
    name: 'Celerity',
    value: 2,
    powers: [
      { name: 'Rapid Reflexes', note: '' },
      { name: 'Fleetness', note: '' },
    ],
  };
  ficha.disciplines[2] = { name: 'Presence', value: 1, powers: [{ name: 'Daunt', note: '' }] };
  return ficha;
}

describe("Daniel's page", () => {
  const cola = buildPlayerCola(daniel(), catalogs);
  const lore = findPlayerCola(catalogs.playerColas, 'Daniel Mercer');
  const blocks = lore?.blocks ?? [];
  const summary = (name: string) =>
    cola.disciplines.flatMap((discipline) => discipline.powers).find((power) => power.name === name)?.summaryHtml ?? '';
  const entry = (title: string, term: string) =>
    JSON.stringify(blocks.find((block) => block.title === title)?.entries.find((candidate) => candidate.term.includes(term)));

  it('finds every power of the sheet and the lore note, with no warnings', () => {
    expect(cola.warnings).toEqual([]);
    const powers = cola.disciplines.flatMap((discipline) => discipline.powers);
    expect(powers.map((power) => power.name)).toEqual(['Lethal Body', 'Prowess', 'Rapid Reflexes', 'Fleetness', 'Daunt']);
    for (const power of powers) expect(power.summaryHtml, power.name).not.toBeNull();
  });

  it('keeps the rules that matter in the summaries', () => {
    expect(summary('Lethal Body')).toContain('Agravado');
    expect(summary('Prowess')).toContain('Rouse Check');
    expect(summary('Daunt')).toContain('Intimidation');
  });

  it('pairs his strong skills with Strength or Dexterity, as the book does', () => {
    expect(cola.pools.map((pool) => [pool.skill, pool.attribute, pool.dice])).toEqual([
      ['Athletics', 'Strength', 7],
      ['Brawl', 'Strength', 7],
      ['Drive', 'Dexterity', 6],
      ['Investigation', 'Intelligence', 5],
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

  it('tells 1999, the club and the family he knows', () => {
    const terms = (title: string) =>
      blocks.find((block) => block.title === title)?.entries.map((e) => e.term).join(' | ') ?? '';
    for (const name of ['Panhard', 'Qadir', 'Weiss', 'Calebros']) expect(terms('A corte de Nova York'), name).toContain(name);
    for (const name of ['Doc Keane', 'Elias Voss', 'Marian Price', 'Silas Redd', 'família']) expect(terms('NPCs que você conhece'), name).toContain(name);
    for (const name of ['Iron Lanterns', 'Pavio Negro', 'Segunda Guarda']) expect(terms('Facções e organizações'), name).toContain(name);
    expect(entry('Facções e organizações', 'Segunda Guarda')).toContain('Sully');
    const family = entry('NPCs que você conhece', 'família');
    for (const term of ['Nathan Ward', 'Ruth Ward', 'Claire', 'Maggie']) expect(family, term).toContain(term);
  });

  it('shows the Gangrel of his mission and leaves his private decisions to the secrets PDF', () => {
    const jesse = entry('Jogadores (a coterie)', 'Jesse');
    for (const term of ['Youngstown', 'I-80', 'não lhe contou nada']) expect(jesse, term).toContain(term);
    const family = entry('NPCs que você conhece', 'família');
    expect(family).toContain('PDF de segredos');
    const text = JSON.stringify(blocks);
    for (const term of ['Abraço de Nathan', 'caminhonete', 'vigilância sobre']) expect(text, term).not.toContain(term);
  });

  it('keeps what Daniel cannot know and the one-shot out of the printed sheet', () => {
    const text = JSON.stringify(blocks);
    const unknownToHim = ['Ravnos', 'Julian', 'Caitiff', 'Dragomir', 'Orozco', 'Polonia', 'Nizar', 'Heinrich'];
    const spoilers = ['Auld Sanguine', 'Réveillon', '31/12'];
    for (const term of [...unknownToHim, ...spoilers]) expect(text, term).not.toContain(term);
  });
});

describe('SKILL_ATTRIBUTES', () => {
  it('pairs every skill with attributes of the groups the book uses', () => {
    expect(Object.keys(SKILL_ATTRIBUTES).sort()).toEqual([...SKILL_KEYS].sort());
    for (const key of SKILL_KEYS) expect(SKILL_ATTRIBUTES[key].length, key).toBeGreaterThan(0);
    // The cases the first version got wrong: physical skills never took a Social or Mental attribute.
    for (const key of ['athletics', 'brawl', 'melee', 'firearms'] as const) {
      for (const attribute of SKILL_ATTRIBUTES[key]) expect(ATTRIBUTE_GROUPS.physical, `${key}/${attribute}`).toContain(attribute);
    }
  });

  it('uses the highest of the usual attributes, keeping the first on ties', () => {
    const ficha = createFicha('t', 'Teste', 'T');
    ficha.skills.persuasion = 3;
    ficha.attributes.charisma = 2;
    ficha.attributes.manipulation = 2;
    expect(buildPlayerCola(ficha, catalogs).pools[0]?.attribute).toBe('Charisma');
    ficha.attributes.manipulation = 4;
    expect(buildPlayerCola(ficha, catalogs).pools[0]).toMatchObject({ attribute: 'Manipulation', dice: 7 });
  });
});

describe('isShortField', () => {
  it('accepts a one-line fact and rejects a field with a rules sub-paragraph', () => {
    expect(isShortField('Um <strong>Rouse Check</strong>.')).toBe(true);
    expect(isShortField(`Até ser desativado ${'Manter o poder ativo por períodos prolongados. '.repeat(3)}`)).toBe(false);
  });
});
