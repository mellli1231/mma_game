import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { SELLABLE_MOVES } from '../src/data/moves';
import { clearGym, chooseLockbox, dismissReward, recordBattleLoss, rollLockboxes } from '../src/engine/rewards';
import { completeOnboarding } from '../src/engine/onboarding';
import type { GameState } from '../src/types';

function freshState(): GameState {
  return {
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
}

const rngValues = (...values: number[]) => {
  let index = 0;
  return () => values[index++] ?? 0;
};

describe('Lockbox rolling', () => {
  it('offers three independent rewards without duplicate contents', () => {
    const state = completeOnboarding(freshState(), 'Trainer', 'embrit');
    const rewards = rollLockboxes(state, rngValues(
      0.1, 0.99, 0.1, 0.99, 0.1, 0.99,
    ));
    expect(rewards).toHaveLength(3);
    const identities = rewards.map((reward) =>
      reward.kind === 'creature' ? `creature:${reward.creatureId}`
        : reward.kind === 'move' ? `move:${reward.moveId}`
          : 'fp');
    expect(new Set(identities).size).toBe(3);
  });

  it('falls back to a Spark Pouch when the requested pool is empty', () => {
    const state = completeOnboarding(freshState(), 'Trainer', 'embrit');
    const fullyOwned: GameState = {
      ...state,
      creatures: Object.values(CREATURES).map((creature) => ({
        uid: `u_${creature.id}`,
        defId: creature.id,
        moveIds: [...creature.defaultMoveIds],
        obtainedAt: 0,
      })),
      moveScrolls: SELLABLE_MOVES.map(({ id }) => id),
    };
    expect(rollLockboxes(fullyOwned, rngValues(0, 0, 0, 0, 0, 0)))
      .toEqual([{ kind: 'fp', amount: 250 }, { kind: 'fp', amount: 250 }, { kind: 'fp', amount: 250 }]);
  });

  it('rejects random values outside the required [0, 1) range', () => {
    expect(() => rollLockboxes(freshState(), () => 1)).toThrow('RNG must return');
  });
});

describe('gym clear and reward application', () => {
  it('clears the current gym once and stores three boxes before advancing', () => {
    const state = completeOnboarding(freshState(), 'Trainer', 'embrit');
    const result = clearGym(state, 1, rngValues(0, 0, 0, 0, 0, 0));
    expect(result.currentGymLevel).toBe(2);
    expect(result.pendingReward).toMatchObject({
      gymLevel: 1,
      chosenIndex: null,
      applied: false,
    });
    expect(result.pendingReward?.boxes).toHaveLength(3);
    expect(result.stats.battlesWon).toBe(1);
    expect(clearGym(result, 1, () => { throw new Error('must not reroll'); })).toBe(result);
    expect(clearGym(state, 2, () => { throw new Error('wrong gym must not roll'); })).toBe(state);
  });

  it('applies a creature once and adds it to the squad when there is room', () => {
    const base = completeOnboarding(freshState(), 'Trainer', 'embrit');
    const state: GameState = {
      ...base,
      pendingReward: {
        gymLevel: 1,
        boxes: [
          { kind: 'creature', creatureId: 'cindercub' },
          { kind: 'move', moveId: 'fire_blaze_burst' },
          { kind: 'fp', amount: 250 },
        ],
        chosenIndex: null,
        applied: false,
      },
    };
    const result = chooseLockbox(state, 0);
    expect(result.creatures).toHaveLength(2);
    expect(result.creatures[1]).toMatchObject({
      uid: 'u_cindercub',
      defId: 'cindercub',
      moveIds: CREATURES.cindercub.defaultMoveIds,
    });
    expect(result.squad).toEqual(['u_embrit', 'u_cindercub']);
    expect(result.pendingReward).toMatchObject({ chosenIndex: 0, applied: true });
    expect(chooseLockbox(result, 1)).toBe(result);
  });

  it('does not auto-add a creature when the squad is full', () => {
    const base = completeOnboarding(freshState(), 'Trainer', 'embrit');
    const otherCreatures = ['puddlo', 'sproutle'].map((defId) => ({
      uid: `u_${defId}`,
      defId,
      moveIds: [...CREATURES[defId]!.defaultMoveIds],
      obtainedAt: 0,
    }));
    const state: GameState = {
      ...base,
      creatures: [...base.creatures, ...otherCreatures],
      squad: ['u_embrit', 'u_puddlo', 'u_sproutle'],
      pendingReward: {
        gymLevel: 1,
        boxes: [{ kind: 'creature', creatureId: 'cindercub' }],
        chosenIndex: null,
        applied: false,
      },
    };
    expect(chooseLockbox(state, 0).squad).toEqual(state.squad);
  });

  it('adds FP to balance and lifetime total for a Spark Pouch exactly once', () => {
    const state: GameState = {
      ...completeOnboarding(freshState(), 'Trainer', 'embrit'),
      pendingReward: {
        gymLevel: 1,
        boxes: [{ kind: 'fp', amount: 250 }],
        chosenIndex: null,
        applied: false,
      },
    };
    const result = chooseLockbox(state, 0);
    expect(result).toMatchObject({ fp: 550, lifetimeFp: 550 });
    expect(chooseLockbox(result, 0)).toBe(result);
  });

  it('adds a Move Scroll to inventory and dismisses only after reveal', () => {
    const state: GameState = {
      ...completeOnboarding(freshState(), 'Trainer', 'embrit'),
      pendingReward: {
        gymLevel: 1,
        boxes: [{ kind: 'move', moveId: 'fire_blaze_burst' }],
        chosenIndex: null,
        applied: false,
      },
    };
    expect(() => dismissReward(state)).toThrow('reveal');
    const result = chooseLockbox(state, 0);
    expect(result.moveScrolls).toEqual(['fire_blaze_burst']);
    expect(dismissReward(result).pendingReward).toBeNull();
  });

  it('validates selection indexes and records losses immutably', () => {
    const state: GameState = {
      ...freshState(),
      pendingReward: {
        gymLevel: 1,
        boxes: [{ kind: 'fp', amount: 250 }],
        chosenIndex: null,
        applied: false,
      },
    };
    expect(() => chooseLockbox(state, -1)).toThrow('out of range');
    const lost = recordBattleLoss(state);
    expect(lost.stats.battlesLost).toBe(1);
    expect(state.stats.battlesLost).toBe(0);
  });
});
