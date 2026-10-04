import type { SessionMessage } from '../platform/session'
import { SESSION_END_ALARM } from './constants'
import { abandon, completeIfDue, getActiveSession, reconcile, startSession } from './sessionManager'

// Toolbar icon opens the game in a tab, or focuses an existing one.
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('index.html')
  const [existing] = await chrome.tabs.query({ url })
  if (existing?.id !== undefined) {
    await chrome.tabs.update(existing.id, { active: true })
    await chrome.windows.update(existing.windowId, { focused: true })
  } else {
    await chrome.tabs.create({ url })
  }
})

// Session lifecycle (SPEC 9.10, 9.11). The worker is the only writer of activeSession.
chrome.runtime.onInstalled.addListener(() => void reconcile())
chrome.runtime.onStartup.addListener(() => void reconcile())
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === SESSION_END_ALARM) void completeIfDue()
})
void reconcile()

chrome.runtime.onMessage.addListener((msg: SessionMessage, _sender, sendResponse) => {
  const reply = async () => {
    switch (msg?.type) {
      case 'SESSION_START':
        return startSession(msg.input)
      case 'SESSION_CHECK': {
        const justEnded = await completeIfDue()
        return { session: await getActiveSession(), ...(justEnded ? { justEnded } : {}) }
      }
      case 'SESSION_ABANDON':
        await abandon(msg.reason, msg.siteId)
        return { ok: true }
      case 'SESSION_GET':
        return { session: await getActiveSession() }
      default:
        return undefined
    }
  }
  reply().then(sendResponse, () => sendResponse(undefined))
  return true
})
