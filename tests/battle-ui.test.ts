import { describe, expect, it } from 'vitest';

import { isMissEventForCreature } from '../src/app/pages/Battle';

describe('battle event presentation', () => {
  it('marks the creature that missed, not the opponent', () => {
    const missedEvent = { type: 'MISSED' as const, message: 'Tidepup lost focus... it missed!' };

    expect(isMissEventForCreature(missedEvent, 'Tidepup')).toBe(true);
    expect(isMissEventForCreature(missedEvent, 'Cindercub')).toBe(false);
  });

  it('does not show a miss indicator for other event types', () => {
    expect(isMissEventForCreature(
      { type: 'DAMAGE', message: 'Cindercub took 20 damage.' },
      'Cindercub',
    )).toBe(false);
    expect(isMissEventForCreature(null, 'Cindercub')).toBe(false);
  });
});
