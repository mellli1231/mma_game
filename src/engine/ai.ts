import { AI_HEAL_THRESHOLD, MAX_HP } from '../data/config';
import { MOVES } from '../data/moves';
import { typeModifier } from './typeChart';
import type { BattleState, EnemyAction, GymDef, Rng } from '../types';

export function chooseEnemyAction(battle: BattleState, gym: GymDef, rng: Rng): EnemyAction {
  const enemy = battle.enemy.team[battle.enemy.activeIndex];
  const player = battle.player.team[battle.player.activeIndex];
  if (!enemy || enemy.hp <= 0) throw new Error('Enemy active Lockling is not able to act.');
  if (!player || player.hp <= 0) throw new Error('Player active Lockling is not able to be targeted.');
  if (typeof rng !== 'function') throw new TypeError('Enemy AI requires an RNG function.');

  const heals = enemy.moveIds
    .map((moveId) => ({ moveId, move: MOVES[moveId] }))
    .filter(({ moveId, move }) =>
      move?.effect === 'heal' && (enemy.healUsesLeft[moveId] ?? 0) > 0);
  const hurtTarget = battle.enemy.team
    .map((creature, index) => ({ creature, index }))
    .filter(({ creature }) => creature.hp > 0 && creature.hp / MAX_HP <= AI_HEAL_THRESHOLD)
    .sort((a, b) => a.creature.hp - b.creature.hp)[0];

  if (heals.length > 0 && hurtTarget) {
    const bestHeal = heals.reduce((best, current) =>
      current.move!.power > best.move!.power ? current : best);
    return { kind: 'move', moveId: bestHeal.moveId, targetIndex: hurtTarget.index };
  }

  const attacks = enemy.moveIds
    .map((moveId) => ({ moveId, move: MOVES[moveId] }))
    .filter(({ move }) => move?.effect === 'attack');
  if (attacks.length === 0) {
    throw new Error(`Enemy Lockling ${enemy.defId} has no usable attack move.`);
  }

  if (rng() < gym.aiBestMoveChance) {
    const best = attacks.reduce((currentBest, candidate) => {
      const candidateScore = candidate.move!.power
        * typeModifier(candidate.move!.element, player.element);
      const bestScore = currentBest.move!.power
        * typeModifier(currentBest.move!.element, player.element);
      return candidateScore > bestScore ? candidate : currentBest;
    });
    return { kind: 'move', moveId: best.moveId, targetIndex: battle.player.activeIndex };
  }

  const randomIndex = Math.floor(rng() * attacks.length);
  const randomAttack = attacks[randomIndex];
  if (!randomAttack) throw new RangeError('Enemy AI RNG returned a value outside [0, 1).');
  return { kind: 'move', moveId: randomAttack.moveId, targetIndex: battle.player.activeIndex };
}
