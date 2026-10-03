import {
  CREATURE_DEFAULT_MOVES, DEFAULT_STATE,
  type FixtureId, type GameState, type OwnedCreature,
} from './stubTypes'

const creature = (defId: string): OwnedCreature => ({
  uid: `u_${defId}`, defId, moveIds: [...CREATURE_DEFAULT_MOVES[defId]], obtainedAt: 0,
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
    ...base(Object.keys(CREATURE_DEFAULT_MOVES), ['embrit', 'puddlo', 'sproutle'], 5000, 3, true),
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
  demoSave: mid,
}

/** The two fixtures that also start a real session after the state is loaded. */
export const SESSION_FIXTURES: Partial<Record<FixtureId, { durationMin: number }>> = {
  activeSession: { durationMin: 25 },
  activeSessionAlmostDone: { durationMin: 1 },
}
export const SESSION_FIXTURE_SITES = ['instagram', 'tiktok', 'x']
