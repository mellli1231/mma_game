import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GYMS } from '@/data/gyms';
import { CREATURES } from '@/data/creatures';
import { useGameState } from '@/app/store';

export default function GymMap() {
  const state = useGameState();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  if (!state) return <main className="p-6">Loading your Squad...</main>;

  const gameState = state;
  const currentGymLevel = gameState.currentGymLevel;
  const gyms = Object.values(GYMS);
  const selectedGym = selectedLevel === null ? null : GYMS[selectedLevel];
  const squad = gameState.squad
    .map((uid) => gameState.creatures.find((creature) => creature.uid === uid))
    .filter((creature) => creature !== undefined);
  const allCleared = currentGymLevel > gyms.length;

  function startBattle(level: number, practice: boolean) {
    if (gameState.squad.length === 0) {
      setMessage('Add a Lockling to your Squad first.');
      return;
    }
    if (gameState.activeSession) {
      setMessage('Battles are locked while you’re on an Adventure.');
      return;
    }
    if (gameState.pendingReward) {
      navigate('/lockbox');
      return;
    }
    navigate(`/battle/${level}${practice ? '?practice=1' : ''}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6 text-slate-900">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Distraction Gyms</p>
          <h1 className="text-3xl font-bold">Gym Map</h1>
        </div>
        <Link className="rounded-xl border px-4 py-2 font-semibold" to="/">Home</Link>
      </header>

      {allCleared && (
        <section className="rounded-2xl bg-emerald-50 p-5" role="status">
          <h2 className="text-xl font-bold">All gyms cleared!</h2>
          <p>The Algorithm is defeated... for now. All gyms are available as Practice.</p>
        </section>
      )}

      <div className="grid gap-3">
        {gyms.map((gym) => {
          const cleared = gym.level < currentGymLevel || allCleared;
          const current = gym.level === currentGymLevel && !allCleared;
          const locked = gym.level > currentGymLevel && !allCleared;
          return (
            <button
              key={gym.level}
              type="button"
              disabled={locked}
              onClick={() => {
                setSelectedLevel(gym.level);
                setMessage('');
              }}
              aria-pressed={selectedLevel === gym.level}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
                selectedLevel === gym.level
                  ? 'border-indigo-500 bg-indigo-50'
                  : locked
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Gym {gym.level}</span>
                <span className="block text-lg font-bold">{gym.name}</span>
              </span>
              <span aria-label={locked ? 'Locked' : cleared ? 'Cleared' : 'Current gym'}>
                {locked ? '🔒' : cleared ? '✓' : '★'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedGym && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Gym {selectedGym.level}</p>
          <h2 className="text-2xl font-bold">{selectedGym.name}</h2>
          <p className="mt-1 font-semibold">{selectedGym.leader}</p>
          <p className="mt-3 italic text-slate-600">{selectedGym.quote}</p>
          <h3 className="mt-5 font-bold">Enemy team</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {selectedGym.team.map((member, index) => {
              const mirror = member.creatureId === 'MIRROR_STARTER_COMMON';
              const defId = mirror && gameState.starterId
                ? ({ embrit: 'cindercub', puddlo: 'tidepup', sproutle: 'mossling' } as const)[gameState.starterId as 'embrit' | 'puddlo' | 'sproutle']
                : member.creatureId;
              const creature = CREATURES[defId];
              return (
                <li key={`${member.creatureId}-${index}`} className="rounded-xl bg-slate-100 px-3 py-2">
                  {creature ? `${creature.emoji} ${creature.name}` : 'Unknown Lockling'}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Your Squad: {squad.length > 0
              ? squad.map((creature) => CREATURES[creature.defId]?.name ?? creature.defId).join(', ')
              : 'Empty'}
          </p>
          {message && <p className="mt-3 text-sm font-semibold text-rose-700" role="alert">{message}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {selectedGym.level <= currentGymLevel || allCleared ? (
              <>
                {selectedGym.level === currentGymLevel && !allCleared && (
                  <button
                    type="button"
                    onClick={() => startBattle(selectedGym.level, false)}
                    className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
                  >
                    Battle!
                  </button>
                )}
                {(selectedGym.level < currentGymLevel || allCleared) && (
                  <button
                    type="button"
                    onClick={() => startBattle(selectedGym.level, true)}
                    className="rounded-xl bg-slate-800 px-5 py-3 font-bold text-white"
                  >
                    Practice
                  </button>
                )}
              </>
            ) : (
              <p className="font-semibold text-slate-500">Clear the previous Gym to unlock this one.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
