import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { GYMS } from '../src/data/gyms';
import { MOVES } from '../src/data/moves';
import { SITE_CATEGORIES, SITES } from '../src/data/sites';

describe('engine data catalog', () => {
  it('defines the full hard-coded game catalog', () => {
    expect(Object.keys(MOVES)).toHaveLength(21);
    expect(Object.values(MOVES).filter((move) => move.price !== null)).toHaveLength(18);
    expect(Object.keys(CREATURES)).toHaveLength(9);
    expect(Object.values(CREATURES).filter((creature) => creature.isStarter)).toHaveLength(3);
    expect(Object.keys(GYMS)).toHaveLength(5);
    expect(SITE_CATEGORIES).toHaveLength(6);
    expect(Object.keys(SITES)).toHaveLength(37);
  });

  it('keeps every creature default move on the same element', () => {
    for (const creature of Object.values(CREATURES)) {
      const defaultMoves = creature.defaultMoveIds.map((moveId) => MOVES[moveId]);
      expect(defaultMoves.length).toBeGreaterThan(0);
      expect(defaultMoves.every((move) => move.element === creature.element)).toBe(true);
    }
  });
});
