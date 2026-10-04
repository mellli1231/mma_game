import { CREATURES } from '@/data/creatures'
import { DEFAULT_STATE } from '@/platform/defaultState'
import type { FixtureId, GameState, OwnedCreature } from '@/types'

const creature = (defId: string): OwnedCreature => ({
  uid: `u_${defId}`, defId, moveIds: [...CREATURES[defId].defaultMoveIds], obtainedAt: 0,
})

function base(defIds: string[], squad: string[], fp: number, gym: number, demoMode: boolean): GameState {
  return {
    ...structuredClone(DEFAULT_STATE),
    onboarded: true, trainerName: 'Tester',
    starterId: 'embrit',
    fp, lifetimeFp: fp,
    creatures: defIds.map(creature),
    squad: squad.map(id => `u_${id}`),
    currentGymLevel: gym,
    settings: { demoMode, sound: true },
  }
}

const mid = () => base(['embrit', 'tidepup'], ['embrit', 'tidepup'], 900, 1, true)

export const FIXTURES: Record<FixtureId, () => GameState> = {
  fresh: () => structuredClone(DEFAULT_STATE),
  mid,
  rich: () => ({
    ...base(Object.keys(CREATURES), ['embrit', 'puddlo', 'sproutle'], 5000, 3, true),
    moveScrolls: ['fire_blaze_burst'],
  }),
  battleReady: () => base(['embrit', 'tidepup', 'mossling'], ['embrit', 'tidepup', 'mossling'], 600, 1, true),
  pendingReward: () => ({
    ...base(['embrit', 'tidepup'], ['embrit', 'tidepup'], 300, 2, true),
    pendingReward: {
      gymLevel: 1, chosenIndex: null, applied: false,
      boxes: [
        { kind: 'move', moveId: 'fire_blaze_burst' },
        { kind: 'creature', creatureId: 'marinox' },
        { kind: 'fp', amount: 250 },
      ],
    },
  }),
  activeSession: () => base(['embrit'], ['embrit'], 300, 1, false),
  activeSessionAlmostDone: () => base(['embrit'], ['embrit'], 300, 1, true),
  // Alias of mid. Keep in sync with SPEC 15.1. If mid changes, the demo save changes.
  demoSave: mid,
}

/** One plain-English line per fixture, shown next to its button on the Dev page. */
export const DESCRIPTIONS: Record<FixtureId, string> = {
  fresh: 'Brand-new player: no creatures, 0 FP, onboarding not done',
  mid: 'Embrit and Tidepup, 900 FP, Gym 1, Demo Mode on',
  rich: 'All 9 creatures, 5000 FP, Gym 3, one spare move scroll',
  battleReady: 'Squad of Embrit, Tidepup and Mossling, 600 FP, Gym 1',
  pendingReward: 'Just beat Gym 1: 3 Lockboxes waiting',
  activeSession: 'Starts a REAL 25 minute Adventure blocking Instagram, TikTok and X',
  activeSessionAlmostDone: 'Starts a 1 minute Demo Mode Adventure that ends in about a second',
  demoSave: 'Same as mid. This is the pre-pitch save',
}

/** The two fixtures that also start a real session after the state is loaded. */
export const SESSION_FIXTURES: Partial<Record<FixtureId, { durationMin: number }>> = {
  activeSession: { durationMin: 25 },
  activeSessionAlmostDone: { durationMin: 1 },
}
export const SESSION_FIXTURE_SITES = ['instagram', 'tiktok', 'x']
