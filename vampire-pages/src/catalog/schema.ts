import { z } from 'zod';
import type { DisciplineCatalog } from './types.ts';

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
