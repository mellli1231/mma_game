import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { GYMS } from '../src/data/gyms';
import { MOVES } from '../src/data/moves';
import {
  applyEnemyTurn,
  applyForcedSwitch,
  applyPlayerAction,
  calcDamage,
  calcHeal,
  createBattle,
  rollHit,
} from '../src/engine/battle';
import { completeOnboarding } from '../src/engine/onboarding';
import type { BattleState, GameState } from '../src/types';

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

function battleState(starterId: 'embrit' | 'puddlo' | 'sproutle' = 'embrit'): GameState {
  return completeOnboarding(freshState(), 'Tester', starterId);
}

function putPlayerTurn(battle: BattleState): BattleState {
  return { ...battle, phase: 'player_turn' };
}

describe('battle math and setup', () => {
  it.each([
    ['embrit', 'cindercub', 'fire_spark'],
    ['puddlo', 'tidepup', 'water_drip'],
    ['sproutle', 'mossling', 'grass_seed_toss'],
  ] as const)(
    'creates the Gym 1 mirror for starter %s',
    (starterId, enemyDefId, enemyMoveId) => {
      const battle = createBattle(battleState(starterId), 1, false);
      expect(battle.phase).toBe('intro');
      expect(battle.player.team).toHaveLength(1);
      expect(battle.player.team[0]).toMatchObject({
        defId: starterId,
        hp: 100,
        moveIds: CREATURES[starterId].defaultMoveIds,
      });
      expect(battle.enemy.team[0]).toMatchObject({
        defId: enemyDefId,
        moveIds: [enemyMoveId],
      });
    },
  );

  it('sets heal uses for each heal move and validates battle setup', () => {
    const state = battleState('embrit');
    const owned = state.creatures[0];
    expect(owned).toBeDefined();
    const withHeal: GameState = {
      ...state,
      creatures: [{
        ...owned!,
        moveIds: [...owned!.moveIds, 'fire_kindle'],
      }],
    };
    expect(createBattle(withHeal, 1, true).player.team[0]?.healUsesLeft)
      .toEqual({ fire_kindle: 2 });
    expect(() => createBattle({ ...state, squad: [] }, 1, false)).toThrow('empty Squad');
    expect(() => createBattle(state, 99, false)).toThrow('Unknown gym level');
  });

  it('calculates damage, capped healing, and the exact hit threshold', () => {
    expect(calcDamage(MOVES.fire_flame_lash!, 'grass')).toBe(50);
    expect(calcDamage(MOVES.fire_flame_lash!, 'water')).toBe(13);
    expect(calcDamage(MOVES.fire_spark!, 'water')).toBe(5);
    expect(calcHeal(MOVES.fire_kindle!, {
      uid: 'target',
      defId: 'cindercub',
      name: 'Cindercub',
      element: 'fire',
      hp: 90,
      moveIds: ['fire_kindle'],
      healUsesLeft: { fire_kindle: 2 },
      isZonedOut: false,
    })).toBe(10);
    expect(rollHit(() => 0.29)).toBe(false);
    expect(rollHit(() => 0.3)).toBe(true);
  });
});

describe('player battle actions', () => {
  it('resolves attacks, misses, and type-effectiveness events', () => {
    const battle = putPlayerTurn(createBattle(battleState(), 1, false));
    const hit = applyPlayerAction(battle, { type: 'move', moveId: 'fire_ember_flick' }, () => 0.3);
    expect(hit.battle.enemy.team[0]?.hp).toBe(80);
    expect(hit.battle.phase).toBe('enemy_turn');
    expect(hit.events.map(({ type }) => type)).toEqual(['MOVE_USED', 'DAMAGE']);

    const miss = applyPlayerAction(battle, { type: 'move', moveId: 'fire_ember_flick' }, () => 0.29);
    expect(miss.battle.enemy.team[0]?.hp).toBe(100);
    expect(miss.events.map(({ type }) => type)).toEqual(['MOVE_USED', 'MISSED']);
  });

  it('immediately sends out the next enemy or ends in victory', () => {
    const battle = putPlayerTurn(createBattle(battleState(), 2, false));
    const lowHpBattle: BattleState = {
      ...battle,
      enemy: {
        ...battle.enemy,
        team: battle.enemy.team.map((creature, index) =>
          index === 0 ? { ...creature, hp: 10 } : creature),
      },
    };
    const result = applyPlayerAction(lowHpBattle, { type: 'move', moveId: 'fire_flame_lash' }, () => 0.3);
    expect(result.battle.enemy.activeIndex).toBe(1);
    expect(result.battle.phase).toBe('enemy_turn');
    expect(result.events.some(({ type }) => type === 'SENT_OUT')).toBe(true);

    const oneEnemy = putPlayerTurn(createBattle(battleState(), 1, false));
    const almostWon = {
      ...oneEnemy,
      enemy: {
        ...oneEnemy.enemy,
        team: [{ ...oneEnemy.enemy.team[0]!, hp: 10 }],
      },
    };
    const victory = applyPlayerAction(almostWon, { type: 'move', moveId: 'fire_flame_lash' }, () => 0.3);
    expect(victory.battle).toMatchObject({ phase: 'victory', winner: 'player' });
    expect(victory.battle.enemy.team[0]?.hp).toBe(0);
  });

  it('uses heal uses even when the heal misses and supports voluntary switching', () => {
    const state = battleState();
    const owned = state.creatures[0]!;
    const withHeal: GameState = {
      ...state,
      creatures: [{ ...owned, moveIds: [...owned.moveIds, 'fire_kindle'] }],
    };
    const battle = putPlayerTurn(createBattle(withHeal, 1, false));
    const damaged = {
      ...battle,
      player: {
        ...battle.player,
        team: [{ ...battle.player.team[0]!, hp: 70, healUsesLeft: { fire_kindle: 2 } }],
      },
    };
    const missedHeal = applyPlayerAction(
      damaged,
      { type: 'move', moveId: 'fire_kindle' },
      () => 0.29,
    );
    expect(missedHeal.battle.player.team[0]?.hp).toBe(70);
    expect(missedHeal.battle.player.team[0]?.healUsesLeft.fire_kindle).toBe(1);
    expect(missedHeal.events.some(({ type }) => type === 'MISSED')).toBe(true);

    const successfulHeal = applyPlayerAction(
      {
        ...damaged,
        player: {
          ...damaged.player,
          team: [{ ...damaged.player.team[0]!, hp: 90, healUsesLeft: { fire_kindle: 2 } }],
        },
      },
      { type: 'move', moveId: 'fire_kindle' },
      () => 0.3,
    );
    expect(successfulHeal.battle.player.team[0]?.hp).toBe(100);
    expect(successfulHeal.battle.player.team[0]?.healUsesLeft.fire_kindle).toBe(1);
    expect(successfulHeal.events.some(({ type }) => type === 'HEALED')).toBe(true);

    const twoMemberState: GameState = {
      ...state,
      creatures: [
        ...state.creatures,
        {
          uid: 'u_tidepup',
          defId: 'tidepup',
          moveIds: [...CREATURES.tidepup.defaultMoveIds],
          obtainedAt: 0,
        },
      ],
      squad: ['u_embrit', 'u_tidepup'],
    };
    const switched = applyPlayerAction(
      putPlayerTurn(createBattle(twoMemberState, 1, false)),
      { type: 'switch', toIndex: 1 },
      () => 0.3,
    );
    expect(switched.battle.player.activeIndex).toBe(1);
    expect(switched.battle.phase).toBe('enemy_turn');
  });

  it('does not allow a third healing move after the two per-battle uses are spent', () => {
    const state = battleState();
    const owned = state.creatures[0]!;
    const withHeal: GameState = {
      ...state,
      creatures: [{ ...owned, moveIds: [...owned.moveIds, 'fire_kindle'] }],
    };
    const created = createBattle(withHeal, 1, false);
    const battle = putPlayerTurn({
      ...created,
      player: {
        ...created.player,
        team: [{
          ...created.player.team[0]!,
          hp: 50,
          healUsesLeft: { fire_kindle: 2 },
        }],
      },
    });

    const firstUse = applyPlayerAction(battle, { type: 'move', moveId: 'fire_kindle' }, () => 0.29);
    expect(firstUse.battle.player.team[0]?.healUsesLeft.fire_kindle).toBe(1);
    const secondUse = applyPlayerAction(
      putPlayerTurn(firstUse.battle),
      { type: 'move', moveId: 'fire_kindle' },
      () => 0.29,
    );
    expect(secondUse.battle.player.team[0]?.healUsesLeft.fire_kindle).toBe(0);
    expect(() => applyPlayerAction(
      putPlayerTurn(secondUse.battle),
      { type: 'move', moveId: 'fire_kindle' },
      () => 0.3,
    )).toThrow('no uses of Kindle left');
  });

  it('forfeits immediately and rejects actions in the wrong phase', () => {
    const battle = putPlayerTurn(createBattle(battleState(), 1, false));
    expect(applyPlayerAction(battle, { type: 'forfeit' }, () => 0.3).battle)
      .toMatchObject({ phase: 'defeat', winner: 'enemy' });
    expect(() => applyPlayerAction(
      { ...battle, phase: 'intro' },
      { type: 'forfeit' },
      () => 0.3,
    )).toThrow('not allowed during intro');
  });
});

describe('enemy battle turns', () => {
  it('runs enemy response and advances to the next player round', () => {
    const battle = {
      ...createBattle(battleState(), 1, false),
      phase: 'enemy_turn' as const,
    };
    const response = applyEnemyTurn(battle, GYMS[1]!, () => 0.3);
    expect(response.battle.round).toBe(2);
    expect(response.battle.phase).toBe('player_turn');
    expect(response.battle.player.team[0]?.hp).toBeLessThan(100);
  });

  it('applies an enemy heal to the selected injured teammate', () => {
    const created = createBattle(battleState(), 5, false);
    const enemy = created.enemy.team[0]!;
    const battle: BattleState = {
      ...created,
      phase: 'enemy_turn',
      enemy: {
        ...created.enemy,
        team: [
          {
            ...enemy,
            moveIds: ['fire_blaze_burst', 'fire_phoenix_rest'],
            healUsesLeft: { fire_phoenix_rest: 2 },
          },
          { ...created.enemy.team[1]!, hp: 20 },
          created.enemy.team[2]!,
        ],
      },
    };
    const response = applyEnemyTurn(battle, GYMS[5]!, () => 0.3);
    expect(response.battle.enemy.team[1]?.hp).toBe(55);
    expect(response.battle.enemy.team[0]?.healUsesLeft.fire_phoenix_rest).toBe(1);
    expect(response.events.some(({ type }) => type === 'HEALED')).toBe(true);
  });

  it('requires a forced switch after the active player creature zones out', () => {
    const state: GameState = {
      ...battleState(),
      creatures: [
        ...battleState().creatures,
        {
          uid: 'u_puddlo',
          defId: 'puddlo',
          moveIds: [...CREATURES.puddlo.defaultMoveIds],
          obtainedAt: 0,
        },
      ],
      squad: ['u_embrit', 'u_puddlo'],
    };
    const created = createBattle(state, 1, false);
    const battle = {
      ...created,
      phase: 'enemy_turn' as const,
      player: {
        ...created.player,
        team: [{ ...created.player.team[0]!, hp: 1 }, created.player.team[1]!],
      },
    };
    const result = applyEnemyTurn(battle, GYMS[1]!, () => 0.3);
    expect(result.battle.phase).toBe('player_forced_switch');
    expect(result.battle.round).toBe(1);
    const switched = applyForcedSwitch(result.battle, 1);
    expect(switched.battle).toMatchObject({
      phase: 'player_turn',
      round: 1,
      player: { activeIndex: 1 },
    });
  });

  it('ends in defeat when all player creatures zone out and enforces the round cap', () => {
    const created = createBattle(battleState(), 1, false);
    const lastHp = {
      ...created,
      phase: 'enemy_turn' as const,
      player: {
        ...created.player,
        team: [{ ...created.player.team[0]!, hp: 1 }],
      },
    };
    expect(applyEnemyTurn(lastHp, GYMS[1]!, () => 0.3).battle)
      .toMatchObject({ phase: 'defeat', winner: 'enemy' });

    const atLimit = {
      ...created,
      phase: 'enemy_turn' as const,
      round: 60,
    };
    expect(applyEnemyTurn(atLimit, GYMS[1]!, () => 0.3).battle)
      .toMatchObject({ phase: 'defeat', round: 61, winner: 'enemy' });
  });
});
