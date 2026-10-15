import { describe, expect, it } from 'vitest';
import { colaBlock } from './cola.ts';
import type { ColaBlock, ColaCatalog } from './types.ts';

const block = (title: string): ColaBlock => ({ title, html: '', entries: [] });
const COLA: ColaCatalog = {
  blocks: [block('Willpower (importante)'), block('Blood Surge (Ímpeto do Sangue)'), block('Clãs'), block('Fome')],
};

describe('colaBlock', () => {
  it('finds a block by its exact title, ignoring case and accents', () => {
    expect(colaBlock(COLA, 'clas')?.title).toBe('Clãs');
  });

  it('finds a block whose title adds a note after the expected one', () => {
    expect(colaBlock(COLA, 'Willpower')?.title).toBe('Willpower (importante)');
    expect(colaBlock(COLA, 'Blood Surge')?.title).toBe('Blood Surge (Ímpeto do Sangue)');
  });

  it('does not match a title that merely starts with the same letters', () => {
    expect(colaBlock(COLA, 'Fo')).toBeNull();
    expect(colaBlock(COLA, 'Humanidade')).toBeNull();
  });
});
