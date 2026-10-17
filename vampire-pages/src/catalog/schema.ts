import { z } from 'zod';
import type { AdvantageCatalog, BloodCatalog, ClanCatalog, ColaCatalog, DisciplineCatalog, NyMapCatalog, PredatorTypeCatalog, SecretsCatalog, VaultCatalog } from './types.ts';

const field = z.strictObject({ label: z.string().min(1), html: z.string() });

const entry = z.strictObject({
  name: z.string().min(1),
  level: z.int().min(0).max(5),
  kind: z.enum(['power', 'ritual', 'ceremony', 'formula']),
  source: z.string().nullable(),
  fields: z.array(field),
  descriptionHtml: z.string(),
  systemHtml: z.string(),
});

const note = z.strictObject({
  noteName: z.string().min(1),
  kind: z.enum(['disciplina', 'rituais', 'cerimonias']),
  discipline: z.string().min(1),
  nicknames: z.array(z.string()),
  category: z.string().nullable(),
  masquerade: z.string().nullable(),
  resonance: z.string().nullable(),
  introHtml: z.string(),
  sections: z.array(z.strictObject({ title: z.string(), html: z.string() })),
  entries: z.array(entry),
});

export const disciplineCatalogSchema = z.strictObject({ notes: z.array(note) }) satisfies z.ZodType<DisciplineCatalog>;

const advantage = z.strictObject({
  name: z.string().min(1),
  category: z.enum(['merit', 'background', 'flaw', 'loresheet']),
  group: z.string().nullable(),
  points: z.strictObject({ min: z.int().min(0), max: z.int().min(1) }),
  pointsLabel: z.string(),
  aliases: z.array(z.string()),
  source: z.string().nullable(),
  fields: z.array(field),
  descriptionHtml: z.string(),
  systemHtml: z.string(),
});

export const advantageCatalogSchema = z.strictObject({ entries: z.array(advantage) }) satisfies z.ZodType<AdvantageCatalog>;

const predatorType = z.strictObject({
  title: z.string().min(1),
  names: z.array(z.string().min(1)).min(1),
  source: z.string().nullable(),
  html: z.string(),
});

export const predatorTypeCatalogSchema = z.strictObject({ entries: z.array(predatorType) }) satisfies z.ZodType<PredatorTypeCatalog>;

const potencyRow = z.strictObject({
  level: z.int().min(0).max(10),
  surge: z.string(),
  mend: z.string(),
  disciplineBonus: z.string(),
  rouseReRoll: z.string(),
  baneSeverity: z.string(),
  feeding: z.string(),
});

export const bloodCatalogSchema = z.strictObject({
  generations: z.array(z.strictObject({ title: z.string().min(1), generations: z.array(z.int().min(1)).min(1), html: z.string() })),
  potencyLevels: z.array(z.strictObject({ level: z.int().min(0).max(10), orMore: z.boolean(), html: z.string() })),
  potencyTable: z.array(potencyRow),
}) satisfies z.ZodType<BloodCatalog>;

const clanSection = z.strictObject({ title: z.string().min(1), html: z.string() }).nullable();

export const clanCatalogSchema = z.strictObject({
  entries: z.array(
    z.strictObject({
      name: z.string().min(1),
      aliases: z.array(z.string()),
      source: z.string().nullable(),
      sect: z.string(),
      disciplines: z.array(z.string().min(1)),
      baneSummary: z.string(),
      compulsionSummary: z.string(),
      descriptionHtml: z.string(),
      bane: clanSection,
      compulsion: clanSection,
    }),
  ),
}) satisfies z.ZodType<ClanCatalog>;

export const colaCatalogSchema = z.strictObject({
  blocks: z.array(
    z.strictObject({
      title: z.string().min(1),
      html: z.string(),
      entries: z.array(z.strictObject({ term: z.string().min(1), html: z.string() })),
    }),
  ),
}) satisfies z.ZodType<ColaCatalog>;

export const secretsCatalogSchema = z.strictObject({
  documents: z.array(
    z.strictObject({
      slug: z.string().min(1),
      character: z.string().min(1),
      title: z.string().min(1),
      introHtml: z.string(),
      sections: z.array(z.strictObject({ title: z.string().min(1), html: z.string() })),
    }),
  ),
}) satisfies z.ZodType<SecretsCatalog>;

export const vaultCatalogSchema = z.strictObject({
  notes: z.array(
    z.strictObject({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().min(1),
      group: z.string().min(1),
      order: z.number(),
      banner: z.int().min(0).nullable(),
      html: z.string().min(1),
      headings: z.array(z.strictObject({ id: z.string().min(1), title: z.string(), depth: z.int().min(1).max(6) })),
      sections: z.array(z.strictObject({ headingId: z.string().nullable(), title: z.string(), text: z.string() })),
    }),
  ),
}) satisfies z.ZodType<VaultCatalog>;

const nyFaction = z.enum(['cam', 'camSoft', 'anarch', 'anarchSoft', 'indep', 'sabbat', 'unk']);
const nyLayer = z.enum(['now', 'pc', 'auld', 'b1999', 'hist']);
const nySource = z.enum(['jogos', 'livro', 'notas', 'sug', 'ant']);
const nyBorough = z.enum(['manhattan', 'brooklyn', 'queens', 'bronx', 'staten', 'nj']);
const nyParagraph = z.strictObject({ html: z.string().min(1), sources: z.array(nySource) });
const nyOverview = z.strictObject({ title: z.string().min(1), paragraphs: z.array(nyParagraph).min(1) });
const nyMarks = z.array(z.strictObject({ kind: z.enum(['base', 'presence']), html: z.string().min(1) })).min(1);

export const nyMapCatalogSchema = z.strictObject({
  factions: z.array(z.strictObject({ key: nyFaction, name: z.string().min(1) })).min(1),
  layers: z.array(z.strictObject({ id: nyLayer, name: z.string().min(1) })).min(1),
  overview: nyOverview,
  overviewBefore: nyOverview,
  court: z.array(z.strictObject({ name: z.string().min(1), role: z.string().min(1) })).min(1),
  boroughs: z
    .array(
      z.strictObject({
        id: nyBorough,
        name: z.string().min(1),
        faction: nyFaction,
        factionBefore: nyFaction,
        status: z.string().min(1),
        area: z.string().nullable(),
        population: z.string().nullable(),
        summaryHtml: z.string().min(1),
        clans: z.array(z.strictObject({ clan: z.string().min(1), whoHtml: z.string().min(1), sources: z.array(nySource) })),
        beforeHtml: z.string().min(1),
        noteHtml: z.string().nullable(),
      }),
    )
    .min(1),
  points: z.array(
    z.strictObject({
      id: z.string().min(1),
      name: z.string().min(1),
      label: z.string().min(1),
      layers: z.array(nyLayer).min(1),
      borough: nyBorough.nullable(),
      lon: z.number().min(-75).max(-73),
      lat: z.number().min(40).max(41.5),
      approximate: z.boolean(),
      labelLeft: z.boolean(),
      sources: z.array(nySource),
      html: z.string(),
    }),
  ),
  edges: z.array(
    z.strictObject({ id: z.string().min(1), label: z.string().min(1), name: z.string().min(1), sources: z.array(nySource), html: z.string() }),
  ),
  ledger: z.array(
    z.strictObject({
      clan: z.string().min(1),
      cells: z.strictObject({
        manhattan: nyMarks.optional(),
        brooklyn: nyMarks.optional(),
        queens: nyMarks.optional(),
        bronx: nyMarks.optional(),
        staten: nyMarks.optional(),
        nj: nyMarks.optional(),
        city: nyMarks.optional(),
      }),
    }),
  ),
  cards: z.array(z.strictObject({ title: z.string().min(1), html: z.string().min(1) })),
}) satisfies z.ZodType<NyMapCatalog>;
