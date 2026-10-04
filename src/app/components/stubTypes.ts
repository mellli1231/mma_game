export type ElementType = 'fire' | 'water' | 'grass'
export type SpriteState =
  | 'idle'
  | 'hop'
  | 'sentOut'
  | 'attack'
  | 'hit'
  | 'miss'
  | 'heal'
  | 'zonedOut'
  | 'celebrate'
  | 'selected'
  | 'sleepy'

export interface MoveDef {
  id: string
  name: string
  element: ElementType
  effect: 'attack' | 'heal'
  power: number
  usesPerBattle: number | null
  price: number | null
  rarity: 'common' | 'rare' | 'epic'
  description: string
}

export interface FpBreakdown {
  tierName: string
  rate: number
  baseFp: number
  activated: string[]
  rawMultiplier: number
  multiplier: number
  capped: boolean
  projectedFp: number
}

export type LockboxContent =
  | { kind: 'creature'; creatureId: string }
  | { kind: 'move'; moveId: string }
  | { kind: 'fp'; amount: number }
