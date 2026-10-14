import { parseSheetFile, serializeSheetFile } from '../schema/importExport.ts';
import { EMPTY_SHEETS_STATE, type SheetsState } from './sheetsReducer.ts';

// localStorage persistence. The stored value is exactly the export format
// (SheetFile), so loading reuses the same validation as importing.

export const SHEETS_KEY = 'vampire-pages:sheets';
export const ACTIVE_KEY = 'vampire-pages:active';

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export interface LoadResult {
  state: SheetsState;
  /** Message for the user when something went wrong while loading. */
  notice: string | null;
}

export type SaveResult = { ok: true } | { ok: false; error: string };

function read(storage: KeyValueStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function loadState(storage: KeyValueStorage, now: () => Date = () => new Date()): LoadResult {
  const raw = read(storage, SHEETS_KEY);
  if (raw === null) return { state: EMPTY_SHEETS_STATE, notice: null };

  const parsed = parseSheetFile(raw);
  if (!parsed.ok) {
    const backupKey = `${SHEETS_KEY}:corrupt-${now().toISOString()}`;
    try {
      storage.setItem(backupKey, raw);
    } catch {
      return { state: EMPTY_SHEETS_STATE, notice: `As fichas salvas estão inválidas e não foi possível guardar uma cópia. ${parsed.error}` };
    }
    return {
      state: EMPTY_SHEETS_STATE,
      notice: `As fichas salvas estão inválidas; o conteúdo foi preservado em "${backupKey}". ${parsed.error}`,
    };
  }

  const fichas = parsed.file.fichas;
  const storedActive = read(storage, ACTIVE_KEY);
  const activeId = fichas.some((ficha) => ficha.id === storedActive) ? storedActive : (fichas[0]?.id ?? null);
  return { state: { fichas, activeId }, notice: null };
}

export function saveState(storage: KeyValueStorage, state: SheetsState): SaveResult {
  try {
    storage.setItem(SHEETS_KEY, serializeSheetFile(state.fichas));
    if (state.activeId === null) storage.removeItem(ACTIVE_KEY);
    else storage.setItem(ACTIVE_KEY, state.activeId);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Não foi possível salvar as fichas no navegador (armazenamento cheio ou bloqueado). Exporte um JSON para não perder dados.' };
  }
}

/** In-memory fallback when the browser blocks localStorage (e.g. some private modes). */
export function memoryStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

export function browserStorage(): KeyValueStorage {
  try {
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
}
