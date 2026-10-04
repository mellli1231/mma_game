import { describe, expect, it } from 'vitest';

import { mulberry32 } from '../src/engine/rng';

describe('mulberry32', () => {
  it('returns a reproducible sequence for a seed', () => {
    const first = mulberry32(42);
    const second = mulberry32(42);
    expect(Array.from({ length: 10 }, first)).toEqual(Array.from({ length: 10 }, second));
  });

  it('returns values in the rng range [0, 1)', () => {
    const rng = mulberry32(2026);
    for (let i = 0; i < 100; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
