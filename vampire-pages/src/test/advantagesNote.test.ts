import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildAdvantages } from '../../vite/buildAdvantages.ts';
import { findAdvantage, indexAdvantages, type AdvantageSide } from '../catalog/advantages.ts';

// Contract between Advantages.md and the app: every item exactly as written on
// the players' sheets (docs/players/merits-flaws-jogadores-v5.md) must resolve.
const NOTE = fileURLToPath(new URL('../../../Advantages.md', import.meta.url));
const build = buildAdvantages(NOTE);
const index = indexAdvantages(build.data);

const SHEET_ITEMS: readonly [AdvantageSide, string, string][] = [
  ['advantage', 'Looks: Beautiful', 'Beautiful'],
  ['advantage', 'Herd', 'Herd'],
  ['advantage', 'Allies (Augie Mendez)', 'Allies'],
  ['advantage', 'Contacts', 'Contacts'],
  ['advantage', 'Contact', 'Contacts'],
  ['advantage', 'Fame', 'Fame'],
  ['advantage', 'Haven', 'Haven'],
  ['advantage', 'Mawla', 'Mawla'],
  ['advantage', 'Resources', 'Resources'],
  ['advantage', 'Status', 'Status'],
  ['advantage', 'Loresheet: Sect War Veteran', 'Sect War Veteran'],
  ['advantage', 'Contacts (Valerie Duval, polícia, sindicato)', 'Contacts'],
  ['advantage', 'Haven (Suíte no Plaza)', 'Haven'],
  ['advantage', 'Bloodhound', 'Bloodhound'],
  ['advantage', 'Mask', 'Mask'],
  ['advantage', 'Mawla (Nizar ibn Tahir)', 'Mawla'],
  ['advantage', 'Allies (Daniel Reyes)', 'Allies'],
  ['advantage', 'Linguistics (Árabe)', 'Linguistics'],
  ['advantage', 'Contacts (criminosos da estrada)', 'Contacts'],
  ['advantage', 'Allies (Red Harlan, Iron Lanterns)', 'Allies'],
  ['advantage', 'Mawla (Elias Voss)', 'Mawla'],
  ['advantage', 'Haven (Apartamento)', 'Haven'],
  ['advantage', 'Linguistics (Espanhol)', 'Linguistics'],
  ['advantage', 'Mawla (Gideon)', 'Mawla'],
  ['advantage', 'Status (New Jersey, Working Class)', 'Status'],
  ['advantage', 'Contacts (Enfermeiro)', 'Contacts'],
  ['advantage', 'Iron Gullet', 'Iron Gullet'],
  ['advantage', 'Influence', 'Influence'],
  ['flaw', 'Prey Exclusion (fora da cena do jazz)', 'Prey Exclusion'],
  ['flaw', 'Suspect', 'Suspect'],
  ['flaw', 'Disliked', 'Disliked'],
  ['flaw', 'Living in the Past', 'Living in the Past'],
  ['flaw', 'Dark Secret (Diablerist)', 'Dark Secret'],
  ['flaw', 'Prey Exclusion (mortais)', 'Prey Exclusion'],
  ['flaw', 'Adversary (Sabbat remanescente)', 'Adversary'],
  ['flaw', 'Known Corpse', 'Known Corpse'],
  ['flaw', 'Prey Exclusion (inocentes)', 'Prey Exclusion'],
  ['flaw', 'Adversary (Teresa "Torch" Malloy, Pavio Negro MC)', 'Adversary'],
  ['flaw', 'Prey Exclusion (crianças)', 'Prey Exclusion'],
  ['flaw', 'Folkloric Bane (flor, a definir)', 'Folkloric Bane'],
  ['flaw', 'Infamy (Italianos)', 'Infamous'],
  ['flaw', 'Folkloric Bane (Alho)', 'Folkloric Bane'],
  ['flaw', 'Enemy (Desconhecido)', 'Enemy'],
];

// Portuguese spellings a player or the GM may type.
const PORTUGUESE: readonly [AdvantageSide, string, string][] = [
  ['advantage', 'refugio', 'Haven'],
  ['advantage', 'Contatos', 'Contacts'],
  ['advantage', 'rebanho', 'Herd'],
  ['advantage', 'recursos', 'Resources'],
  ['advantage', 'aliados', 'Allies'],
  ['flaw', 'exclusao de presa', 'Prey Exclusion'],
  ['flaw', 'segredo sombrio', 'Dark Secret'],
  ['flaw', 'infamia', 'Infamous'],
  ['flaw', 'inimigo', 'Enemy'],
  ['flaw', 'vivendo no passado', 'Living in the Past'],
];

describe('Advantages.md', () => {
  it('parses without errors', () => {
    expect(build.errors).toEqual([]);
  });

  it('resolves every item written on the players\' sheets', () => {
    const wrong = SHEET_ITEMS.filter(([side, text, expected]) => findAdvantage(index, side, text)?.name !== expected)
      .map(([side, text, expected]) => `${side}: "${text}" → ${findAdvantage(index, side, text)?.name ?? 'nada'} (esperado ${expected})`);
    expect(wrong).toEqual([]);
  });

  it('resolves Portuguese names without accents or capitals', () => {
    const wrong = PORTUGUESE.filter(([side, text, expected]) => findAdvantage(index, side, text)?.name !== expected).map(([, text]) => text);
    expect(wrong).toEqual([]);
  });

  it('gives every item a source and points', () => {
    expect(build.data.entries.filter((entry) => entry.source === null || entry.pointsLabel === '').map((entry) => entry.name)).toEqual([]);
  });
});
