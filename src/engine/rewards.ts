import {
  DUPLICATE_FP_REWARD,
  LOCKBOX_COUNT,
  LOCKBOX_CREATURE_CHANCE,
  RARITY_WEIGHTS,
} from '../data/config';
import { CREATURES } from '../data/creatures';
import { MOVES } from '../data/moves';
import type { GameState, LockboxContent, OwnedCreature, Rarity, Rng } from '../types';

interface WeightedItem {
  id: string;
  rarity: Rarity;
  content: LockboxContent;
}

function randomUnit(rng: Rng): number {
  const value = rng();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Reward RNG must return a number in [0, 1).');
  }
  return value;
}

function weightedPick<T extends { rarity: Rarity }>(pool: T[], rng: Rng): T | undefined {
  if (pool.length === 0) return undefined;

  const totalWeight = pool.reduce((sum, item) => sum + RARITY_WEIGHTS[item.rarity], 0);
  let roll = randomUnit(rng) * totalWeight;
  for (const item of pool) {
    roll -= RARITY_WEIGHTS[item.rarity];
    if (roll < 0) return item;
  }

  return pool[pool.length - 1];
}

function unownedCreatures(state: GameState): WeightedItem[] {
  const ownedIds = new Set(state.creatures.map((creature) => creature.defId));
  return Object.values(CREATURES)
    .filter((creature) => !ownedIds.has(creature.id))
    .map((creature) => ({
      id: `creature:${creature.id}`,
      rarity: creature.rarity,
      content: { kind: 'creature', creatureId: creature.id },
    }));
}

function eligibleMoves(state: GameState): WeightedItem[] {
  const heldScrolls = new Set(state.moveScrolls);
  return Object.values(MOVES)
    .filter((move) =>
      move.price !== null
      && !heldScrolls.has(move.id)
      && state.creatures.some((creature) => {
        const def = CREATURES[creature.defId];
        return def?.element === move.element && !creature.moveIds.includes(move.id);
      }))
    .map((move) => ({
      id: `move:${move.id}`,
      rarity: move.rarity,
      content: { kind: 'move', moveId: move.id },
    }));
}

export function rollLockboxes(state: GameState, rng: Rng): LockboxContent[] {
  const taken = new Set<string>();
  const boxes: LockboxContent[] = [];

  for (let index = 0; index < LOCKBOX_COUNT; index += 1) {
    const creatureRoll = randomUnit(rng) < LOCKBOX_CREATURE_CHANCE;
    const pool = (creatureRoll ? unownedCreatures(state) : eligibleMoves(state))
      .filter((item) => !taken.has(item.id));
    const pick = weightedPick(pool, rng);
    if (!pick) {
      boxes.push({ kind: 'fp', amount: DUPLICATE_FP_REWARD });
      continue;
    }
    taken.add(pick.id);
    boxes.push(pick.content);
  }

  return boxes;
}

export function clearGym(state: GameState, gymLevel: number, rng: Rng): GameState {
  if (!Number.isInteger(gymLevel) || gymLevel < 1 || gymLevel > 5) {
    throw new RangeError('Gym level must be an integer from 1 to 5.');
  }
  if (state.pendingReward || gymLevel !== state.currentGymLevel || gymLevel > 5) return state;

  return {
    ...state,
    currentGymLevel: gymLevel + 1,
    pendingReward: {
      gymLevel,
      boxes: rollLockboxes(state, rng),
      chosenIndex: null,
      applied: false,
    },
    stats: {
      ...state.stats,
      battlesWon: state.stats.battlesWon + 1,
    },
  };
}

export function recordBattleLoss(state: GameState): GameState {
  return {
    ...state,
    stats: {
      ...state.stats,
      battlesLost: state.stats.battlesLost + 1,
    },
  };
}

function creatureUid(state: GameState, creatureId: string): string {
  const baseUid = `u_${creatureId}`;
  const existing = new Set(state.creatures.map((creature) => creature.uid));
  if (!existing.has(baseUid)) return baseUid;

  let suffix = 2;
  while (existing.has(`${baseUid}_${suffix}`)) suffix += 1;
  return `${baseUid}_${suffix}`;
}

function addCreature(state: GameState, creatureId: string): OwnedCreature {
  const def = CREATURES[creatureId];
  if (!def) throw new Error(`Unknown Lockbox creature: ${creatureId}`);
  if (state.creatures.some((creature) => creature.defId === creatureId)) {
    throw new Error(`${def.name} is already owned.`);
  }

  return {
    uid: creatureUid(state, creatureId),
    defId: creatureId,
    moveIds: [...def.defaultMoveIds],
    obtainedAt: 0,
  };
}

export function chooseLockbox(state: GameState, index: number): GameState {
  const reward = state.pendingReward;
  if (!reward) throw new Error('There is no pending Lockbox reward to choose.');
  if (!Number.isInteger(index) || index < 0 || index >= reward.boxes.length) {
    throw new RangeError('Lockbox selection is out of range.');
  }
  if (reward.applied) return state;

  const content = reward.boxes[index];
  if (!content) throw new RangeError('Selected Lockbox has no reward content.');

  let next: GameState = state;
  switch (content.kind) {
    case 'creature': {
      const creature = addCreature(state, content.creatureId);
      next = {
        ...state,
        creatures: [...state.creatures, creature],
        squad: state.squad.length < 3 ? [...state.squad, creature.uid] : state.squad,
      };
      break;
    }
    case 'move': {
      const move = MOVES[content.moveId];
      if (!move || move.price === null) throw new Error(`Unknown Lockbox Move Scroll: ${content.moveId}`);
      next = state.moveScrolls.includes(content.moveId)
        ? state
        : { ...state, moveScrolls: [...state.moveScrolls, content.moveId] };
      break;
    }
    case 'fp':
      if (!Number.isInteger(content.amount) || content.amount < 0) {
        throw new RangeError('Spark Pouch amount must be a non-negative integer.');
      }
      next = {
        ...state,
        fp: state.fp + content.amount,
        lifetimeFp: state.lifetimeFp + content.amount,
      };
      break;
  }

  return {
    ...next,
    pendingReward: { ...reward, chosenIndex: index, applied: true },
  };
}

export function dismissReward(state: GameState): GameState {
  if (!state.pendingReward) return state;
  if (!state.pendingReward.applied) {
    throw new Error('Choose a Lockbox and reveal its reward before continuing.');
  }
  return { ...state, pendingReward: null };
}
