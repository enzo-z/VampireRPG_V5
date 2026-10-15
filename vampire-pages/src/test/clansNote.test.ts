import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildClans } from '../../vite/buildClans.ts';
import { findClan, indexClans } from '../catalog/clans.ts';
import { matchIdentity } from '../domain/identityCatalog.ts';

// Contract between "Clãs.md" and the app: every clan the identity field knows has
// a profile, and the players' clans show bane, compulsion and disciplines.
const NOTE = fileURLToPath(new URL('../../../O Sangue (Vitae)/Clãs.md', import.meta.url));
const build = buildClans(NOTE);
const index = indexClans(build.data);

/** Longest Clan Bane / Compulsão that still fits the printed sheet (agreed worst case). */
const PRINTED_LIMIT = 200;

const PLAYER_CLANS = ['Toreador', 'Tzimisce', 'Banu Haqim', 'Brujah', 'Gangrel', 'Ravnos'];

describe('Clãs.md', () => {
  it('builds without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it('has a profile for every clan the identity field knows', () => {
    const missing = matchIdentity('clan', '').options.filter((clan) => findClan(index, clan) === null);
    expect(missing).toEqual([]);
  });

  it.each(PLAYER_CLANS)('%s (a player clan) has bane, compulsion and three disciplines', (name) => {
    const clan = findClan(index, name);
    expect(clan?.name).toBe(name);
    expect(clan?.bane).not.toBeNull();
    expect(clan?.compulsion).not.toBeNull();
    expect(clan?.disciplines).toHaveLength(3);
  });

  it('keeps the bane and compulsion summaries short enough for the printed sheet', () => {
    const tooLong = build.data.entries.filter((clan) => clan.baneSummary.length > PRINTED_LIMIT || clan.compulsionSummary.length > PRINTED_LIMIT);
    expect(tooLong.map((clan) => clan.name)).toEqual([]);
  });

  it('finds clans by their Portuguese and old names', () => {
    expect(findClan(index, 'Assamita')?.name).toBe('Banu Haqim');
    expect(findClan(index, 'Seguidores de Set')?.name).toBe('Ministry');
    expect(findClan(index, 'sangue fraco')?.name).toBe('Thin-Blood');
  });
});
