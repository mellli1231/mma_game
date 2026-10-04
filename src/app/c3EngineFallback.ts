// Temporary UI adapter for the engine functions that B has not merged yet.
// Keep these signatures aligned with docs/CONTRACTS.md; replace the imports at
// the page boundary with src/engine/training and src/engine/squad after merge.
import type { LearnableMove } from '@/types'
import { MOVES, SELLABLE_MOVES } from '@/data/moves'
import { CREATURES } from '@/data/creatures'
import type { GameState } from '@/dev/stubTypes'

export function learnableMoves(state: GameState, uid: string): LearnableMove[] {
  const owned = state.creatures.find((creature) => creature.uid === uid)
  if (!owned) return []

  const creature = CREATURES[owned.defId]
  if (!creature) return []

  return SELLABLE_MOVES
    .filter((move) => move.element === creature.element && !owned.moveIds.includes(move.id))
    .map((move) => {
      const free = state.moveScrolls.includes(move.id)
      const price = move.price ?? 0
      return { move, price, free, affordable: free || state.fp >= price }
    })
    .sort((left, right) => left.price - right.price || left.move.name.localeCompare(right.move.name))
}

export function learnMove(
  state: GameState,
  uid: string,
  moveId: string,
  options: { forgetMoveId?: string; source: 'fp' | 'scroll' },
): GameState {
  const creatureIndex = state.creatures.findIndex((creature) => creature.uid === uid)
  if (creatureIndex < 0) throw new Error('Lockling not found.')

  const owned = state.creatures[creatureIndex]
  const creatureDef = CREATURES[owned.defId]
  const move = MOVES[moveId]
  if (!creatureDef || !move) throw new Error('Move or Lockling not found.')
  if (creatureDef.element !== move.element) throw new Error('That move belongs to a different element.')
  if (owned.moveIds.includes(moveId)) throw new Error('This Lockling already knows that move.')

  const scrollIndex = state.moveScrolls.indexOf(moveId)
  if (options.source === 'scroll' && scrollIndex < 0) throw new Error('That Move Scroll is not in your inventory.')
  if (options.source === 'fp' && (move.price == null || state.fp < move.price)) {
    throw new Error(`You need ${Math.max(0, (move.price ?? 0) - state.fp)} more FP.`)
  }

  let moveIds = [...owned.moveIds]
  if (moveIds.length >= 4) {
    const forgetIndex = options.forgetMoveId ? moveIds.indexOf(options.forgetMoveId) : -1
    if (forgetIndex < 0) throw new Error('Choose a move to forget first.')
    const forgotten = MOVES[moveIds[forgetIndex]]
    const remainingAttacks = moveIds.filter((id, index) => index !== forgetIndex)
      .filter((id) => MOVES[id]?.effect === 'attack').length
    if (forgotten?.effect === 'attack' && remainingAttacks === 0) {
      throw new Error('A Lockling must keep at least one attack move.')
    }
    moveIds.splice(forgetIndex, 1)
  }

  const creatures = state.creatures.map((item, index) => index === creatureIndex
    ? { ...item, moveIds: [...moveIds, moveId] }
    : item)
  return {
    ...state,
    fp: options.source === 'fp' ? state.fp - (move.price ?? 0) : state.fp,
    moveScrolls: options.source === 'scroll'
      ? state.moveScrolls.filter((_, index) => index !== scrollIndex)
      : state.moveScrolls,
    creatures,
  }
}

export function toggleSquadMember(state: GameState, uid: string): GameState {
  if (!state.creatures.some((creature) => creature.uid === uid)) throw new Error('Lockling not found.')
  const inSquad = state.squad.includes(uid)
  if (inSquad && state.squad.length <= 1) throw new Error('Your Squad must have at least one Lockling.')
  if (!inSquad && state.squad.length >= 3) throw new Error('Your Squad is full. Remove a Lockling first.')

  return {
    ...state,
    squad: inSquad ? state.squad.filter((member) => member !== uid) : [...state.squad, uid],
  }
}

export function moveSquadMember(state: GameState, uid: string, direction: -1 | 1): GameState {
  const index = state.squad.indexOf(uid)
  const destination = index + direction
  if (index < 0 || destination < 0 || destination >= state.squad.length) return state

  const squad = [...state.squad]
  ;[squad[index], squad[destination]] = [squad[destination], squad[index]]
  return { ...state, squad }
}
