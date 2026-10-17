import { bestMatch } from './fuzzy.ts';
import type { ColaCatalog, PlayerColaCatalog } from './types.ts';

/** The lore page written for this character, matched by name (accents, case and small typos tolerated). */
export function findPlayerCola(catalog: PlayerColaCatalog, characterName: string): ColaCatalog | null {
  if (characterName.trim() === '') return null;
  const candidates = catalog.notes.map((note) => ({ item: note, names: [note.name] }));
  return bestMatch(characterName, candidates)?.item.cola ?? null;
}
