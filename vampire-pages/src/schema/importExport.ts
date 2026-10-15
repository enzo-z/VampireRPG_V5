import { SCHEMA_VERSION, type Ficha, type SheetFile } from '../domain/character.ts';
import { formatIssues } from './issues.ts';
import { looksLikeLegacyPedro, migrateLegacyPedro } from './legacyPedro.ts';
import { migrateToCurrent, SUPPORTED_VERSIONS } from './migrations.ts';
import { sheetFileSchema } from './sheetFile.ts';

export type ImportResult =
  | { ok: true; file: SheetFile; warnings: string[] }
  | { ok: false; error: string };

export interface ImportOptions {
  /** Id generator for fichas that need a fresh id (legacy imports). */
  newId?: () => string;
}

function validate(candidate: unknown, warnings: string[]): ImportResult {
  const result = sheetFileSchema.safeParse(candidate);
  return result.success
    ? { ok: true, file: result.data, warnings }
    : { ok: false, error: `Arquivo inválido:\n${formatIssues(result.error.issues)}` };
}

/** Parses an exported file (schema v1) or a single character exported by Pedro's app. */
export function parseSheetFile(text: string, options: ImportOptions = {}): ImportResult {
  const newId = options.newId ?? (() => crypto.randomUUID());

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'O arquivo não é um JSON válido.' };
  }

  if (typeof data === 'object' && data !== null && !Array.isArray(data) && 'schemaVersion' in data) {
    const version = data.schemaVersion;
    const migrated = typeof version === 'number' ? migrateToCurrent(data as Record<string, unknown>, version, SCHEMA_VERSION) : null;
    if (migrated === null) {
      const versions = `${SUPPORTED_VERSIONS.slice(0, -1).join(', ')} e ${SUPPORTED_VERSIONS.at(-1)}`;
      return { ok: false, error: `Versão ${JSON.stringify(version)} não suportada; este app lê as versões ${versions}.` };
    }
    return validate(migrated, []);
  }

  if (looksLikeLegacyPedro(data)) {
    const migration = migrateLegacyPedro(data, newId);
    if ('error' in migration) return { ok: false, error: migration.error };
    return validate({ schemaVersion: SCHEMA_VERSION, fichas: [migration.ficha] }, migration.warnings);
  }

  return { ok: false, error: `Formato não reconhecido: esperado { "schemaVersion": ${SCHEMA_VERSION}, "fichas": [...] } ou uma ficha do app do Pedro.` };
}

export function serializeSheetFile(fichas: readonly Ficha[]): string {
  const file: SheetFile = { schemaVersion: SCHEMA_VERSION, fichas: [...fichas] };
  return JSON.stringify(file, null, 2);
}
