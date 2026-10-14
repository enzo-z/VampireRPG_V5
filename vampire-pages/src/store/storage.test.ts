import { describe, expect, it } from 'vitest';
import { createFicha } from '../domain/defaults.ts';
import { serializeSheetFile } from '../schema/importExport.ts';
import { ACTIVE_KEY, SHEETS_KEY, loadState, memoryStorage, saveState, type KeyValueStorage } from './storage.ts';

const nina = createFicha('nina', 'Nina');
const vincent = createFicha('vincent', 'Vincent');
const fixedNow = () => new Date('2026-10-15T12:00:00.000Z');

function storageWith(entries: Record<string, string>): KeyValueStorage {
  const storage = memoryStorage();
  Object.entries(entries).forEach(([key, value]) => storage.setItem(key, value));
  return storage;
}

describe('storage', () => {
  it('starts empty when nothing is stored', () => {
    expect(loadState(memoryStorage())).toEqual({ state: { fichas: [], activeId: null }, notice: null });
  });

  it('saves and loads the same state', () => {
    const storage = memoryStorage();
    expect(saveState(storage, { fichas: [nina, vincent], activeId: 'vincent' })).toEqual({ ok: true });
    expect(loadState(storage)).toEqual({ state: { fichas: [nina, vincent], activeId: 'vincent' }, notice: null });
  });

  it('falls back to the first ficha when the stored active id is gone', () => {
    const storage = storageWith({ [SHEETS_KEY]: serializeSheetFile([nina]), [ACTIVE_KEY]: 'ghost' });
    expect(loadState(storage).state.activeId).toBe('nina');
  });

  it('preserves corrupt data under a backup key and starts empty', () => {
    const storage = storageWith({ [SHEETS_KEY]: '{ broken' });
    const result = loadState(storage, fixedNow);
    const backupKey = `${SHEETS_KEY}:corrupt-2026-10-15T12:00:00.000Z`;

    expect(result.state).toEqual({ fichas: [], activeId: null });
    expect(result.notice).toContain(backupKey);
    expect(storage.getItem(backupKey)).toBe('{ broken');
  });

  it('reports a failed save (e.g. quota exceeded) instead of throwing', () => {
    const full: KeyValueStorage = {
      ...memoryStorage(),
      setItem: () => {
        throw new DOMException('quota', 'QuotaExceededError');
      },
    };
    const result = saveState(full, { fichas: [nina], activeId: 'nina' });
    expect(result.ok).toBe(false);
  });

  it('treats a storage that throws on read as empty', () => {
    const blocked: KeyValueStorage = {
      ...memoryStorage(),
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
    };
    expect(loadState(blocked).state).toEqual({ fichas: [], activeId: null });
  });
});
