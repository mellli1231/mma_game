import { describe, expect, it } from 'vitest';

import { STORAGE_KEY, TRAINER_NAME_MAX } from '../src/data/config';
import { CREATURES } from '../src/data/creatures';
import { GYMS } from '../src/data/gyms';
import { MOVES } from '../src/data/moves';
import { SITE_CATEGORIES, SITES } from '../src/data/sites';

describe('engine data catalog', () => {
  it('uses the versioned local storage key from the spec', () => {
    expect(STORAGE_KEY).toBe('locklings:v1');
  });

  it('sets the shared trainer name limit to the onboarding requirement', () => {
    expect(TRAINER_NAME_MAX).toBe(16);
  });

  it('defines the full hard-coded game catalog', () => {
    expect(Object.keys(MOVES)).toHaveLength(21);
    expect(Object.values(MOVES).filter((move) => move.price !== null)).toHaveLength(18);
    expect(Object.keys(CREATURES)).toHaveLength(9);
    expect(Object.values(CREATURES).filter((creature) => creature.isStarter)).toHaveLength(3);
    expect(Object.keys(GYMS)).toHaveLength(5);
    expect(SITE_CATEGORIES).toHaveLength(6);
    expect(Object.keys(SITES)).toHaveLength(37);
  });

  it('excludes AWS only from Amazon site blocking', () => {
    expect(SITES.steam.excludedDomains).toBeUndefined();
    expect(SITES.amazon.excludedDomains).toEqual(['aws.amazon.com']);
  });

  it('keeps every creature default move on the same element', () => {
    for (const creature of Object.values(CREATURES)) {
      const defaultMoves = creature.defaultMoveIds.map((moveId) => MOVES[moveId]);
      expect(defaultMoves.length).toBeGreaterThan(0);
      expect(defaultMoves.every((move) => move.element === creature.element)).toBe(true);
    }
  });
});
