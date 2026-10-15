// Upgrades older exported files to the current schema before validation.
// Each step takes the previous version's data and returns the next version's.

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

/** v1 → v2: fichas gain an empty `advantages` list. */
function v1ToV2(file: Json): Json {
  const fichas = Array.isArray(file['fichas']) ? file['fichas'] : [];
  return {
    ...file,
    schemaVersion: 2,
    fichas: fichas.map((ficha) => (isObject(ficha) && !('advantages' in ficha) ? { ...ficha, advantages: [] } : ficha)),
  };
}

/** v2 → v3: fichas gain page 2 (beliefs and profile), empty. */
function v2ToV3(file: Json): Json {
  const fichas = Array.isArray(file['fichas']) ? file['fichas'] : [];
  const emptyBeliefs = { chronicleTenets: '', convictions: '', touchstones: '' };
  const emptyProfile = { sire: '', birthday: '', age: '', embraced: '', apparentAge: '', description: '', concept: '', photo: '' };
  return {
    ...file,
    schemaVersion: 3,
    fichas: fichas.map((ficha) =>
      isObject(ficha)
        ? { ...ficha, beliefs: ficha['beliefs'] ?? emptyBeliefs, profile: ficha['profile'] ?? emptyProfile }
        : ficha,
    ),
  };
}

const STEPS: Readonly<Record<number, (file: Json) => Json>> = { 1: v1ToV2, 2: v2ToV3 };

export const SUPPORTED_VERSIONS: readonly number[] = [1, 2, 3];

/** Applies every step from `version` up to the current schema; returns null for unknown versions. */
export function migrateToCurrent(file: Json, version: number, current: number): Json | null {
  if (!SUPPORTED_VERSIONS.includes(version)) return null;
  let data = file;
  for (let step = version; step < current; step += 1) {
    const migrate = STEPS[step];
    if (migrate === undefined) return null;
    data = migrate(data);
  }
  return data;
}
