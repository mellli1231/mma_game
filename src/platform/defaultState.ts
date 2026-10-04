import type { GameState } from '@/types'

export const DEFAULT_STATE: GameState = {
  version: 1,
  onboarded: false, trainerName: '', starterId: null,
  fp: 0, lifetimeFp: 0,
  creatures: [], squad: [], moveScrolls: [],
  currentGymLevel: 1,
  pendingReward: null, activeSession: null,
  sessionHistory: [], lastSeenSessionId: null, lastAdventureSetup: null,
  settings: { demoMode: false, sound: true },
  stats: { totalFocusMin: 0, adventuresCompleted: 0, adventuresAbandoned: 0, battlesWon: 0, battlesLost: 0 },
}
