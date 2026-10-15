import type { BloodCatalog, GenerationEntry, PotencyLevelEntry, PotencyRowEntry } from './types.ts';

/** The "Lista de Gerações" section that covers this generation. */
export function generationEntry(catalog: BloodCatalog, generation: number): GenerationEntry | null {
  return catalog.generations.find((entry) => entry.generations.includes(generation)) ?? null;
}

/** The "### Blood Potency N" section for this level ("6 e Maior" covers 6 and up). */
export function potencyLevelEntry(catalog: BloodCatalog, potency: number): PotencyLevelEntry | null {
  const exact = catalog.potencyLevels.find((entry) => entry.level === potency);
  if (exact !== undefined) return exact;
  const covering = catalog.potencyLevels.filter((entry) => entry.orMore && entry.level <= potency);
  return covering.sort((a, b) => b.level - a.level)[0] ?? null;
}

/** The Blood Potency table row for this level. */
export function potencyRow(catalog: BloodCatalog, potency: number): PotencyRowEntry | null {
  return catalog.potencyTable.find((row) => row.level === potency) ?? null;
}
