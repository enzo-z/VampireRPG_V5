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

/** A "Lista de Gerações" section of Gerações e Potência.md. */
export interface GenerationEntry {
  title: string;
  generations: number[];
  html: string;
}

/** A "### Blood Potency N" section; `orMore` covers every higher level too. */
export interface PotencyLevelEntry {
  level: number;
  orMore: boolean;
  html: string;
}

/** One row of the Blood Potency table, as written in the note. */
export interface PotencyRowEntry {
  level: number;
  surge: string;
  mend: string;
  disciplineBonus: string;
  rouseReRoll: string;
  baneSeverity: string;
  feeding: string;
}

export interface BloodCatalog {
  generations: GenerationEntry[];
  potencyLevels: PotencyLevelEntry[];
  potencyTable: PotencyRowEntry[];
}

/** A bane or compulsion section of Clãs.md. */
export interface ClanSectionEntry {
  title: string;
  html: string;
}

/** A "# Perfis dos Clãs" profile of Clãs.md, with its bane and compulsion. */
export interface ClanEntry {
  name: string;
  aliases: string[];
  source: string | null;
  sect: string;
  disciplines: string[];
  /** Short enough for the Clan Bane / Compulsão boxes of the printed sheet. */
  baneSummary: string;
  compulsionSummary: string;
  descriptionHtml: string;
  bane: ClanSectionEntry | null;
  compulsion: ClanSectionEntry | null;
}

export interface ClanCatalog {
  entries: ClanEntry[];
}

/** A "### Term" of the player's cheat sheet (Cola do Jogador.md). */
export interface ColaEntry {
  term: string;
  html: string;
}

/** A "## Section" of the cheat sheet: its text and optional terms. */
export interface ColaBlock {
  title: string;
  html: string;
  entries: ColaEntry[];
}

export interface ColaCatalog {
  blocks: ColaBlock[];
}

/** A "## Section" of a player's secret document (README - Name.md). */
export interface SecretSection {
  title: string;
  html: string;
}

/** What one character knows, printed for that player only ("Segredos"). */
export interface SecretDocument {
  /** URL-safe id, from the character's name. */
  slug: string;
  character: string;
  title: string;
  introHtml: string;
  sections: SecretSection[];
}

export interface SecretsCatalog {
  documents: SecretDocument[];
}

// ---------- Vault (notes with publicar: true and vault: <group>) ----------

export interface VaultHeading {
  /** Unique within the note; also the anchor in the URL. */
  id: string;
  title: string;
  /** Markdown depth in the note: 1 for "#", 2 for "##"… */
  depth: number;
}

/** Plain text under one top-level heading, for search. */
export interface VaultSearchSection {
  /** Null for the text before the first heading. */
  headingId: string | null;
  title: string;
  text: string;
}

export interface VaultNote {
  /** URL-safe id, from the note's file name. */
  slug: string;
  title: string;
  /** Index group ("Regras", "Lore"…), from the frontmatter key `vault`. */
  group: string;
  /** Position in the Vault, from the frontmatter key `ordem`. */
  order: number;
  /** Index into the module's `assets`, or null. */
  banner: number | null;
  /** Images and audio carry data-vault-asset="N" instead of a src. */
  html: string;
  headings: VaultHeading[];
  sections: VaultSearchSection[];
}

export interface VaultCatalog {
  /** Sorted by order, then title. */
  notes: VaultNote[];
}

// ---------- New York map (Narrador/Nova York/Mapa de Nova York.md) ----------

/** Territory key, as written in the note ("Facções e legenda"). */
export type NyFactionKey = 'cam' | 'camSoft' | 'anarch' | 'anarchSoft' | 'indep' | 'sabbat' | 'unk';

/** Point layer: places of 2021, the coterie, the one-shot, the 1999 battle, history. */
export type NyLayerId = 'now' | 'pc' | 'auld' | 'b1999' | 'hist';

/** Source tag: V5 games, V5 books, narrator notes, suggestion, earlier edition. */
export type NySourceKey = 'jogos' | 'livro' | 'notas' | 'sug' | 'ant';

export type NyBoroughId = 'manhattan' | 'brooklyn' | 'queens' | 'bronx' | 'staten' | 'nj';

/** Clan ledger column: a borough, or "Cidade" (in NY, borough unknown). */
export type NyLedgerColumn = NyBoroughId | 'city';

export interface NyFaction {
  key: NyFactionKey;
  name: string;
}

export interface NyLayer {
  id: NyLayerId;
  name: string;
}

/** A paragraph followed by the source tags that close it. */
export interface NyTaggedParagraph {
  html: string;
  sources: NySourceKey[];
}

export interface NyClanRow {
  clan: string;
  whoHtml: string;
  sources: NySourceKey[];
}

export interface NyBorough {
  id: NyBoroughId;
  name: string;
  faction: NyFactionKey;
  /** Faction "antes de 1999". */
  factionBefore: NyFactionKey;
  status: string;
  /** "58,7" (km²), or null when the note shows none. */
  area: string | null;
  population: string | null;
  summaryHtml: string;
  clans: NyClanRow[];
  beforeHtml: string;
  /** "Observação do painel", if any. */
  noteHtml: string | null;
}

export interface NyPoint {
  id: string;
  name: string;
  /** Short label drawn next to the marker. */
  label: string;
  /** The first layer sets the marker's symbol. */
  layers: NyLayerId[];
  borough: NyBoroughId | null;
  lon: number;
  lat: number;
  approximate: boolean;
  labelLeft: boolean;
  sources: NySourceKey[];
  html: string;
}

/** An arrow on the map's edge pointing to a place outside it. */
export interface NyEdge {
  id: string;
  /** Text drawn on the map, with its arrow ("↑ Catskills"). */
  label: string;
  /** The label without arrows ("Catskills"). */
  name: string;
  sources: NySourceKey[];
  html: string;
}

export interface NyLedgerMark {
  /** "●" base/domain of the clan, "○" a known figure lives or acts there. */
  kind: 'base' | 'presence';
  html: string;
}

export interface NyLedgerRow {
  clan: string;
  cells: Partial<Record<NyLedgerColumn, NyLedgerMark[]>>;
}

export interface NyCard {
  title: string;
  html: string;
}

export interface NyCourtEntry {
  name: string;
  role: string;
}

export interface NyOverview {
  title: string;
  paragraphs: NyTaggedParagraph[];
}

export interface NyMapCatalog {
  factions: NyFaction[];
  layers: NyLayer[];
  /** Panel with nothing selected, in 2021 and before 1999. */
  overview: NyOverview;
  overviewBefore: NyOverview;
  court: NyCourtEntry[];
  boroughs: NyBorough[];
  points: NyPoint[];
  edges: NyEdge[];
  ledger: NyLedgerRow[];
  cards: NyCard[];
}

/** The lore page of one player's cheat sheet (Regras/Colas dos Jogadores/<character>.md). */
export interface PlayerColaNote {
  /** Character name, from the file name. */
  name: string;
  cola: ColaCatalog;
}

export interface PlayerColaCatalog {
  notes: PlayerColaNote[];
}
