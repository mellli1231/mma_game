import { DEFAULT_STATE, type GameState } from '@/dev/stubTypes'
import type { Platform } from './platform'

// TODO: use CONFIG.STORAGE_KEY once src/data/config.ts lands.
const STORAGE_KEY = 'locklings:v1'

const listeners = new Set<(s: GameState) => void>()

function read(): GameState {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as GameState) : structuredClone(DEFAULT_STATE)
}

function write(s: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  listeners.forEach(cb => cb(s))
}

// TODO (A3): real in-page session logic.
export const webPlatform: Platform = {
  isExtension: false,
  loadState: async () => read(),
  updateState: async mutator => {
    const next = mutator(read())
    write(next)
    return next
  },
  subscribe(cb) {
    listeners.add(cb)
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) cb(read()) }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  },
  startSession: async () => ({ ok: false, error: 'NOT_IMPLEMENTED' }),
  checkSession: async () => null,
  abandonSession: async () => {},
}
