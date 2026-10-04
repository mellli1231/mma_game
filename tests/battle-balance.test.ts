import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { GYMS } from '../src/data/gyms';
import { MOVES } from '../src/data/moves';
import { applyEnemyTurn, applyForcedSwitch, applyPlayerAction, calcDamage, createBattle } from '../src/engine/battle';
import { completeOnboarding } from '../src/engine/onboarding';
import type { BattleCreature, BattleState, ElementType, GameState } from '../src/types';

function emptyState(): GameState {
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
    settings: { demoMode: true, sound: true },
    stats: {
      totalFocusMin: 0,
      adventuresCompleted: 0,
      adventuresAbandoned: 0,
      battlesWon: 0,
      battlesLost: 0,
    },
  };
}

function fixture(defIds: string[]): GameState {
  const base = completeOnboarding(emptyState(), 'Tester', 'embrit');
  const creatures = defIds.map((defId) => ({
    uid: `u_${defId}`,
    defId,
    moveIds: [...CREATURES[defId]!.defaultMoveIds],
    obtainedAt: 0,
  }));
  return {
    ...base,
    creatures,
    squad: creatures.map(({ uid }) => uid),
  };
}

function seededRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x1_0000_0000;
  };
}

function bestAttack(creature: BattleCreature, defender: ElementType): { moveId: string; score: number } {
  return creature.moveIds
    .map((moveId) => ({ moveId, move: MOVES[moveId]! }))
    .filter(({ move }) => move.effect === 'attack')
    .map(({ moveId, move }) => ({ moveId, score: calcDamage(move, defender) }))
    .sort((a, b) => b.score - a.score)[0]!;
}

function choosePlayerAction(battle: BattleState) {
  const player = battle.player.team[battle.player.activeIndex]!;
  const enemy = battle.enemy.team[battle.enemy.activeIndex]!;
  const activeAttack = bestAttack(player, enemy.element);

  if (player.hp <= 50) {
    const heal = player.moveIds
      .map((moveId) => ({ moveId, move: MOVES[moveId]! }))
      .find(({ moveId, move }) => move.effect === 'heal' && (player.healUsesLeft[moveId] ?? 0) > 0);
    if (heal) return { type: 'move' as const, moveId: heal.moveId, targetIndex: battle.player.activeIndex };
  }

  const betterMatchup = battle.player.team
    .map((creature, index) => ({ creature, index }))
    .filter(({ creature, index }) => index !== battle.player.activeIndex && creature.hp > 0)
    .map(({ creature, index }) => ({ index, score: bestAttack(creature, enemy.element).score }))
    .sort((a, b) => b.score - a.score)[0];
  if (betterMatchup && betterMatchup.score > activeAttack.score * 1.5) {
    return { type: 'switch' as const, toIndex: betterMatchup.index };
  }

  return { type: 'move' as const, moveId: activeAttack.moveId };
}

function simulate(defIds: string[], gymLevel: number, seed: number): 'player' | 'enemy' {
  const rng = seededRng(seed);
  const gym = GYMS[gymLevel]!;
  let battle: BattleState = {
    ...createBattle(fixture(defIds), gymLevel, false),
    phase: 'player_turn',
  };

  for (let turn = 0; turn < 250; turn += 1) {
    if (battle.phase === 'player_turn') {
      const result = applyPlayerAction(battle, choosePlayerAction(battle), rng);
      battle = result.battle;
    } else if (battle.phase === 'player_forced_switch') {
      const enemy = battle.enemy.team[battle.enemy.activeIndex]!;
      const next = battle.player.team
        .map((creature, index) => ({ creature, index }))
        .filter(({ creature, index }) => index !== battle.player.activeIndex && creature.hp > 0)
        .sort((a, b) =>
          bestAttack(b.creature, enemy.element).score - bestAttack(a.creature, enemy.element).score,
        )[0];
      if (!next) return 'enemy';
      battle = applyForcedSwitch(battle, next.index).battle;
    } else if (battle.phase === 'enemy_turn') {
      battle = applyEnemyTurn(battle, gym, rng).battle;
    } else {
      return battle.winner ?? 'enemy';
    }

    if (battle.phase === 'victory' || battle.phase === 'defeat') return battle.winner ?? 'enemy';
  }

  return 'enemy';
}

function winRate(defIds: string[], gymLevel: number, trials = 30): number {
  let wins = 0;
  for (let seed = 1; seed <= trials; seed += 1) {
    if (simulate(defIds, gymLevel, seed) === 'player') wins += 1;
  }
  return wins / trials;
}

describe('gym balance playtest', () => {
  it('plays all gyms with battleReady and rich squads, plus single-starter endpoints', () => {
    const results: string[] = [];
    for (const [label, defIds] of [
      ['battleReady', ['embrit', 'tidepup', 'mossling']],
      ['rich', ['embrit', 'puddlo', 'sproutle']],
    ] as const) {
      for (let gymLevel = 1; gymLevel <= 5; gymLevel += 1) {
        results.push(`${label} Gym ${gymLevel}: ${Math.round(winRate([...defIds], gymLevel) * 100)}%`);
      }
    }

    const gymOneEarlyWinRate = winRate(['embrit'], 1);
    const gymFiveEarlyWinRate = winRate(['embrit'], 5);
    const gymFiveBattleReadyWinRate = winRate(['embrit', 'tidepup', 'mossling'], 5);
    const gymFiveRichWinRate = winRate(['embrit', 'puddlo', 'sproutle'], 5);
    console.info([
      ...results,
      `single Embrit Gym 1: ${Math.round(gymOneEarlyWinRate * 100)}%`,
      `single Embrit Gym 5: ${Math.round(gymFiveEarlyWinRate * 100)}%`,
    ].join('\n'));

    expect(gymOneEarlyWinRate).toBeGreaterThanOrEqual(0.9);
    expect(gymFiveEarlyWinRate).toBeLessThanOrEqual(0.1);
    expect(gymFiveBattleReadyWinRate).toBeLessThanOrEqual(0.2);
    expect(gymFiveRichWinRate).toBeLessThanOrEqual(0.6);
  });
});
