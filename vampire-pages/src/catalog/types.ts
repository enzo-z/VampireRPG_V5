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

// ---------- Advantages (Advantages.md) ----------

export type AdvantageCategory = 'merit' | 'background' | 'flaw' | 'loresheet';

export interface AdvantagePoints {
  min: number;
  max: number;
}

export interface AdvantageEntry {
  name: string;
  category: AdvantageCategory;
  /** "## Group" the item sits under (Feeding, Looks, Fame…), if any. */
  group: string | null;
  points: AdvantagePoints;
  /** "Pontos" as written in the note, e.g. "• a •••". */
  pointsLabel: string;
  /** Portuguese names and spellings a sheet may use. */
  aliases: string[];
  source: string | null;
  /** Fields other than Fonte, Pontos, Apelidos and Sistema. */
  fields: CatalogField[];
  descriptionHtml: string;
  systemHtml: string;
}

export interface AdvantageCatalog {
  entries: AdvantageEntry[];
}

/** One "# Name" section of Predator Type.md. */
export interface PredatorTypeEntry {
  /** Heading as written, e.g. "Headhunter/Blood Leech". */
  title: string;
  /** Each name in the heading. */
  names: string[];
  source: string | null;
  html: string;
}

export interface PredatorTypeCatalog {
  entries: PredatorTypeEntry[];
}
