// TEMP: delete when src/types.ts and src/data land.
// Copied from SPEC 9.7 (types) and SPEC 8.2 (creature default moves).

export type ElementType = 'fire' | 'water' | 'grass'
export type Rarity = 'common' | 'rare' | 'epic'
export type MoveEffect = 'attack' | 'heal'

export interface OwnedCreature { uid: string; defId: string; moveIds: string[]; obtainedAt: number }

export type SessionStatus = 'active' | 'completed' | 'abandoned'
export interface FocusSession {
  id: string; startedAt: number; endsAt: number; durationMin: number
  siteIds: string[]; customDomains: string[]
  tierName: string; rate: number; baseFp: number; activatedCategoryIds: string[]
  multiplier: number; projectedFp: number
  status: SessionStatus; awardedFp: number; endedAt: number | null
  abandonReason?: 'gave_up' | 'visited_blocked'; abandonedSiteId?: string; isDemo: boolean
}

export type LockboxContent =
  | { kind: 'creature'; creatureId: string }
  | { kind: 'move'; moveId: string }
  | { kind: 'fp'; amount: number }
export interface PendingReward { gymLevel: number; boxes: LockboxContent[]; chosenIndex: number | null; applied: boolean }

export interface GameState {
  version: 1
  onboarded: boolean; trainerName: string; starterId: string | null
  fp: number; lifetimeFp: number
  creatures: OwnedCreature[]
  squad: string[]
  moveScrolls: string[]
  currentGymLevel: number
  pendingReward: PendingReward | null
  activeSession: FocusSession | null
  sessionHistory: FocusSession[]
  lastSeenSessionId: string | null
  lastAdventureSetup: { durationMin: number; siteIds: string[]; customDomains: string[] } | null
  settings: { demoMode: boolean; sound: boolean }
  stats: { totalFocusMin: number; adventuresCompleted: number; adventuresAbandoned: number
           battlesWon: number; battlesLost: number }
}

// From docs/CONTRACTS.md
export type FixtureId = 'fresh' | 'mid' | 'rich' | 'battleReady' | 'pendingReward'
  | 'activeSession' | 'activeSessionAlmostDone' | 'demoSave'

export const CREATURE_DEFAULT_MOVES: Record<string, string[]> = {
  embrit: ['fire_ember_flick', 'fire_flame_lash'],
  cindercub: ['fire_ember_flick', 'fire_kindle'],
  pyrowl: ['fire_flame_lash', 'fire_blaze_burst'],
  puddlo: ['water_splash_jab', 'water_tide_whip'],
  tidepup: ['water_splash_jab', 'water_soothing_mist'],
  marinox: ['water_tide_whip', 'water_riptide'],
  sproutle: ['grass_leaf_nick', 'grass_vine_snap'],
  mossling: ['grass_leaf_nick', 'grass_photosynthesize'],
  thornback: ['grass_vine_snap', 'grass_thorn_volley'],
}

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
