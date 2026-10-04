import { describe, expect, it } from 'vitest';

import type { GameState, OwnedCreature } from '../src/types';
import { moveSquadMember, toggleSquadMember } from '../src/engine/squad';

const owned = (id: string): OwnedCreature => ({
  uid: `u_${id}`,
  defId: id,
  moveIds: [],
  obtainedAt: 0,
});

const state: GameState = {
  version: 1,
  trainerName: 'Tester',
  onboarded: true,
  starterId: 'embrit',
  fp: 0,
  lifetimeFp: 0,
  creatures: [owned('embrit'), owned('puddlo'), owned('sproutle'), owned('tidepup')],
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
};

describe('squad engine', () => {
  it('adds, removes, and reorders owned squad members', () => {
    const two = toggleSquadMember(state, 'u_puddlo');
    const three = toggleSquadMember(two, 'u_sproutle');
    expect(three.squad).toEqual(['u_embrit', 'u_puddlo', 'u_sproutle']);
    expect(moveSquadMember(three, 'u_sproutle', -1).squad)
      .toEqual(['u_embrit', 'u_sproutle', 'u_puddlo']);
    expect(toggleSquadMember(two, 'u_puddlo').squad).toEqual(['u_embrit']);
    expect(state.squad).toEqual(['u_embrit']);
  });

  it('rejects empty or oversized squads and unknown members', () => {
    expect(() => toggleSquadMember(state, 'u_embrit')).toThrow('at least one');
    const full = {
      ...state,
      squad: ['u_embrit', 'u_puddlo', 'u_sproutle'],
    };
    expect(() => toggleSquadMember(full, 'u_tidepup')).toThrow('more than 3');
    expect(() => toggleSquadMember(state, 'u_unknown')).toThrow('unknown creature');
    expect(() => moveSquadMember(state, 'u_puddlo', 1)).toThrow('not in the Squad');
  });

  it('keeps members in place when moved beyond a squad boundary', () => {
    expect(moveSquadMember(state, 'u_embrit', -1)).toBe(state);
  });
});
