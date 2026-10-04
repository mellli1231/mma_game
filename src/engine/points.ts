import { FP_TIERS, MULTIPLIER_CAP } from '../data/config';
import { SITE_CATEGORIES } from '../data/sites';
import { SITES } from '../data/sites';
import type { FpBreakdown } from '../types';

export function getTier(durationMin: number): { name: string; rate: number } {
  if (!Number.isInteger(durationMin) || durationMin < 1 || durationMin > 180) {
    throw new RangeError('Adventure duration must be a whole number from 1 to 180 minutes.');
  }

  const tier = FP_TIERS.find(({ maxMin }) => durationMin <= maxMin);
  if (!tier) {
    throw new RangeError('Adventure duration is outside the configured FP tiers.');
  }

  return { name: tier.name, rate: tier.rate };
}

export function calculateFp(durationMin: number, siteIds: string[]): FpBreakdown {
  const tier = getTier(durationMin);
  const baseFp = durationMin * tier.rate;
  const counts = new Map<string, number>();

  for (const siteId of siteIds) {
    const categoryId = SITES[siteId]?.categoryId;
    if (categoryId) counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }

  const activated = SITE_CATEGORIES
    .filter(({ id, threshold }) => (counts.get(id) ?? 0) >= threshold)
    .map(({ id }) => id);
  const rawMultiplier = 1 + SITE_CATEGORIES.reduce(
    (bonus, category) => activated.includes(category.id)
      ? bonus + category.multiplier - 1
      : bonus,
    0,
  );
  const multiplier = Math.min(rawMultiplier, MULTIPLIER_CAP);

  return {
    tierName: tier.name,
    rate: tier.rate,
    baseFp,
    activated,
    rawMultiplier,
    multiplier,
    capped: rawMultiplier > multiplier,
    projectedFp: Math.floor(baseFp * multiplier),
  };
}
