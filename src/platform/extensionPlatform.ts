import type { Platform } from './platform'
import * as session from './session'
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

export const extensionPlatform: Platform = {
  isExtension: true,
  ...storage,
  startSession: input => session.startSession(input),
  checkSession: async () => (await session.checkSession()).session,
  abandonSession: async (reason, siteId) => {
    await session.abandonSession(reason, siteId)
  },
}
