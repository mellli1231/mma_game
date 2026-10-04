import type { GameState } from '@/types'
import { DEFAULT_STATE } from './defaultState'

// TODO: use CONFIG.STORAGE_KEY once B adds it to src/data/config.ts.
export const STORAGE_KEY = 'locklings:v1'

/** Minimal async key-value store; localStorage and chrome.storage.local both fit it. */
export interface KvAdapter {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  /** Calls cb when the key changes from outside this adapter (other tab or the background). */
  onExternalChange(key: string, cb: (value: unknown) => void): () => void
}

/** Version check for future schema changes. Unknown or missing data falls back to DEFAULT_STATE. */
export function migrate(raw: unknown): GameState {
  const fresh = structuredClone(DEFAULT_STATE)
  if (!raw || typeof raw !== 'object') return fresh
  const saved = raw as Partial<GameState>
  if (saved.version !== DEFAULT_STATE.version) return fresh
  return {
    ...fresh,
    ...saved,
    settings: { ...fresh.settings, ...saved.settings },
    stats: { ...fresh.stats, ...saved.stats },
  }
}

export function createStorage(adapter: KvAdapter) {
  const listeners = new Set<(s: GameState) => void>()

  async function loadState(): Promise<GameState> {
    return migrate(await adapter.get(STORAGE_KEY))
  }

  async function updateState(mutator: (s: GameState) => GameState): Promise<GameState> {
    const next = mutator(await loadState())
    await adapter.set(STORAGE_KEY, next)
    listeners.forEach(cb => cb(next))
    return next
  }

  function subscribe(cb: (s: GameState) => void): () => void {
    listeners.add(cb)
    const off = adapter.onExternalChange(STORAGE_KEY, value => cb(migrate(value)))
    return () => {
      listeners.delete(cb)
      off()
    }
  }

  return { loadState, updateState, subscribe }
}
