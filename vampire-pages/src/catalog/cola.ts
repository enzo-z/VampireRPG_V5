import { normalizeLabel } from './parseNote.ts';
import type { ColaBlock, ColaCatalog } from './types.ts';

/**
 * The block for `title`: same title, or a title that starts with it, ignoring case and
 * accents, so the note can say "Willpower (Importante)" or "Blood Surge/Ímpeto do Sangue".
 */
export function colaBlock(cola: ColaCatalog, title: string): ColaBlock | null {
  const wanted = normalizeLabel(title);
  return cola.blocks.find((block) => {
    const name = normalizeLabel(block.title);
    return name === wanted || name.startsWith(`${wanted} `);
  }) ?? null;
}
