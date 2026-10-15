import { describe, expect, it } from 'vitest';
import { highlightPlainText, highlightRolls } from './highlightRolls.ts';

const pool = (text: string) => `<mark class="roll" data-roll="pool" title="Teste">${text}</mark>`;
const difficulty = (text: string) => `<mark class="roll" data-roll="difficulty" title="Dificuldade">${text}</mark>`;
const rouse = (text: string) => `<mark class="roll" data-roll="rouse" title="Rouse Check">${text}</mark>`;

describe('highlightRolls', () => {
  it('marks a dice pool and its difficulty (Bloodhound)', () => {
    expect(highlightRolls('<p>Faça um teste de Resolve + Awareness com Difficulty 3. Aumente a Difficulty para perfume.</p>')).toBe(
      `<p>Faça um teste de ${pool('Resolve + Awareness')} com ${difficulty('Difficulty 3')}. Aumente a Difficulty para perfume.</p>`,
    );
  });

  it('keeps a contested roll together, including multi-word traits', () => {
    expect(highlightRolls('Manipulation + Obfuscate vs Composure + Wits')).toBe(pool('Manipulation + Obfuscate vs Composure + Wits'));
    expect(highlightRolls('teste de Intelligence + Blood Sorcery contra Willpower')).toBe(`teste de ${pool('Intelligence + Blood Sorcery contra Willpower')}`);
  });

  it('stops a contested roll at plain words and keeps the difficulty apart', () => {
    expect(highlightRolls('Composure + Auspex contra Difficulty 3')).toBe(`${pool('Composure + Auspex')} contra ${difficulty('Difficulty 3')}`);
    expect(highlightRolls('Wits + Animalism contra a vítima')).toBe(`${pool('Wits + Animalism')} contra a vítima`);
    expect(highlightRolls('Intelligence + Auspex contra uma Dificuldade 4')).toBe(`${pool('Intelligence + Auspex')} contra uma ${difficulty('Dificuldade 4')}`);
  });

  it('accepts a misspelled term when the other one is a known trait', () => {
    expect(highlightRolls('Resolve + Awwareness')).toBe(pool('Resolve + Awwareness'));
  });

  it('ignores sums that are not tests', () => {
    for (const text of ['10 minutos + 1 hora', 'ganha +1 dado', 'nível da Cerimônia + 1', 'Bob + Alice']) {
      expect(highlightRolls(text)).toBe(text);
    }
  });

  it('marks Portuguese and English difficulties, with a number or a formula', () => {
    expect(highlightRolls('Dificuldade 4')).toBe(difficulty('Dificuldade 4'));
    expect(highlightRolls('Dif. 2')).toBe(difficulty('Dif. 2'));
    expect(highlightRolls('com dificuldade 3')).toBe(`com ${difficulty('dificuldade 3')}`);
    expect(highlightRolls('com Dificuldade (Nível do Ritual + 1)')).toBe(`com ${difficulty('Dificuldade (Nível do Ritual + 1)')}`);
    expect(highlightRolls('a Dificuldade varia')).toBe('a Dificuldade varia');
  });

  it('marks Rouse Checks, singular or plural', () => {
    expect(highlightRolls('Custo: 1 Rouse Check; depois, dois Rouse Checks.')).toBe(`Custo: 1 ${rouse('Rouse Check')}; depois, dois ${rouse('Rouse Checks')}.`);
  });

  it('works across the vault markup without breaking tags', () => {
    expect(highlightRolls('<li><strong>Dice Pool</strong>: Charisma + Presence</li>')).toBe(`<li><strong>Dice Pool</strong>: ${pool('Charisma + Presence')}</li>`);
    expect(highlightRolls('<a href="x">Rouse Check</a>')).toBe(`<a href="x">${rouse('Rouse Check')}</a>`);
  });

  it('leaves code untouched', () => {
    expect(highlightRolls('<code>Resolve + Awareness</code>')).toBe('<code>Resolve + Awareness</code>');
  });
});

describe('highlightPlainText', () => {
  it('escapes what was typed before highlighting', () => {
    expect(highlightPlainText('<b>Resolve + Awareness</b> & cia')).toBe(`&lt;b&gt;${pool('Resolve + Awareness')}&lt;/b&gt; &amp; cia`);
  });
});
