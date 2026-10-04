import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_STATE } from '../src/platform/defaultState';
import { createStorage, migrate, type KvAdapter } from '../src/platform/storage';

describe('storage migration', () => {
  it('returns a fresh default state when storage is empty', () => {
    const result = migrate(null);

    expect(result).toEqual(DEFAULT_STATE);
    expect(result).not.toBe(DEFAULT_STATE);
    expect(result.settings).not.toBe(DEFAULT_STATE.settings);
    expect(result.stats).not.toBe(DEFAULT_STATE.stats);
  });

  it('preserves current-version values and fills missing defaults', () => {
    const result = migrate({
      version: DEFAULT_STATE.version,
      trainerName: 'Test trainer',
      fp: 450,
      settings: { demoMode: true },
      stats: { battlesWon: 3 },
    });

    expect(result).toMatchObject({
      ...DEFAULT_STATE,
      trainerName: 'Test trainer',
      fp: 450,
      settings: { demoMode: true, sound: DEFAULT_STATE.settings.sound },
      stats: { ...DEFAULT_STATE.stats, battlesWon: 3 },
    });
    expect(result.squad).toEqual(DEFAULT_STATE.squad);
    expect(result.sessionHistory).toEqual(DEFAULT_STATE.sessionHistory);
  });

  it('falls back to defaults when the saved schema version differs', () => {
    const result = migrate({
      version: DEFAULT_STATE.version + 1,
      trainerName: 'Future save',
      fp: 9999,
    });

    expect(result).toEqual(DEFAULT_STATE);
  });

  it('loads missing state and persists updates through the storage adapter', async () => {
    let value: unknown = null;
    let storedKey = '';
    let listener: ((nextValue: unknown) => void) | undefined;
    const adapter: KvAdapter = {
      get: async (key) => {
        storedKey = key;
        return value;
      },
      set: async (key, nextValue) => {
        storedKey = key;
        value = nextValue;
        listener?.(nextValue);
      },
      onExternalChange: (key, cb) => {
        storedKey = key;
        listener = cb;
        return () => {
          listener = undefined;
        };
      },
    };
    const storage = createStorage(adapter);
    const onState = vi.fn();
    const unsubscribe = storage.subscribe(onState);

    expect(await storage.loadState()).toEqual(DEFAULT_STATE);
    expect(storedKey).toBe('locklings:v1');

    const updated = await storage.updateState((state) => ({ ...state, fp: 700 }));
    expect(updated.fp).toBe(700);
    expect(value).toMatchObject({ version: DEFAULT_STATE.version, fp: 700 });
    expect(onState).toHaveBeenCalledWith(updated);

    unsubscribe();
  });
});
