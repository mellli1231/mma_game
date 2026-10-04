import { describe, expect, it } from 'vitest';

import { CREATURES } from '../src/data/creatures';
import { learnableMoves, learnMove, teachFromScroll } from '../src/engine/training';
import type { GameState } from '../src/types';

const stateWithEmbrit = (overrides: Partial<GameState> = {}): GameState => ({
  version: 1,
  trainerName: 'Tester',
  onboarded: true,
  starterId: 'embrit',
  fp: 900,
  lifetimeFp: 900,
  creatures: [{
    uid: 'u_embrit',
    defId: 'embrit',
    moveIds: [...CREATURES.embrit.defaultMoveIds],
    obtainedAt: 0,
  }],
  squad: ['u_embrit'],
  moveScrolls: [],
  currentGymLevel: 1,
  pendingReward: null,
  activeSession: null,
  sessionHistory: [],
  lastSeenSessionId: null,
  lastAdventureSetup: null,
  settings: { demoMode: false, sound: true },
  stats: {
    totalFocusMin: 0,
    adventuresCompleted: 0,
    adventuresAbandoned: 0,
    battlesWon: 0,
    battlesLost: 0,
  },
  ...overrides,
});

describe('training engine', () => {
  it('lists same-element sellable moves by ascending price and affordability', () => {
    const moves = learnableMoves(stateWithEmbrit({ fp: 300 }), 'u_embrit');
    expect(moves.map(({ move }) => move.id)).toEqual([
      'fire_kindle',
      'fire_blaze_burst',
      'fire_phoenix_rest',
      'fire_inferno',
    ]);
    expect(moves.map(({ affordable }) => affordable)).toEqual([false, false, false, false]);
  });

  it('marks a scroll move as free and affordable', () => {
    const moves = learnableMoves(
      stateWithEmbrit({ moveScrolls: ['fire_blaze_burst'] }),
      'u_embrit',
    );
    expect(moves.find(({ move }) => move.id === 'fire_blaze_burst')).toMatchObject({
      price: 1200,
      free: true,
      affordable: true,
    });
  });

  it('deducts FP only after valid learning and adds the move', () => {
    const state = stateWithEmbrit({ fp: 800 });
    const result = learnMove(state, 'u_embrit', 'fire_kindle', { source: 'fp' });
    expect(result.fp).toBe(0);
    expect(result.creatures[0].moveIds).toContain('fire_kindle');
    expect(state.fp).toBe(800);
  });

  it('consumes a matching scroll without spending FP', () => {
    const state = stateWithEmbrit({
      fp: 50,
      moveScrolls: ['fire_blaze_burst', 'fire_inferno'],
    });
    const result = teachFromScroll(state, 'u_embrit', 'fire_blaze_burst');
    expect(result.fp).toBe(50);
    expect(result.moveScrolls).toEqual(['fire_inferno']);
    expect(result.creatures[0].moveIds).toContain('fire_blaze_burst');
  });

  it('requires a forget choice at four moves and preserves an attack move', () => {
    const state = stateWithEmbrit({
      fp: 2500,
      creatures: [{
        uid: 'u_embrit',
        defId: 'embrit',
        moveIds: ['fire_ember_flick', 'fire_flame_lash', 'fire_kindle', 'fire_phoenix_rest'],
        obtainedAt: 0,
      }],
    });
    expect(() => learnMove(state, 'u_embrit', 'fire_inferno', { source: 'fp' }))
      .toThrow('Choose a move to forget');

    const result = learnMove(state, 'u_embrit', 'fire_inferno', {
      forgetMoveId: 'fire_ember_flick',
      source: 'fp',
    });
    expect(result.creatures[0].moveIds).toEqual([
      'fire_flame_lash',
      'fire_kindle',
      'fire_phoenix_rest',
      'fire_inferno',
    ]);
  });

  it('does not allow forgetting the only attack move', () => {
    const state = stateWithEmbrit({
      fp: 2500,
      creatures: [{
        uid: 'u_embrit',
        defId: 'embrit',
        moveIds: ['fire_ember_flick', 'fire_kindle', 'fire_phoenix_rest', 'fire_kindle'],
        obtainedAt: 0,
      }],
    });
    expect(() => learnMove(state, 'u_embrit', 'fire_inferno', {
      forgetMoveId: 'fire_ember_flick',
      source: 'fp',
    })).toThrow('must keep at least one attack');
  });

  it('rejects unaffordable, duplicate, wrong-element, and unowned-scroll teaching', () => {
    const state = stateWithEmbrit({ fp: 0 });
    expect(() => learnMove(state, 'u_embrit', 'fire_kindle', { source: 'fp' }))
      .toThrow('Not enough FP');
    expect(() => learnMove(state, 'u_embrit', 'fire_ember_flick', { source: 'fp' }))
      .toThrow('already knows');
    expect(() => learnMove(state, 'u_embrit', 'water_riptide', { source: 'fp' }))
      .toThrow('only learn fire moves');
    expect(() => teachFromScroll(state, 'u_embrit', 'fire_inferno'))
      .toThrow('No Move Scroll');
  });
});
