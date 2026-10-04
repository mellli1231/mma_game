import type { FocusSession } from '@/types'
import type { StartSessionInput, StartSessionResult } from './platform'

/** Message protocol between UI or blocked page and the background (SPEC 9.10). */
export type SessionMessage =
  | { type: 'SESSION_START'; input: StartSessionInput }
  | { type: 'SESSION_CHECK' }
  | { type: 'SESSION_ABANDON'; reason: 'gave_up' | 'visited_blocked'; siteId?: string }
  | { type: 'SESSION_GET' }

export interface SessionResponse {
  SESSION_START: StartSessionResult
  SESSION_CHECK: { session: FocusSession | null; justEnded?: FocusSession }
  SESSION_ABANDON: { ok: true }
  SESSION_GET: { session: FocusSession | null }
}

function send<T extends SessionMessage>(msg: T): Promise<SessionResponse[T['type']]> {
  return chrome.runtime.sendMessage(msg)
}

export const startSession = (input: StartSessionInput) => send({ type: 'SESSION_START', input })
export const checkSession = () => send({ type: 'SESSION_CHECK' })
export const getSession = () => send({ type: 'SESSION_GET' })
export const abandonSession = (reason: 'gave_up' | 'visited_blocked', siteId?: string) =>
  send({ type: 'SESSION_ABANDON', reason, siteId })
