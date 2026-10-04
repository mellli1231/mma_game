export type ElementType = 'fire' | 'water' | 'grass';
export type MoveEffect = 'attack' | 'heal';
export type Rarity = 'common' | 'rare' | 'epic';
export type CategoryId = 'social' | 'video' | 'gaming' | 'messaging' | 'news' | 'shopping';
export type SpriteState = 'idle' | 'hop' | 'sentOut' | 'attack' | 'hit' | 'miss'
  | 'heal' | 'zonedOut' | 'celebrate' | 'selected' | 'sleepy';
export type FixtureId = 'fresh' | 'mid' | 'rich' | 'battleReady' | 'pendingReward'
  | 'activeSession' | 'activeSessionAlmostDone' | 'demoSave';

export interface FpBreakdown {
  tierName: string;
  rate: number;
  baseFp: number;
  activated: string[];
  rawMultiplier: number;
  multiplier: number;
  capped: boolean;
  projectedFp: number;
}

export interface LearnableMove {
  move: MoveDef;
  price: number;
  free: boolean;
  affordable: boolean;
}

export interface MoveDef {
  id: string;
  name: string;
  element: ElementType;
  effect: MoveEffect;
  power: number;
  usesPerBattle: number | null;
  price: number | null;
  rarity: Rarity;
  description: string;
}

export interface CreatureDef {
  id: string;
  name: string;
  element: ElementType;
  rarity: Rarity;
  isStarter: boolean;
  defaultMoveIds: string[];
  emoji: string;
  description: string;
}

export interface CategoryDef {
  id: CategoryId;
  name: string;
  multiplier: number;
  threshold: number;
  color: string;
  icon: string;
}

export interface SiteDef {
  id: string;
  name: string;
  categoryId: CategoryId;
  domains: string[];
  excludedDomains?: string[];
  emoji?: string;
}

export interface GymTeamMember {
  creatureId: string;
  moveIds: string[];
}

export interface GymDef {
  level: number;
  name: string;
  leader: string;
  quote: string;
  aiBestMoveChance: number;
  team: GymTeamMember[];
}

export type LockboxContent =
  | { kind: 'creature'; creatureId: string }
  | { kind: 'move'; moveId: string }
  | { kind: 'fp'; amount: number };

export interface PendingReward {
  gymLevel: number;
  boxes: LockboxContent[];
  chosenIndex: number | null;
  applied: boolean;
}

export interface OwnedCreature {
  uid: string;
  defId: string;
  moveIds: string[];
  obtainedAt: number;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface FocusSession {
  id: string;
  startedAt: number;
  endsAt: number;
  durationMin: number;
  siteIds: string[];
  customDomains: string[];
  tierName: string;
  rate: number;
  baseFp: number;
  activatedCategoryIds: string[];
  multiplier: number;
  projectedFp: number;
  status: SessionStatus;
  awardedFp: number;
  endedAt: number | null;
  abandonReason?: 'gave_up' | 'visited_blocked';
  abandonedSiteId?: string;
  isDemo: boolean;
}

export type SessionHistoryEntry = FocusSession;

export interface GameState {
  version: 1;
  trainerName: string;
  onboarded: boolean;
  starterId: string | null;
  fp: number;
  lifetimeFp: number;
  creatures: OwnedCreature[];
  squad: string[];
  moveScrolls: string[];
  currentGymLevel: number;
  pendingReward: PendingReward | null;
  activeSession: FocusSession | null;
  sessionHistory: SessionHistoryEntry[];
  lastSeenSessionId: string | null;
  lastAdventureSetup: {
    durationMin: number;
    siteIds: string[];
    customDomains: string[];
  } | null;
  settings: {
    demoMode: boolean;
    sound: boolean;
  };
  stats: {
    totalFocusMin: number;
    adventuresCompleted: number;
    adventuresAbandoned: number;
    battlesWon: number;
    battlesLost: number;
  };
}

export interface BattleCreature {
  uid: string;
  defId: string;
  name: string;
  element: ElementType;
  hp: number;
  moveIds: string[];
  healUsesLeft: Record<string, number>;
  isZonedOut: boolean;
}

export interface BattleTeam {
  team: BattleCreature[];
  activeIndex: number;
}

export type BattlePhase = 'intro' | 'player_turn' | 'animating' | 'enemy_turn'
  | 'player_forced_switch' | 'victory' | 'defeat' | 'end';

export interface BattleState {
  phase: BattlePhase;
  player: BattleTeam;
  enemy: BattleTeam;
  round: number;
  winner: 'player' | 'enemy' | null;
  isPractice: boolean;
  gymLevel: number;
}

export type PlayerAction =
  | { type: 'move'; moveId: string; targetIndex?: number }
  | { type: 'switch'; toIndex: number }
  | { type: 'forfeit' };

export type EnemyAction =
  | { kind: 'move'; moveId: string; targetIndex: number }
  | { kind: 'switch'; toIndex: number };

export type BattleEventType =
  | 'MOVE_USED'
  | 'MISSED'
  | 'DAMAGE'
  | 'EFFECTIVE'
  | 'HEALED'
  | 'ZONED_OUT'
  | 'SWITCHED'
  | 'SENT_OUT'
  | 'VICTORY'
  | 'DEFEAT';

export interface BattleEvent {
  type: BattleEventType;
  message: string;
}

export type Rng = () => number;
