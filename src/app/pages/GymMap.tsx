import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GYMS } from '@/data/gyms';
import { CREATURES } from '@/data/creatures';
import { useGameState } from '@/app/store';
import { GYM_BACKGROUNDS } from '@/app/gymBackgrounds';

export default function GymMap() {
  const state = useGameState();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  if (!state) return <main className="focu-card m-6 p-6">Loading your Squad...</main>;

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6 text-ink">
      <header className="flex items-center justify-between gap-4">
        <div className="focu-panel px-5 py-2">
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted">Distraction Gyms</p>
          <h1 className="focu-title">Gym Map</h1>
        </div>
        <Link className="focu-pill" to="/">Home</Link>
      </header>

      {allCleared && (
        <section className="focu-card bg-mint-pale p-5" role="status">
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
              className={`flex items-center justify-between p-4 text-left ${
                locked
                  ? 'rounded-card border-[2.5px] border-dashed border-[#7c7a99] bg-disabled text-muted cursor-not-allowed'
                  : `focu-card ${selectedLevel === gym.level ? 'creature-card--selected bg-lavender' : cleared ? 'bg-mint-pale' : 'bg-sunshine'}`
              }`}
            >
              <span className="flex items-center gap-4">
                {GYM_BACKGROUNDS[gym.level] && (
                  <img
                    src={GYM_BACKGROUNDS[gym.level].src}
                    alt=""
                    className={`aspect-video w-28 shrink-0 rounded-xl border-[2.5px] border-ink object-cover ${locked ? 'opacity-50 grayscale' : ''}`}
                    style={{ objectPosition: GYM_BACKGROUNDS[gym.level].position }}
                  />
                )}
                <span>
                  <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">Gym {gym.level}</span>
                  <span className="block font-display text-lg font-bold">{gym.name}</span>
                </span>
              </span>
              <span aria-label={locked ? 'Locked' : cleared ? 'Cleared' : 'Current gym'}>
                {locked ? '🔒' : cleared ? '✓' : '★'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedGym && (
        <section className="focu-card p-6">
          <p className="text-sm font-extrabold text-muted">Gym {selectedGym.level}</p>
          <h2 className="font-display text-2xl font-bold">{selectedGym.name}</h2>
          <p className="mt-1 font-semibold">{selectedGym.leader}</p>
          <p className="mt-3 italic text-soft">{selectedGym.quote}</p>
          <h3 className="mt-5 font-bold">Enemy team</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {selectedGym.team.map((member, index) => {
              const mirror = member.creatureId === 'MIRROR_STARTER_COMMON';
              const defId = mirror && gameState.starterId
                ? ({ embrit: 'cindercub', puddlo: 'tidepup', sproutle: 'mossling' } as const)[gameState.starterId as 'embrit' | 'puddlo' | 'sproutle']
                : member.creatureId;
              const creature = CREATURES[defId];
              return (
                <li key={`${member.creatureId}-${index}`} className="focu-pill">
                  {creature ? `${creature.emoji} ${creature.name}` : 'Unknown Lockling'}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-soft">
            Your Squad: {squad.length > 0
              ? squad.map((creature) => CREATURES[creature.defId]?.name ?? creature.defId).join(', ')
              : 'Empty'}
          </p>
          {message && <p className="mt-3 text-sm font-semibold text-danger" role="alert">{message}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {selectedGym.level <= currentGymLevel || allCleared ? (
              <>
                {selectedGym.level === currentGymLevel && !allCleared && (
                  <button
                    type="button"
                    onClick={() => startBattle(selectedGym.level, false)}
                    className="focu-btn focu-btn--primary"
                  >
                    Battle!
                  </button>
                )}
                {(selectedGym.level < currentGymLevel || allCleared) && (
                  <button
                    type="button"
                    onClick={() => startBattle(selectedGym.level, true)}
                    className="focu-btn focu-btn--secondary"
                  >
                    Practice
                  </button>
                )}
              </>
            ) : (
              <p className="font-semibold text-muted">Clear the previous Gym to unlock this one.</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
