import { STARTER_IDS, WELCOME_FP } from '../data/config';
import { CREATURES } from '../data/creatures';
import type { GameState } from '../types';

export function completeOnboarding(
  state: GameState,
  trainerName: string,
  starterId: 'embrit' | 'puddlo' | 'sproutle',
): GameState {
  if (!STARTER_IDS.includes(starterId)) {
    throw new Error(`Unknown starter Lockling: ${starterId}`);
  }

  const starter = CREATURES[starterId];
  if (!starter || !starter.isStarter) {
    throw new Error(`Creature ${starterId} is not a valid starter.`);
  }

  const uid = `u_${starter.id}`;
  return {
    ...state,
    trainerName: trainerName.trim().slice(0, 16) || 'Trainer',
    onboarded: true,
    starterId,
    fp: WELCOME_FP,
    lifetimeFp: WELCOME_FP,
    creatures: [
      ...state.creatures.filter((creature) => creature.uid !== uid),
      {
        uid,
        defId: starter.id,
        moveIds: [...starter.defaultMoveIds],
        obtainedAt: 0,
      },
    ],
    squad: [uid],
    currentGymLevel: 1,
    moveScrolls: [...state.moveScrolls],
    pendingReward: null,
  };
}
