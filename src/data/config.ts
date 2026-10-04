import type { CategoryId, ElementType } from '../types';

export const MAX_HP = 100;
export const MISS_CHANCE = 0.3;
export const TYPE_STRONG = 2;
export const TYPE_WEAK = 0.5;
export const MULTIPLIER_CAP = 2.5;
export const HEAL_USES_PER_BATTLE = 2;
export const BATTLE_ROUND_LIMIT = 60;
export const AI_HEAL_THRESHOLD = 0.35;
export const WELCOME_FP = 300;
export const DUPLICATE_FP_REWARD = 250;
export const MAX_SQUAD_SIZE = 3;
export const LOCKBOX_COUNT = 3;
export const MAX_CUSTOM_DOMAINS = 10;
export const LOCKBOX_CREATURE_CHANCE = 1 / 3;

export const CATEGORY_IDS: CategoryId[] = ['social', 'video', 'gaming', 'messaging', 'news', 'shopping'];

export const FP_TIERS = [
  { name: 'Trail', maxMin: 60, rate: 10 },
  { name: 'Expedition', maxMin: 120, rate: 15 },
  { name: 'Odyssey', maxMin: 180, rate: 20 },
] as const;

export const RARITY_WEIGHTS = {
  common: 60,
  rare: 30,
  epic: 10,
} as const;

export const STARTER_IDS = ['embrit', 'puddlo', 'sproutle'] as const;

export const STRONG_AGAINST: Record<ElementType, ElementType> = {
  fire: 'grass',
  grass: 'water',
  water: 'fire',
};
