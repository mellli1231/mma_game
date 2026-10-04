import { CREATURES } from '../data/creatures';
import { MOVES } from '../data/moves';
import type { GameState, LearnableMove } from '../types';

export function learnableMoves(state: GameState, uid: string): LearnableMove[] {
  const creature = state.creatures.find((owned) => owned.uid === uid);
  if (!creature) throw new Error(`Unknown owned creature: ${uid}`);

  const def = CREATURES[creature.defId];
  if (!def) throw new Error(`Unknown creature definition: ${creature.defId}`);

  return Object.values(MOVES)
    .filter((move): move is typeof move & { price: number } =>
      move.element === def.element
      && move.price !== null
      && !creature.moveIds.includes(move.id))
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    .map((move) => {
      const free = state.moveScrolls.includes(move.id);
      const price = move.price;
      return { move, price, free, affordable: free || state.fp >= price };
    });
}

export function learnMove(
  state: GameState,
  uid: string,
  moveId: string,
  opts: { forgetMoveId?: string; source: 'fp' | 'scroll' },
): GameState {
  const creatureIndex = state.creatures.findIndex((owned) => owned.uid === uid);
  if (creatureIndex === -1) throw new Error(`Unknown owned creature: ${uid}`);

  const creature = state.creatures[creatureIndex];
  const def = CREATURES[creature.defId];
  const move = MOVES[moveId];
  if (!def) throw new Error(`Unknown creature definition: ${creature.defId}`);
  if (!move || move.price === null) throw new Error(`Move ${moveId} cannot be taught.`);
  if (move.element !== def.element) {
    throw new Error(`${def.name} can only learn ${def.element} moves.`);
  }
  if (creature.moveIds.includes(moveId)) {
    throw new Error(`${def.name} already knows ${move.name}.`);
  }
  if (creature.moveIds.length > 4) {
    throw new Error(`${def.name} has an invalid move list with more than four moves.`);
  }

  if (opts.source === 'scroll' && !state.moveScrolls.includes(moveId)) {
    throw new Error(`No Move Scroll for ${move.name} is available.`);
  }
  if (opts.source === 'fp' && state.fp < move.price) {
    throw new Error(`Not enough FP to teach ${move.name}.`);
  }

  let moveIds = [...creature.moveIds];
  if (moveIds.length === 4) {
    const forgetIndex = opts.forgetMoveId ? moveIds.indexOf(opts.forgetMoveId) : -1;
    if (forgetIndex === -1) {
      throw new Error('Choose a move to forget before teaching a fifth move.');
    }
    const forgottenMove = MOVES[moveIds[forgetIndex]];
    if (!forgottenMove) throw new Error(`Unknown move in ${def.name}'s move list.`);
    const remainingAttackCount = moveIds.reduce((count, knownMoveId) => {
      return knownMoveId !== opts.forgetMoveId && MOVES[knownMoveId]?.effect === 'attack'
        ? count + 1
        : count;
    }, 0);
    if (forgottenMove.effect === 'attack' && remainingAttackCount === 0) {
      throw new Error(`${def.name} must keep at least one attack move.`);
    }
    moveIds.splice(forgetIndex, 1);
  } else if (opts.forgetMoveId) {
    throw new Error('A move can only be forgotten when the creature already knows four moves.');
  }

  moveIds.push(moveId);
  const creatures = [...state.creatures];
  creatures[creatureIndex] = { ...creature, moveIds };

  let moveScrolls = state.moveScrolls;
  if (opts.source === 'scroll') {
    const scrollIndex = moveScrolls.indexOf(moveId);
    moveScrolls = [...moveScrolls.slice(0, scrollIndex), ...moveScrolls.slice(scrollIndex + 1)];
  }

  return {
    ...state,
    fp: opts.source === 'fp' ? state.fp - move.price : state.fp,
    creatures,
    moveScrolls,
  };
}

export const teachFromScroll = (
  state: GameState,
  uid: string,
  moveId: string,
  opts: Omit<Parameters<typeof learnMove>[3], 'source'> = {},
): GameState => learnMove(state, uid, moveId, { ...opts, source: 'scroll' });
