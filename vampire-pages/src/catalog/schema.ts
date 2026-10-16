import { z } from 'zod';
import type { AdvantageCatalog, BloodCatalog, ClanCatalog, ColaCatalog, DisciplineCatalog, PredatorTypeCatalog, SecretsCatalog } from './types.ts';

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
