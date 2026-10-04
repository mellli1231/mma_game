import { SITES } from '../data/sites'
import { calculateFp } from '../engine/points'
import { extensionPlatform as store } from '../platform/extensionPlatform'
import type { StartSessionInput, StartSessionResult } from '../platform/platform'
import type { FocusSession } from '../types'
import { applyBlockRules, clearBlockRules, reloadMatchingTabs, toBlockEntries } from './blockRules'
import {
  DEMO_TIME_SCALE, HISTORY_MAX, SESSION_END_ALARM, SESSION_MAX_MIN, SESSION_MIN_MIN, SESSION_MIN_MIN_DEMO,
} from './constants'
import { checkCustomDomains } from './domains'

// The service worker is the only writer of activeSession. Every operation runs one at a time,
// so two racing calls (alarm and SESSION_CHECK) can never both award FP.
let queue: Promise<unknown> = Promise.resolve()
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn)
  queue = run.catch(() => {})
  return run
}

const fail = (error: string) => ({ ok: false as const, error })

function validate(input: StartSessionInput, demoMode: boolean) {
  const min = demoMode ? SESSION_MIN_MIN_DEMO : SESSION_MIN_MIN
  if (!Number.isInteger(input.durationMin) || input.durationMin < min || input.durationMin > SESSION_MAX_MIN) {
    return fail('INVALID_DURATION')
  }
  if (!Array.isArray(input.siteIds) || !Array.isArray(input.customDomains)) return fail('NO_SITES')
  if (input.siteIds.some(id => typeof id !== 'string' || !SITES[id])) return fail('NO_SITES')
  const domains = checkCustomDomains(input.customDomains)
  if (!domains.ok) return fail('INVALID_DOMAIN')
  const siteIds = [...new Set([...input.siteIds, ...domains.extraSiteIds])]
  if (siteIds.length + domains.customDomains.length < 1) return fail('NO_SITES')
  return { ok: true as const, siteIds, customDomains: domains.customDomains }
}

export function startSession(input: StartSessionInput): Promise<StartSessionResult> {
  return serialize(async () => {
    const s = await store.loadState()
    if (s.activeSession) return fail('ALREADY_ACTIVE')
    const demo = s.settings.demoMode
    const checked = validate(input, demo)
    if (!checked.ok) return checked
    let calc
    try {
      calc = calculateFp(input.durationMin, checked.siteIds)
    } catch {
      return fail('INVALID_DURATION')
    }
    const now = Date.now()
    const scale = demo ? DEMO_TIME_SCALE : 1
    const session: FocusSession = {
      id: crypto.randomUUID(),
      startedAt: now,
      endsAt: now + (input.durationMin * 60_000) / scale,
      durationMin: input.durationMin,
      siteIds: checked.siteIds,
      customDomains: checked.customDomains,
      tierName: calc.tierName,
      rate: calc.rate,
      baseFp: calc.baseFp,
      activatedCategoryIds: calc.activated,
      multiplier: calc.multiplier,
      projectedFp: calc.projectedFp,
      status: 'active',
      awardedFp: 0,
      endedAt: null,
      isDemo: demo,
    }
    const entries = toBlockEntries(session)
    await applyBlockRules(entries)
    await store.updateState(st => ({
      ...st,
      activeSession: session,
      lastAdventureSetup: { durationMin: input.durationMin, siteIds: checked.siteIds, customDomains: checked.customDomains },
    }))
    await chrome.alarms.create(SESSION_END_ALARM, { when: session.endsAt })
    await reloadMatchingTabs(entries).catch(() => {})
    return { ok: true, session }
  })
}

async function completeNow(): Promise<FocusSession | null> {
  const active = (await store.loadState()).activeSession
  if (!active) return null
  let done: FocusSession | null = null
  await store.updateState(st => {
    if (st.activeSession?.id !== active.id) return st
    done = { ...active, status: 'completed', awardedFp: active.projectedFp, endedAt: Date.now() }
    return {
      ...st,
      activeSession: null,
      fp: st.fp + active.projectedFp,
      lifetimeFp: st.lifetimeFp + active.projectedFp,
      sessionHistory: [done, ...st.sessionHistory].slice(0, HISTORY_MAX),
      stats: {
        ...st.stats,
        totalFocusMin: st.stats.totalFocusMin + active.durationMin,
        adventuresCompleted: st.stats.adventuresCompleted + 1,
      },
    }
  })
  // State is saved before rules are cleared: a crash in between is repaired by reconcile().
  await clearBlockRules()
  await chrome.alarms.clear(SESSION_END_ALARM)
  if (done) {
    chrome.notifications
      .create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Adventure complete!',
        message: `+${active.projectedFp} FP. Your Locklings are stronger.`,
      })
      .catch(() => {})
  }
  return done
}

/** Completes the session if its time is up. Returns the finished session, or null. */
export function completeIfDue(): Promise<FocusSession | null> {
  return serialize(async () => {
    const a = (await store.loadState()).activeSession
    return a && Date.now() >= a.endsAt ? completeNow() : null
  })
}

export function abandon(reason: 'gave_up' | 'visited_blocked', siteId?: string): Promise<void> {
  return serialize(async () => {
    const active = (await store.loadState()).activeSession
    if (active) {
      await store.updateState(st => {
        if (st.activeSession?.id !== active.id) return st
        const lost: FocusSession = {
          ...active,
          status: 'abandoned',
          awardedFp: 0,
          endedAt: Date.now(),
          abandonReason: reason,
          ...(siteId ? { abandonedSiteId: siteId } : {}),
        }
        return {
          ...st,
          activeSession: null,
          sessionHistory: [lost, ...st.sessionHistory].slice(0, HISTORY_MAX),
          stats: { ...st.stats, adventuresAbandoned: st.stats.adventuresAbandoned + 1 },
        }
      })
    }
    await clearBlockRules()
    await chrome.alarms.clear(SESSION_END_ALARM)
  })
}

export function getActiveSession(): Promise<FocusSession | null> {
  return store.loadState().then(s => s.activeSession)
}

/** Runs on worker load, onStartup and onInstalled (BLK-07). */
export function reconcile(): Promise<void> {
  return serialize(async () => {
    const a = (await store.loadState()).activeSession
    if (!a) return clearBlockRules()
    if (Date.now() >= a.endsAt) {
      await completeNow()
      return
    }
    await applyBlockRules(toBlockEntries(a))
    await chrome.alarms.create(SESSION_END_ALARM, { when: a.endsAt })
  })
}
