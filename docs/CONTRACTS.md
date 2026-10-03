# CONTRACTS.md: frozen interfaces (change only via the contract-change procedure in TEAM.md)

Types come from src/types.ts (SPEC Section 9.7). The additions below MUST be added to types.ts
by Person B in task card B1.

## Extra types (B adds to types.ts)
```ts
export interface FpBreakdown {
  tierName: string; rate: number; baseFp: number;
  activated: string[]; rawMultiplier: number; multiplier: number;
  capped: boolean; projectedFp: number;
}
export interface LearnableMove { move: MoveDef; price: number; free: boolean; affordable: boolean; }
export type SpriteState = 'idle' | 'hop' | 'sentOut' | 'attack' | 'hit' | 'miss'
  | 'heal' | 'zonedOut' | 'celebrate' | 'selected' | 'sleepy';
export type FixtureId = 'fresh' | 'mid' | 'rich' | 'battleReady' | 'pendingReward'
  | 'activeSession' | 'activeSessionAlmostDone' | 'demoSave';
```

## Routes (HashRouter). Owner of each page file in parentheses
```
#/onboarding        Onboarding (A)       forced when !onboarded
#/                  Home (A)
#/adventure/setup   AdventureSetup (A)
#/adventure         AdventureActive (A)  forced while activeSession
#/adventure/result  AdventureResult (A)
#/gyms              GymMap (B)
#/battle/:level     Battle (B)           ?practice=1 for practice
#/lockbox           Lockbox (B)          forced from battle routes while pendingReward
#/defeat            Defeat (B)
#/dojo              Dojo (C)             #/dojo/:uid for detail
#/lockdex           Lockdex (C)
#/settings          Settings (A)
#/dev               Dev (A)              fixture loader and dev panel
#/gallery           Gallery (C)          renders every component in every state
blocked.html        Trail Closed (A)     separate entry page
```
Route guards (RUN-06, ONB-01, locked-during-Adventure) live in routes.tsx. Only A edits them.

## Platform interface (A implements, everyone consumes via `import { platform } from '@/platform/platform'`)
```ts
export interface Platform {
  isExtension: boolean;
  loadState(): Promise<GameState>;
  updateState(mutator: (s: GameState) => GameState): Promise<GameState>;
  subscribe(cb: (s: GameState) => void): () => void;
  startSession(input: { durationMin: number; siteIds: string[]; customDomains: string[] }): Promise<{ ok: true; session: FocusSession } | { ok: false; error: string }>;
  checkSession(): Promise<FocusSession | null>;
  abandonSession(reason: 'gave_up' | 'visited_blocked', siteId?: string): Promise<void>;
}
```
React access: `useGameState()` hook from src/app/store.ts returns the current GameState (A owns).
Pages call `platform.updateState(s => engineFn(s, ...))`. No other write path exists.

## Message protocol (SPEC 9.10): SESSION_START, SESSION_CHECK, SESSION_ABANDON, SESSION_GET. Unchanged.

## Engine API (B implements; signatures are frozen)
```ts
// src/engine/points.ts
getTier(durationMin: number): { name: string; rate: number }
calculateFp(durationMin: number, siteIds: string[]): FpBreakdown

// src/engine/typeChart.ts
typeModifier(atk: ElementType, def: ElementType): 0.5 | 1 | 2

// src/engine/battle.ts
createBattle(state: GameState, gymLevel: number, isPractice: boolean): BattleState
applyPlayerAction(b: BattleState, action: PlayerAction, rng: Rng): { battle: BattleState; events: BattleEvent[] }
applyEnemyTurn(b: BattleState, gym: GymDef, rng: Rng): { battle: BattleState; events: BattleEvent[] }
applyForcedSwitch(b: BattleState, toIndex: number): { battle: BattleState; events: BattleEvent[] }

// src/engine/ai.ts
chooseEnemyAction(b: BattleState, gym: GymDef, rng: Rng): EnemyAction

// src/engine/rewards.ts
rollLockboxes(s: GameState, rng: Rng): LockboxContent[]
clearGym(s: GameState, gymLevel: number, rng: Rng): GameState     // first clear: sets pendingReward, increments currentGymLevel, stats.battlesWon++
recordBattleLoss(s: GameState): GameState                          // stats.battlesLost++
chooseLockbox(s: GameState, index: number): GameState              // applies content once, sets chosenIndex and applied=true
dismissReward(s: GameState): GameState                             // clears pendingReward

// src/engine/training.ts
learnableMoves(s: GameState, uid: string): LearnableMove[]
learnMove(s: GameState, uid: string, moveId: string, opts: { forgetMoveId?: string; source: 'fp' | 'scroll' }): GameState
teachFromScroll is learnMove with source 'scroll'

// src/engine/squad.ts
toggleSquadMember(s: GameState, uid: string): GameState           // throws if result would be empty or exceed 3
moveSquadMember(s: GameState, uid: string, dir: -1 | 1): GameState

// src/engine/onboarding.ts
completeOnboarding(s: GameState, trainerName: string, starterId: 'embrit' | 'puddlo' | 'sproutle'): GameState

// src/engine/rng.ts
type Rng = () => number;   mulberry32(seed: number): Rng;   const defaultRng: Rng = Math.random
```

## Component props (C implements stubs by hour 1.5, then real versions; props never change)
All components live in src/app/components/ and are exported from src/app/components/index.ts.
```ts
CreatureSprite   { defId: string; uid?: string; size?: number; state?: SpriteState; facing?: 'left' | 'right'; showShadow?: boolean; showParticles?: boolean; onAnimationEnd?: () => void }
CreatureCard     { defId: string; moveCount?: number; selected?: boolean; dimmed?: boolean; badge?: string; onClick?: () => void }
ElementBadge     { element: ElementType; size?: 'sm' | 'md' }
HpBar            { hp: number; maxHp?: number; showNumber?: boolean }          // ghost bar built in
FpBadge          { amount: number; animate?: boolean }
TimerRing        { startedAt: number; endsAt: number; size?: number; children?: React.ReactNode }
MoveButton       { move: MoveDef; usesLeft?: number; effectiveness?: 'super' | 'weak' | null; disabled?: boolean; disabledReason?: string; onClick: () => void }
PointsPreview    { breakdown: FpBreakdown; nudges?: string[] }
FloatingNumber   { value: string; kind: 'damage' | 'heal' | 'miss'; onDone?: () => void }
Modal            { open: boolean; title: string; onClose: () => void; children: React.ReactNode; actions?: React.ReactNode }
LockOverlay      { locked: boolean; reason?: string; children: React.ReactNode }
LockboxChest     { state: 'closed' | 'shaking' | 'open'; dimmed?: boolean; onClick?: () => void }
RevealCard       { content: LockboxContent; onContinue?: () => void }           // creature, move or fp
VictoryStamp     { text?: string; onDone?: () => void }                          // default "LOCKED IN!"
Confetti         { fire: boolean; colors?: string[] }
useToast()       returns { toast(message: string): void }                        // ToastHost mounted once by A in App.tsx
```
Motion tokens are exported from src/app/motion.ts (SPEC 10.8.2): `ease`, `spring`, `dur`, `stagger`.
Copy strings come from src/data/copy.ts (B creates it from SPEC 10.5; everyone reads, only B edits).

## Fixtures (see docs/FIXTURES.md): `FIXTURES[id]()` from src/dev/fixtures.ts (A owns).
