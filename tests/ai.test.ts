import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { GYMS } from '../src/data/gyms';
import { chooseEnemyAction } from '../src/engine/ai';
import { createBattle } from '../src/engine/battle';
import { completeOnboarding } from '../src/engine/onboarding';
import type { BattleState, GameState } from '../src/types';

function stateFor(starterId: 'embrit' | 'puddlo' | 'sproutle' = 'embrit'): GameState {
  const fresh: GameState = {
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
  return completeOnboarding(fresh, 'Tester', starterId);
}

function configureEnemy(battle: BattleState, moveIds: string[]): BattleState {
  const enemy = battle.enemy.team[0]!;
  const healUsesLeft = Object.fromEntries(
    moveIds
      .filter((moveId) => moveId.includes('kindle') || moveId.includes('mist') || moveId.includes('rest') || moveId.includes('mend') || moveId.includes('renewal'))
      .map((moveId) => [moveId, 2]),
  );
  return {
    ...battle,
    enemy: {
      ...battle.enemy,
      team: [{ ...enemy, moveIds, healUsesLeft }],
    },
  };
}

describe('enemy AI', () => {
  it('chooses the highest-powered type-effective move on the best-move path', () => {
    const battle = createBattle(stateFor('sproutle'), 5, false);
    const configured = configureEnemy(battle, [
      'fire_blaze_burst',
      'fire_inferno',
      'fire_phoenix_rest',
    ]);
    const action = chooseEnemyAction(configured, GYMS[5]!, () => 0.1);
    expect(action).toEqual({
      kind: 'move',
      moveId: 'fire_inferno',
      targetIndex: 0,
    });
  });

  it('chooses a random available attack when the best-move chance fails', () => {
    const battle = configureEnemy(
      createBattle(stateFor('embrit'), 2, false),
      ['water_splash_jab', 'water_tide_whip'],
    );
    const values = [0.99, 0.75];
    const action = chooseEnemyAction(battle, GYMS[2]!, () => values.shift() ?? 0);
    expect(action).toEqual({
      kind: 'move',
      moveId: 'water_tide_whip',
      targetIndex: 0,
    });
  });

  it('heals the most injured living teammate at the threshold when possible', () => {
    const battle = createBattle(stateFor('embrit'), 5, false);
    const enemy = battle.enemy.team[0]!;
    const ally = {
      ...battle.enemy.team[1]!,
      hp: 35,
    };
    const configured: BattleState = {
      ...battle,
      enemy: {
        ...battle.enemy,
        team: [
          { ...enemy, moveIds: ['fire_blaze_burst', 'fire_phoenix_rest'], healUsesLeft: { fire_phoenix_rest: 2 } },
          ally,
          { ...battle.enemy.team[2]!, hp: 10 },
        ],
      },
    };
    expect(chooseEnemyAction(configured, GYMS[5]!, () => 0.99)).toEqual({
      kind: 'move',
      moveId: 'fire_phoenix_rest',
      targetIndex: 2,
    });
  });

  it.each([
    { hp: 35, expectedMoveId: 'fire_phoenix_rest', expectedTargetIndex: 1 },
    { hp: 36, expectedMoveId: 'fire_blaze_burst', expectedTargetIndex: 0 },
  ])('uses the healing threshold at $hp HP when a heal use remains', ({
    hp,
    expectedMoveId,
    expectedTargetIndex,
  }) => {
    const battle = createBattle(stateFor('embrit'), 5, false);
    const enemy = battle.enemy.team[0]!;
    const configured: BattleState = {
      ...battle,
      enemy: {
        ...battle.enemy,
        team: [
          {
            ...enemy,
            moveIds: ['fire_blaze_burst', 'fire_phoenix_rest'],
            healUsesLeft: { fire_phoenix_rest: 2 },
          },
          { ...battle.enemy.team[1]!, hp },
          battle.enemy.team[2]!,
        ],
      },
    };

    expect(chooseEnemyAction(configured, GYMS[5]!, () => 0.99)).toEqual({
      kind: 'move',
      moveId: expectedMoveId,
      targetIndex: expectedTargetIndex,
    });
  });

  it('does not heal above the threshold or when the heal has no uses left', () => {
    const battle = createBattle(stateFor('embrit'), 5, false);
    const enemy = battle.enemy.team[0]!;
    const hurt = { ...battle.enemy.team[1]!, hp: 36 };
    const noHeal: BattleState = {
      ...battle,
      enemy: {
        ...battle.enemy,
        team: [{
          ...enemy,
          moveIds: ['fire_blaze_burst', 'fire_phoenix_rest'],
          healUsesLeft: { fire_phoenix_rest: 0 },
        }, hurt, battle.enemy.team[2]!],
      },
    };
    expect(chooseEnemyAction(noHeal, GYMS[5]!, () => 0.1).kind).toBe('move');
    expect(chooseEnemyAction(noHeal, GYMS[5]!, () => 0.1)).toMatchObject({
      moveId: 'fire_blaze_burst',
      targetIndex: 0,
    });
  });

});
