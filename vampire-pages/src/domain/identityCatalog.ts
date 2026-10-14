// Free-text identity fields matched against canonical entries with aliases
// (ported from prototype B). Matching ignores case, accents and punctuation.

export type CatalogField = 'clan' | 'sect' | 'predatorType' | 'generation';

export interface CatalogMatch {
  matched: boolean;
  canonical: string | null;
  options: readonly string[];
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Catalog {
  options: readonly string[];
  find: (text: string) => string | null;
}

/** Each entry is [canonical, ...aliases]. */
function makeCatalog(entries: readonly (readonly [string, ...string[]])[]): Catalog {
  const index = new Map<string, string>();
  for (const [canonical, ...aliases] of entries) {
    for (const name of [canonical, ...aliases]) index.set(normalizeText(name), canonical);
  }
  return { options: entries.map(([canonical]) => canonical), find: (text) => index.get(normalizeText(text)) ?? null };
}

const CATALOGS: Readonly<Record<Exclude<CatalogField, 'generation'>, Catalog>> = {
  clan: makeCatalog([
    ['Banu Haqim', 'Haqim', 'Assamita'], ['Brujah'], ['Gangrel'], ['Hecata', 'Giovanni'], ['Lasombra'], ['Malkavian'],
    ['The Ministry', 'Ministry', 'Ministério', 'Seguidores de Set'], ['Nosferatu'], ['Ravnos'], ['Salubri'],
    ['Toreador'], ['Tremere'], ['Tzimisce'], ['Ventrue'], ['Caitiff', 'Sem clã'], ['Thin-Blood', 'Sangue-Fraco', 'Sangue Ralo'],
  ]),
  sect: makeCatalog([
    ['Camarilla'], ['Anarch', 'Anarquista', 'Anarquistas', 'Anarcas'], ['Sabbat'], ['Independent', 'Independente', 'Independentes'],
  ]),
  predatorType: makeCatalog([
    ['Alleycat'], ['Bagger'], ['Blood Leech'], ['Cleaner'], ['Consensualist'], ['Extortionist'], ['Farmer'], ['Grim Reaper'],
    ['Graverobber'], ['Montero'], ['Osiris'], ['Pursuer'], ['Roadside Killer'], ['Sandman'], ['Scene Queen'], ['Siren', 'Sereia'], ['Trapdoor'],
  ]),
};

const GENERATION_RANGE = { min: 4, max: 16 } as const;

function matchGeneration(text: string): CatalogMatch {
  const digits = /\d+/.exec(text);
  const generation = digits === null ? Number.NaN : Number.parseInt(digits[0], 10);
  const matched = generation >= GENERATION_RANGE.min && generation <= GENERATION_RANGE.max;
  return {
    matched,
    canonical: matched ? `${generation}ª geração` : null,
    options: [`${GENERATION_RANGE.min}ª a ${GENERATION_RANGE.max}ª`],
  };
}

export function matchIdentity(field: CatalogField, text: string): CatalogMatch {
  if (field === 'generation') return matchGeneration(text);
  const catalog = CATALOGS[field];
  const canonical = catalog.find(text);
  return { matched: canonical !== null, canonical, options: catalog.options };
}
