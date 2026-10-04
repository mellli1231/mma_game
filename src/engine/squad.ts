import { MAX_SQUAD_SIZE } from '../data/config';
import type { GameState } from '../types';

export function toggleSquadMember(state: GameState, uid: string): GameState {
  if (!state.creatures.some((creature) => creature.uid === uid)) {
    throw new Error(`Cannot add unknown creature ${uid} to the Squad.`);
  }

  const currentIndex = state.squad.indexOf(uid);
  if (currentIndex !== -1) {
    if (state.squad.length === 1) {
      throw new Error('The Squad must contain at least one Lockling.');
    }
    return {
      ...state,
      squad: state.squad.filter((memberUid) => memberUid !== uid),
    };
  }

  if (state.squad.length >= MAX_SQUAD_SIZE) {
    throw new Error(`The Squad cannot contain more than ${MAX_SQUAD_SIZE} Locklings.`);
  }

  return { ...state, squad: [...state.squad, uid] };
}

export function moveSquadMember(state: GameState, uid: string, dir: -1 | 1): GameState {
  const currentIndex = state.squad.indexOf(uid);
  if (currentIndex === -1) {
    throw new Error(`Cannot move ${uid}; it is not in the Squad.`);
  }

  const destination = currentIndex + dir;
  if (destination < 0 || destination >= state.squad.length) return state;

  const squad = [...state.squad];
  [squad[currentIndex], squad[destination]] = [squad[destination], squad[currentIndex]];
  return { ...state, squad };
}
