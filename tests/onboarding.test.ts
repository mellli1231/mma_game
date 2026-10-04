import { describe, expect, it } from 'vitest';

import { WELCOME_FP } from '../src/data/config';
import { CREATURES } from '../src/data/creatures';
import { DEFAULT_STATE } from '../src/dev/stubTypes';
import { completeOnboarding } from '../src/engine/onboarding';
import type { GameState } from '../src/types';

const freshState: GameState = {
  version: 1,
  trainerName: '',
  onboarded: false,
  starterId: null,
  fp: 0,
  lifetimeFp: 0,
  creatures: [],
  squad: [],
  moveScrolls: [],
  currentGymLevel: 1,
  pendingReward: null,
  activeSession: null,
  sessionHistory: [],
  lastSeenSessionId: null,
  lastAdventureSetup: null,
  settings: { demoMode: false, sound: true },
  stats: {
    totalFocusMin: 0,
    adventuresCompleted: 0,
    adventuresAbandoned: 0,
    battlesWon: 0,
    battlesLost: 0,
  },
};

describe('onboarding engine', () => {
  it.each(['embrit', 'puddlo', 'sproutle'] as const)('creates the %s companion', (starterId) => {
    const result = completeOnboarding(freshState, '  Trainer Name  ', starterId);
    const owned = result.creatures[0];
    expect(result).toMatchObject({
      trainerName: 'Trainer Name',
      onboarded: true,
      starterId,
      fp: WELCOME_FP,
      lifetimeFp: WELCOME_FP,
      squad: [`u_${starterId}`],
      currentGymLevel: 1,
    });
    expect(owned).toMatchObject({
      uid: `u_${starterId}`,
      defId: starterId,
      moveIds: CREATURES[starterId].defaultMoveIds,
    });
  });

  it('uses the default name for blank input and limits names to 16 characters', () => {
    expect(completeOnboarding(freshState, '   ', 'embrit').trainerName).toBe('Trainer');
    expect(completeOnboarding(freshState, '0123456789abcdefghi', 'embrit').trainerName)
      .toBe('0123456789abcdef');
  });

  it('rejects a non-starter creature ID', () => {
    expect(() => completeOnboarding(freshState, 'Trainer', 'cindercub' as 'embrit'))
      .toThrow('Unknown starter');
  });

  it('starts with the actual current game-state defaults', () => {
    expect(DEFAULT_STATE.moveScrolls).toEqual([]);
  });
});
