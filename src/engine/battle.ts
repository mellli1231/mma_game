import {
  BATTLE_ROUND_LIMIT,
  HEAL_USES_PER_BATTLE,
  MAX_HP,
  MISS_CHANCE,
  STARTER_IDS,
} from '../data/config';
import { CREATURES } from '../data/creatures';
import { GYMS } from '../data/gyms';
import { MOVES } from '../data/moves';
import { chooseEnemyAction } from './ai';
import { typeModifier } from './typeChart';
import type {
  BattleCreature,
  BattleEvent,
  BattleState,
  BattleTeam,
  ElementType,
  EnemyAction,
  GameState,
  GymDef,
  MoveDef,
  PlayerAction,
  Rng,
} from '../types';

const MIRROR_COMMON: Record<(typeof STARTER_IDS)[number], string> = {
  embrit: 'cindercub',
  puddlo: 'tidepup',
  sproutle: 'mossling',
};

export function rollHit(rng: Rng): boolean {
  return rng() >= MISS_CHANCE;
}

export function calcDamage(move: MoveDef, defender: ElementType): number {
  return Math.round(move.power * typeModifier(move.element, defender));
}

export function calcHeal(move: MoveDef, target: BattleCreature): number {
  return Math.min(move.power, MAX_HP - target.hp);
}

function createBattleCreature(
  uid: string,
  defId: string,
  moveIds: string[],
): BattleCreature {
  const def = CREATURES[defId];
  if (!def) throw new Error(`Unknown creature definition: ${defId}`);
  if (moveIds.length === 0 || moveIds.length > 4) {
    throw new Error(`${def.name} must have between one and four moves.`);
  }
  if (moveIds.some((moveId) => MOVES[moveId]?.element !== def.element)) {
    throw new Error(`${def.name} can only use ${def.element} moves.`);
  }
  if (!moveIds.some((moveId) => MOVES[moveId]?.effect === 'attack')) {
    throw new Error(`${def.name} must know at least one attack move.`);
  }

  const healUsesLeft = Object.fromEntries(
    moveIds
      .filter((moveId) => MOVES[moveId]?.effect === 'heal')
      .map((moveId) => [moveId, HEAL_USES_PER_BATTLE]),
  );
  return {
    uid,
    defId,
    name: def.name,
    element: def.element,
    hp: MAX_HP,
    moveIds: [...moveIds],
    healUsesLeft,
    isZonedOut: false,
  };
}

function active(team: BattleTeam): BattleCreature {
  const creature = team.team[team.activeIndex];
  if (!creature) throw new Error('Battle team has no active Lockling.');
  return creature;
}

function isAlive(creature: BattleCreature): boolean {
  return creature.hp > 0 && !creature.isZonedOut;
}

function firstAliveIndex(team: BattleTeam): number {
  return team.team.findIndex(isAlive);
}

function addEvent(events: BattleEvent[], type: BattleEvent['type'], message: string): void {
  events.push({ type, message });
}

function useMove(
  user: BattleCreature,
  targetTeam: BattleTeam,
  moveId: string,
  targetIndex: number | undefined,
  rng: Rng,
  events: BattleEvent[],
): BattleTeam {
  const move = MOVES[moveId];
  if (!move || !user.moveIds.includes(moveId)) {
    throw new Error(`${user.name} cannot use unknown or unlearned move ${moveId}.`);
  }

  if (move.effect === 'attack') {
    const target = active(targetTeam);
    if (!isAlive(target)) throw new Error('Cannot attack a zoned-out Lockling.');
    addEvent(events, 'MOVE_USED', `${user.name} used ${move.name}!`);
    if (!rollHit(rng)) {
      addEvent(events, 'MISSED', `${user.name} lost focus... it missed!`);
      return targetTeam;
    }

    const damage = calcDamage(move, target.element);
    const updatedTarget = {
      ...target,
      hp: Math.max(0, target.hp - damage),
      isZonedOut: target.hp - damage <= 0,
    };
    const updatedTeam = { ...targetTeam, team: [...targetTeam.team] };
    updatedTeam.team[targetTeam.activeIndex] = updatedTarget;
    addEvent(events, 'DAMAGE', `${target.name} took ${damage} damage.`);
    const modifier = typeModifier(move.element, target.element);
    if (modifier !== 1) {
      addEvent(events, 'EFFECTIVE', modifier === 2
        ? 'It’s super effective!'
        : 'It’s not very effective...');
    }
    if (updatedTarget.hp === 0) {
      addEvent(events, 'ZONED_OUT', `${target.name} zoned out!`);
    }
    return updatedTeam;
  }

  const healTargetIndex = targetIndex ?? targetTeam.activeIndex;
  const target = targetTeam.team[healTargetIndex];
  if (!target || !isAlive(target)) throw new Error('Cannot heal a zoned-out Lockling.');
  const usesLeft = user.healUsesLeft[moveId] ?? 0;
  if (usesLeft <= 0) throw new Error(`${user.name} has no uses of ${move.name} left.`);

  const updatedUser = {
    ...user,
    healUsesLeft: { ...user.healUsesLeft, [moveId]: usesLeft - 1 },
  };
  const updatedTeam = { ...targetTeam, team: [...targetTeam.team] };
  const hit = rollHit(rng);
  updatedTeam.team[healTargetIndex] = {
    ...target,
    hp: hit ? target.hp + calcHeal(move, target) : target.hp,
  };
  addEvent(events, 'MOVE_USED', `${user.name} used ${move.name}!`);
  if (!hit) {
    addEvent(events, 'MISSED', `${user.name} lost focus... it missed!`);
  } else {
    addEvent(events, 'HEALED', `${target.name} recovered ${updatedTeam.team[healTargetIndex].hp - target.hp} HP!`);
  }

  if (user === target) {
    updatedTeam.team[healTargetIndex] = {
      ...updatedTeam.team[healTargetIndex],
      healUsesLeft: updatedUser.healUsesLeft,
    };
  } else {
    const userIndex = targetTeam.team.indexOf(user);
    if (userIndex >= 0) updatedTeam.team[userIndex] = updatedUser;
  }
  return updatedTeam;
}

function resolveEnemyAction(
  battle: BattleState,
  action: EnemyAction,
  rng: Rng,
  events: BattleEvent[],
): BattleState {
  if (action.kind !== 'move') throw new Error('Enemy AI is not allowed to switch or forfeit.');
  const user = active(battle.enemy);
  const targetIndex = action.targetIndex;
  let enemy = { ...battle.enemy, team: [...battle.enemy.team] };
  let player = { ...battle.player, team: [...battle.player.team] };

  if (MOVES[action.moveId]?.effect === 'heal') {
    const result = useMove(user, enemy, action.moveId, targetIndex, rng, events);
    enemy = result;
  } else {
    player = useMove(user, player, action.moveId, undefined, rng, events);
  }
  return { ...battle, enemy, player };
}

export function createBattle(
  state: GameState,
  gymLevel: number,
  isPractice: boolean,
): BattleState {
  const gym = GYMS[gymLevel];
  if (!gym) throw new RangeError(`Unknown gym level: ${gymLevel}`);
  if (state.squad.length === 0) throw new Error('Cannot battle with an empty Squad.');

  const ownedByUid = new Map(state.creatures.map((creature) => [creature.uid, creature]));
  const playerTeam = state.squad.map((uid) => {
    const owned = ownedByUid.get(uid);
    if (!owned) throw new Error(`Squad references unknown owned creature ${uid}.`);
    return createBattleCreature(uid, owned.defId, owned.moveIds);
  });

  const enemyTeam = gym.team.map((member, index) => {
    if (member.creatureId === 'MIRROR_STARTER_COMMON') {
      const starterId = STARTER_IDS.find((id) => id === state.starterId);
      if (!starterId) throw new Error('Gym 1 mirror requires a valid starter Lockling.');
      const enemyDefId = MIRROR_COMMON[starterId];
      const moveId = ({ embrit: 'fire_spark', puddlo: 'water_drip', sproutle: 'grass_seed_toss' })
        [starterId];
      return createBattleCreature(`enemy-${gymLevel}-${index}-${enemyDefId}`, enemyDefId, [moveId]);
    }
    return createBattleCreature(
      `enemy-${gymLevel}-${index}-${member.creatureId}`,
      member.creatureId,
      member.moveIds,
    );
  });

  return {
    phase: 'intro',
    player: { team: playerTeam, activeIndex: 0 },
    enemy: { team: enemyTeam, activeIndex: 0 },
    round: 1,
    winner: null,
    isPractice,
    gymLevel,
  };
}

function settlePlayerAction(
  battle: BattleState,
  events: BattleEvent[],
): BattleState {
  const enemy = active(battle.enemy);
  if (!isAlive(enemy)) {
    const nextIndex = firstAliveIndex(battle.enemy);
    if (nextIndex === -1) {
      addEvent(events, 'VICTORY', 'LOCKED IN!');
      return { ...battle, phase: 'victory', winner: 'player' };
    }
    const updatedEnemy = { ...battle.enemy, activeIndex: nextIndex };
    addEvent(events, 'SENT_OUT', `${updatedEnemy.team[nextIndex]!.name} was sent out!`);
    return { ...battle, enemy: updatedEnemy, phase: 'enemy_turn' };
  }
  return { ...battle, phase: 'enemy_turn' };
}

export function applyPlayerAction(
  battle: BattleState,
  action: PlayerAction,
  rng: Rng,
): { battle: BattleState; events: BattleEvent[] } {
  if (battle.phase !== 'player_turn') {
    throw new Error(`Player actions are not allowed during ${battle.phase}.`);
  }
  const events: BattleEvent[] = [];

  if (action.type === 'forfeit') {
    addEvent(events, 'DEFEAT', 'Your Squad zoned out... the opponent wins this round.');
    return {
      battle: { ...battle, phase: 'defeat', winner: 'enemy' },
      events,
    };
  }

  if (action.type === 'switch') {
    const next = battle.player.team[action.toIndex];
    const current = active(battle.player);
    if (!next || !isAlive(next) || action.toIndex === battle.player.activeIndex) {
      throw new Error('Choose a different living Lockling to switch in.');
    }
    addEvent(events, 'SWITCHED', `Come back, ${current.name}! Go, ${next.name}!`);
    const updated = {
      ...battle,
      player: { ...battle.player, activeIndex: action.toIndex },
      phase: 'enemy_turn' as const,
    };
    return { battle: updated, events };
  }

  const user = active(battle.player);
  const player = { ...battle.player, team: [...battle.player.team] };
  const enemy = { ...battle.enemy, team: [...battle.enemy.team] };
  if (MOVES[action.moveId]?.effect === 'attack') {
    const updatedEnemy = useMove(user, enemy, action.moveId, undefined, rng, events);
    const settled = settlePlayerAction({ ...battle, player, enemy: updatedEnemy }, events);
    if (settled.phase === 'enemy_turn' && !isAlive(active(settled.player))) {
      const replacementIndex = firstAliveIndex(settled.player);
      if (replacementIndex === -1) {
        addEvent(events, 'DEFEAT', 'Your Squad zoned out... the opponent wins this round.');
        return {
          battle: { ...settled, phase: 'defeat', winner: 'enemy' },
          events,
        };
      }
      return {
        battle: {
          ...settled,
          player: { ...settled.player, activeIndex: replacementIndex },
          phase: 'player_forced_switch',
        },
        events,
      };
    }
    return { battle: settled, events };
  }

  const updatedPlayer = useMove(
    user,
    player,
    action.moveId,
    action.targetIndex,
    rng,
    events,
  );
  return { battle: { ...battle, player: updatedPlayer, phase: 'enemy_turn' }, events };
}

export function applyEnemyTurn(
  battle: BattleState,
  gym: GymDef,
  rng: Rng,
): { battle: BattleState; events: BattleEvent[] } {
  if (battle.phase !== 'enemy_turn') {
    throw new Error(`Enemy actions are not allowed during ${battle.phase}.`);
  }
  const events: BattleEvent[] = [];
  const action = chooseEnemyAction(battle, gym, rng);
  const afterAction = resolveEnemyAction(battle, action, rng, events);
  const playerActive = active(afterAction.player);

  if (!isAlive(playerActive)) {
    const replacementIndex = firstAliveIndex(afterAction.player);
    if (replacementIndex === -1) {
      addEvent(events, 'DEFEAT', 'Your Squad zoned out... the opponent wins this round.');
      return {
        battle: { ...afterAction, phase: 'defeat', winner: 'enemy' },
        events,
      };
    }
    return {
      battle: { ...afterAction, phase: 'player_forced_switch' },
      events,
    };
  }

  const nextRound = afterAction.round + 1;
  if (nextRound > BATTLE_ROUND_LIMIT) {
    addEvent(events, 'DEFEAT', 'The battle limit was reached.');
    return {
      battle: { ...afterAction, round: nextRound, phase: 'defeat', winner: 'enemy' },
      events,
    };
  }
  return {
    battle: { ...afterAction, round: nextRound, phase: 'player_turn' },
    events,
  };
}

export function applyForcedSwitch(
  battle: BattleState,
  toIndex: number,
): { battle: BattleState; events: BattleEvent[] } {
  if (battle.phase !== 'player_forced_switch') {
    throw new Error('A forced switch is only allowed after the active Lockling zones out.');
  }
  const next = battle.player.team[toIndex];
  const current = active(battle.player);
  if (!next || !isAlive(next) || toIndex === battle.player.activeIndex) {
    throw new Error('Choose a different living Lockling for the forced switch.');
  }

  return {
    battle: {
      ...battle,
      player: { ...battle.player, activeIndex: toIndex },
      phase: 'player_turn',
    },
    events: [{ type: 'SWITCHED', message: `Come back, ${current.name}! Go, ${next.name}!` }],
  };
}
