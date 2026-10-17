import type { VaultNote } from '../../catalog/types.ts';

export interface VaultGroup {
  name: string;
  notes: VaultNote[];
}

/** Groups in the order their first note appears (notes come sorted by `ordem`). */
export function groupVaultNotes(notes: readonly VaultNote[]): VaultGroup[] {
  const groups: VaultGroup[] = [];
  for (const note of notes) {
    const group = groups.find((candidate) => candidate.name === note.group);
    if (group === undefined) groups.push({ name: note.group, notes: [note] });
    else group.notes.push(note);
  }
  return groups;
}

/** The notes before and after `slug` in reading order. */
export function vaultNeighbors(notes: readonly VaultNote[], slug: string): { previous: VaultNote | null; next: VaultNote | null } {
  const index = notes.findIndex((note) => note.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return { previous: notes[index - 1] ?? null, next: notes[index + 1] ?? null };
}

/** Table of contents: the note's two outermost heading levels. */
export function vaultToc(note: VaultNote): VaultNote['headings'] {
  const depths = [...new Set(note.headings.map((heading) => heading.depth))].sort((a, b) => a - b).slice(0, 2);
  return note.headings.filter((heading) => depths.includes(heading.depth));
}
