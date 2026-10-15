import catalog from 'virtual:clans';
import { indexClans, type ClanIndex } from './clans.ts';

/** Clan profiles built from Clãs.md at build time. */
export const CLAN_INDEX: ClanIndex = indexClans(catalog);
