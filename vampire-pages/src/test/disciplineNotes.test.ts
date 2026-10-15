import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../../vite/buildCatalog.ts';
import { findDiscipline, findEntry, indexCatalog } from '../catalog/lookup.ts';

// Contract between the vault notes and the app: the real notes must parse,
// and every discipline and power used by the players must be found.
const NOTES_DIR = fileURLToPath(new URL('../../../O Sangue (Vitae)/Disciplinas', import.meta.url));
const build = buildCatalog(NOTES_DIR);
const index = indexCatalog(build.catalog);

// From vampire-pages/docs/players/disciplinas-jogadores-v5.md.
const PLAYER_POWERS: Readonly<Record<string, readonly string[]>> = {
  Auspex: ['Heightened Senses', 'Premonition', 'Sense the Unseen', 'Share the Senses'],
  Presence: ['Awe', 'Daunt'],
  Dominate: ['Cloud Memory', 'Compel', 'Mesmerize', 'The Forgetful Mind'],
  Celerity: ['Rapid Reflexes', 'Fleetness'],
  Potence: ['Soaring Leap', 'Lethal Body', 'Prowess'],
  Protean: ['Eyes of the Beast', 'Feral Weapons'],
  Obfuscate: ['Cloak of Shadows', 'Unseen Passage', 'Chimerstry'],
  'Blood Sorcery': ['A Taste for Blood', 'Blood Walk'],
  Fortitude: ['Resilience'],
};

describe('discipline notes in the vault', () => {
  it('parse without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it('leave out the rituals marked as not used in this chronicle', () => {
    for (const ritual of ['Bind the Accusing Tongue', 'Viscera Garden', 'Bloodless Feast']) {
      expect(findEntry(index, 'Blood Sorcery', ritual), ritual).toBeNull();
    }
  });

  it('cover every discipline, with entries in every note', () => {
    for (const name of ['Animalism', 'Auspex', 'Blood Sorcery', 'Celerity', 'Dominate', 'Fortitude', 'Obfuscate', 'Oblivion', 'Potence', 'Presence', 'Protean', 'Thin-blood Alchemy']) {
      expect(findDiscipline(index, name), name).not.toBeNull();
    }
    for (const note of build.catalog.notes) expect(note.entries.length, note.noteName).toBeGreaterThan(0);
  });

  it('contain every power the players use', () => {
    const missing = Object.entries(PLAYER_POWERS).flatMap(([discipline, powers]) =>
      powers.filter((power) => findEntry(index, discipline, power) === null).map((power) => `${discipline}: ${power}`),
    );
    expect(missing).toEqual([]);
  });

  it('give every entry a source', () => {
    const incomplete = build.catalog.notes.flatMap((note) =>
      note.entries.filter((entry) => entry.source === null).map((entry) => `${note.noteName}: ${entry.name}`),
    );
    expect(incomplete).toEqual([]);
  });
});
