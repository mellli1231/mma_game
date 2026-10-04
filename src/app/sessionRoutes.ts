import type { FocusSession, GameState } from '@/types'

/** Routes that stay reachable while an Adventure is active (RUN-06). Dev tools are exempt. */
const OPEN_DURING_SESSION = ['/adventure', '/lockdex', '/settings', '/dev', '/gallery']

/** Routes that are blocked while a Lockbox is waiting to be claimed. */
const LOCKED_BY_REWARD = ['/gyms', '/battle']

/** The newest ended session the player has not been shown yet (DONE-05), or null. */
export function unseenEndedSession(state: GameState): FocusSession | null {
  const latest = state.sessionHistory[0]
  return latest && latest.id !== state.lastSeenSessionId ? latest : null
}

/** Where a route should redirect to, or null to render it. Pure so the rules are easy to read. */
export function sessionRedirect(state: GameState, pathname: string): string | null {
  if (!state.onboarded) return null
  if (state.activeSession) {
    return OPEN_DURING_SESSION.includes(pathname) ? null : '/adventure'
  }
  const unseen = unseenEndedSession(state)
  // /adventure/result is never redirected here: the page marks its session seen on mount,
  // so a guard on "unseen" would bounce the player away. The page sends itself Home if empty.
  if (pathname === '/adventure') return unseen ? '/adventure/result' : '/'
  if (pathname === '/' && unseen) return '/adventure/result'
  if (state.pendingReward && LOCKED_BY_REWARD.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return '/lockbox'
  }
  return null
}
