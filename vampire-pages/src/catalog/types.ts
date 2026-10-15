// Discipline catalog built at build time from the vault notes in
// "O Sangue (Vitae)/Disciplinas/". Markdown is already rendered to HTML.

/** Note kinds, from the `tipo` frontmatter key. */
export type CatalogNoteKind = 'disciplina' | 'rituais' | 'cerimonias';

export type CatalogEntryKind = 'power' | 'ritual' | 'ceremony' | 'formula';

export interface CatalogField {
  label: string;
  html: string;
}

export interface CatalogEntry {
  name: string;
  level: number;
  kind: CatalogEntryKind;
  /** "Fonte" field as plain text, e.g. "Core, p. 252". */
  source: string | null;
  /** Every field except Fonte and Sistema, in note order (Custo, Dice Pool, Duração…). */
  fields: CatalogField[];
  descriptionHtml: string;
  systemHtml: string;
}

export interface CatalogSection {
  title: string;
  html: string;
}

export interface CatalogNote {
  /** File name without ".md" (the Obsidian link target). */
  noteName: string;
  kind: CatalogNoteKind;
  /** Discipline the note belongs to (rituals and ceremonies point to their discipline). */
  discipline: string;
  nicknames: string[];
  category: string | null;
  masquerade: string | null;
  resonance: string | null;
  introHtml: string;
  sections: CatalogSection[];
  entries: CatalogEntry[];
}

export interface DisciplineCatalog {
  notes: CatalogNote[];
}
