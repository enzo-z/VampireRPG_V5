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

describe('isShortField', () => {
  it('accepts a one-line fact and rejects a field with a rules sub-paragraph', () => {
    expect(isShortField('Um <strong>Rouse Check</strong>.')).toBe(true);
    expect(isShortField(`Até ser desativado ${'Manter o poder ativo por períodos prolongados. '.repeat(3)}`)).toBe(false);
  });
});
