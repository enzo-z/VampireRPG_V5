import { describe, expect, it } from 'vitest';
import { legacyCharacter } from './fixtures.ts';
import { looksLikeLegacyPedro, migrateLegacyPedro } from './legacyPedro.ts';

function migrate(input: unknown = legacyCharacter()) {
  const result = migrateLegacyPedro(input, () => 'new-id');
  if ('error' in result) throw new Error(result.error);
  return result;
}

describe('looksLikeLegacyPedro', () => {
  it('recognizes a legacy character and rejects versioned files', () => {
    expect(looksLikeLegacyPedro(legacyCharacter())).toBe(true);
    expect(looksLikeLegacyPedro({ ...legacyCharacter(), schemaVersion: 1 })).toBe(false);
    expect(looksLikeLegacyPedro([legacyCharacter()])).toBe(false);
  });
});

describe('migrateLegacyPedro', () => {
  it('always assigns a fresh id (Pedro\'s default id "khalil" would collide)', () => {
    expect(migrate().ficha.id).toBe('new-id');
  });

  it('maps identity, with faction becoming the sect', () => {
    expect(migrate().ficha.identity).toEqual({
      player: '', chronicle: '', clan: 'Toreador', predatorType: 'Siren',
      ambition: '', sect: 'Camarilla', generation: '13th', desire: '',
    });
  });

  it('clamps attributes and splits skills into values and specializations', () => {
    const { ficha } = migrate();
    expect(ficha.attributes.resolve).toBe(5);
    expect(ficha.skills.performance).toBe(3);
    expect(ficha.skills.brawl).toBe(0);
    expect(ficha.specs).toEqual({ performance: 'Canto', occult: 'Rituais' });
  });

  it('turns the Hunger array into a count', () => {
    expect(migrate().ficha.trackers.hunger).toBe(3);
  });

  it('turns humanity and stains into ten boxes', () => {
    expect(migrate().ficha.trackers.humanity).toEqual([2, 2, 2, 2, 2, 2, 2, 0, 1, 1]);
  });

  it('caps Saúde at 12, treats null as empty and warns about lost damage', () => {
    const { ficha, warnings } = migrate();
    expect(ficha.trackers.health).toEqual({ max: 12, boxes: [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
    expect(warnings).toContain('Saúde: máximo 15 reduzido para 12.');
    expect(warnings).toContain('Saúde: dano além da caixa 12 foi descartado.');
  });

  it('pads short damage arrays to 12 boxes', () => {
    expect(migrate().ficha.trackers.willpower).toEqual({ max: 5, boxes: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
  });

  it('keeps six disciplines with at most five powers each and warns about the rest', () => {
    const { ficha, warnings } = migrate();
    expect(ficha.disciplines).toHaveLength(6);
    expect(ficha.disciplines[0]?.powers.map((p) => p.name)).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
    expect(ficha.disciplines[2]?.value).toBe(5);
    expect(warnings.some((w) => w.includes('D7'))).toBe(true);
  });

  it('pads missing discipline slots with empty ones', () => {
    const input = { ...legacyCharacter(), disciplines: [{ name: 'Auspex', level: 2, powers: [] }] };
    const { ficha } = migrate(input);
    expect(ficha.disciplines.map((d) => d.name)).toEqual(['Auspex', '', '', '', '', '']);
  });

  it('keeps fields without a place in the sheet as text in the notes', () => {
    const { notes } = migrate().ficha;
    expect(notes).toContain('Importado do app do Pedro');
    expect(notes).toContain('XP: total 12, gasto 7');
    expect(notes).toContain('Poderes excedentes: Presence: P6');
    expect(notes).not.toContain('Prey Exclusion');
  });

  it('moves advantages and flaws into the advantage list with a category', () => {
    expect(migrate().ficha.advantages).toEqual([
      { category: 'merit', name: 'Beautiful', level: 2, note: '' },
      { category: 'flaw', name: 'Prey Exclusion', level: 1, note: 'crianças' },
    ]);
    const withBackgrounds = { ...legacyCharacter(), advantages: [{ name: 'Allies', level: 7, note: 'x' }, { name: 'Loresheet: Sect War Veteran', level: 3, note: '' }] };
    expect(migrate(withBackgrounds).ficha.advantages.slice(0, 2)).toEqual([
      { category: 'background', name: 'Allies', level: 6, note: 'x' },
      { category: 'loresheet', name: 'Loresheet: Sect War Veteran', level: 3, note: '' },
    ]);
  });

  it('copies blood potency and resonance and warns about dropped data', () => {
    const { ficha, warnings } = migrate();
    expect([ficha.blood.potency, ficha.blood.resonance]).toEqual([1, 'Sanguine']);
    expect(warnings).toContain('Não importados (sem lugar no app): backdrop.');
  });

  it('fills page 2: convictions, touchstones, sire, embrace and the portrait', () => {
    const { ficha } = migrate();
    expect(ficha.beliefs).toEqual({ chronicleTenets: '', convictions: 'Nunca trair a família', touchstones: 'Irmã — mora em Recife' });
    expect(ficha.profile).toMatchObject({ sire: '', embraced: '1998', photo: 'data:image/jpeg;base64,AAAA' });
    expect(ficha.notes).not.toContain('Convicções');
  });

  it('drops a portrait too large to store, with a warning', () => {
    const { ficha, warnings } = migrate({ ...legacyCharacter(), portrait: `data:image/png;base64,${'A'.repeat(500_000)}` });
    expect(ficha.profile.photo).toBe('');
    expect(warnings).toContain('Não importados (sem lugar no app): portrait, backdrop.');
  });

  it('falls back to defaults when sections are missing', () => {
    const { ficha } = migrate({ name: 'Mínimo', attributes: {}, skills: {}, trackers: {} });
    expect(ficha.trackers.health.max).toBe(1);
    expect(ficha.attributes.strength).toBe(1);
    expect(ficha.notes).toBe('');
  });

  it('rejects a character without a name', () => {
    expect(migrateLegacyPedro({ ...legacyCharacter(), name: '  ' }, () => 'x')).toEqual({ error: 'Ficha do app do Pedro sem nome.' });
  });
});
