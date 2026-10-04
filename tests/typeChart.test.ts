import { describe, expect, it } from 'vitest';

import { typeModifier } from '../src/engine/typeChart';

describe('element type chart', () => {
  it.each([
    ['fire', 'fire', 1],
    ['fire', 'water', 0.5],
    ['fire', 'grass', 2],
    ['water', 'fire', 2],
    ['water', 'water', 1],
    ['water', 'grass', 0.5],
    ['grass', 'fire', 0.5],
    ['grass', 'water', 2],
    ['grass', 'grass', 1],
  ] as const)('%s attacks %s with modifier %s', (attack, defense, expected) => {
    expect(typeModifier(attack, defense)).toBe(expected);
  });
});
