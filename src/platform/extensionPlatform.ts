import type { Platform } from './platform'
import { createStorage, type KvAdapter } from './storage'

const chromeAdapter: KvAdapter = {
  get: async key => (await chrome.storage.local.get(key))[key],
  set: (key, value) => chrome.storage.local.set({ [key]: value }),
  onExternalChange(key, cb) {
    const onChanged = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[key]) cb(changes[key].newValue)
    }
    chrome.storage.onChanged.addListener(onChanged)
    return () => chrome.storage.onChanged.removeListener(onChanged)
  },
}

const storage = createStorage(chromeAdapter)

// TODO (A3): send SESSION_START, SESSION_CHECK and SESSION_ABANDON to the background (SPEC 9.10).
export const extensionPlatform: Platform = {
  isExtension: true,
  ...storage,
  startSession: async () => ({ ok: false, error: 'NOT_IMPLEMENTED' }),
  checkSession: async () => null,
  abandonSession: async () => {},
}
