import { describe, expect, it } from 'vitest';

import { calculateFp, getTier } from '../src/engine/points';

describe('points engine', () => {
  it.each([
    {
      durationMin: 25, siteIds: ['instagram', 'tiktok', 'youtube'],
      tierName: 'Trail', rate: 10, baseFp: 250, activated: [], rawMultiplier: 1,
      multiplier: 1, capped: false, projectedFp: 250,
    },
    {
      durationMin: 25, siteIds: ['instagram', 'tiktok', 'x'],
      tierName: 'Trail', rate: 10, baseFp: 250, activated: ['social'], rawMultiplier: 2,
      multiplier: 2, capped: false, projectedFp: 500,
    },
    {
      durationMin: 45, siteIds: ['instagram', 'tiktok', 'x', 'youtube', 'netflix', 'twitch'],
      tierName: 'Trail', rate: 10, baseFp: 450, activated: ['social', 'video'], rawMultiplier: 2.75,
      multiplier: 2.5, capped: true, projectedFp: 1125,
    },
    {
      durationMin: 60, siteIds: ['reddit', 'discord', 'amazon'],
      tierName: 'Trail', rate: 10, baseFp: 600, activated: [], rawMultiplier: 1,
      multiplier: 1, capped: false, projectedFp: 600,
    },
    {
      durationMin: 90, siteIds: ['discord', 'whatsapp', 'messenger'],
      tierName: 'Expedition', rate: 15, baseFp: 1350, activated: ['messaging'], rawMultiplier: 1.5,
      multiplier: 1.5, capped: false, projectedFp: 2025,
    },
    {
      durationMin: 150, siteIds: ['cnn', 'bbc', 'cbc', 'steam', 'roblox', 'poki'],
      tierName: 'Odyssey', rate: 20, baseFp: 3000, activated: ['gaming', 'news'], rawMultiplier: 1.75,
      multiplier: 1.75, capped: false, projectedFp: 5250,
    },
    {
      durationMin: 61, siteIds: [],
      tierName: 'Expedition', rate: 15, baseFp: 915, activated: [], rawMultiplier: 1,
      multiplier: 1, capped: false, projectedFp: 915,
    },
    {
      durationMin: 180,
      siteIds: [
        'instagram', 'tiktok', 'x', 'facebook', 'reddit', 'snapchat',
        'youtube', 'netflix', 'twitch', 'disneyplus', 'primevideo', 'crunchyroll',
      ],
      tierName: 'Odyssey', rate: 20, baseFp: 3600, activated: ['social', 'video'], rawMultiplier: 2.75,
      multiplier: 2.5, capped: true, projectedFp: 9000,
    },
  ])(
    'calculates the specified FP breakdown for $durationMin minutes',
    ({ durationMin, siteIds, ...expected }) => {
      const result = calculateFp(durationMin, siteIds);
      expect(result).toEqual(expected);
    },
  );

  it('uses the configured tier boundaries', () => {
    expect(getTier(60)).toEqual({ name: 'Trail', rate: 10 });
    expect(getTier(61)).toEqual({ name: 'Expedition', rate: 15 });
    expect(getTier(120)).toEqual({ name: 'Expedition', rate: 15 });
    expect(getTier(121)).toEqual({ name: 'Odyssey', rate: 20 });
  });

  it.each([0, -1, 181, 1.5])('rejects invalid duration %s', (durationMin) => {
    expect(() => calculateFp(durationMin, [])).toThrow(RangeError);
  });

  it('ignores unknown site IDs and reports an uncapped raw multiplier', () => {
    const result = calculateFp(10, ['unknown-site', 'instagram', 'tiktok']);
    expect(result).toMatchObject({
      activated: [],
      rawMultiplier: 1,
      multiplier: 1,
      capped: false,
      projectedFp: 100,
    });
  });
});
