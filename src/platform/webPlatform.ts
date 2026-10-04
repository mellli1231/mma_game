import type { Platform } from './platform'
import { createStorage, type KvAdapter } from './storage'

const localAdapter: KvAdapter = {
  get: async key => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  },
  set: async (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  onExternalChange(key, cb) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb(e.newValue ? JSON.parse(e.newValue) : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },
}

const storage = createStorage(localAdapter)

// TODO (A3): real in-page session logic.
export const webPlatform: Platform = {
  isExtension: false,
  ...storage,
  startSession: async () => ({ ok: false, error: 'NOT_IMPLEMENTED' }),
  checkSession: async () => null,
  abandonSession: async () => {},
}
