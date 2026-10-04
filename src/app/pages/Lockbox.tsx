import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CREATURES } from '@/data/creatures';
import { MOVES } from '@/data/moves';
import { MAX_SQUAD_SIZE } from '@/data/config';
import { CreatureSprite, ElementBadge, LockboxChest, RevealCard } from '@/app/components';
import { useGameState } from '@/app/store';
import { dismissReward, chooseLockbox } from '@/engine/rewards';
import { teachFromScroll } from '@/engine/training';
import { platform } from '@/platform/platform';
import type { LockboxContent } from '@/types';

export default function Lockbox() {
  const state = useGameState();
  const navigate = useNavigate();
  const [shakingIndex, setShakingIndex] = useState<number | null>(null);
  const [selectedUid, setSelectedUid] = useState('');
  const [forgetMoveId, setForgetMoveId] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!state) return <main className="p-6">Loading your Lockbox...</main>;
  const pending = state.pendingReward;

  if (!pending) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">No Lockbox waiting</h1>
        <Link className="underline" to="/gyms">Return to the Gym Map</Link>
      </main>
    );
  }
  const activeReward = pending;

  const chosenIndex = activeReward.chosenIndex;
  const reward = chosenIndex === null ? undefined : activeReward.boxes[chosenIndex];
  const move = reward?.kind === 'move' ? MOVES[reward.moveId] : undefined;
  const selectedCreature = state.creatures.find((creature) => creature.uid === selectedUid);
  const selectedDef = selectedCreature ? CREATURES[selectedCreature.defId] : undefined;
  const forgetOptions = selectedCreature
    ? selectedCreature.moveIds.filter((moveId) => {
      const known = MOVES[moveId];
      if (!known) return false;
      if (known.effect !== 'attack') return true;
      return selectedCreature.moveIds.some((otherId) =>
        otherId !== moveId && MOVES[otherId]?.effect === 'attack');
    })
    : [];

  async function openBox(index: number) {
    if (busy || activeReward.chosenIndex !== null || index < 0 || index >= activeReward.boxes.length) return;
    setBusy(true);
    setMessage('');
    setShakingIndex(index);
    await new Promise<void>((resolve) => window.setTimeout(resolve, 1000));
    if (!mounted.current) return;

    try {
      await platform.updateState((current) => chooseLockbox(current, index));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open that Lockbox.');
    } finally {
      if (mounted.current) {
        setShakingIndex(null);
        setBusy(false);
      }
    }
  }

  async function saveMoveForLater() {
    if (!move || busy) return;
    setMessage(`${move.name} was saved as a Move Scroll.`);
  }

  async function teachMoveNow() {
    if (!move || !selectedCreature || busy) return;
    setBusy(true);
    setMessage('');
    try {
      await platform.updateState((current) => teachFromScroll(current, selectedCreature.uid, move.id, {
        ...(selectedCreature.moveIds.length === 4 && forgetMoveId ? { forgetMoveId } : {}),
      }));
      setMessage(`${selectedDef?.name ?? 'Your Lockling'} learned ${move.name}!`);
      setSelectedUid('');
      setForgetMoveId('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not teach this Move Scroll.');
    } finally {
      setBusy(false);
    }
  }

  async function continueAfterReward() {
    if (busy || !activeReward.applied) return;
    setBusy(true);
    try {
      await platform.updateState(dismissReward);
      navigate('/gyms');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not finish the reward flow.');
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6 text-slate-900">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Gym {activeReward.gymLevel} cleared</p>
          <h1 className="text-3xl font-bold">Choose a Lockbox</h1>
        </div>
      </header>

      {chosenIndex === null ? (
        <>
          <p>Choose one box to reveal its reward. It will be applied once when revealed.</p>
          <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {activeReward.boxes.map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className={shakingIndex === index ? 'animate-pulse motion-reduce:animate-none' : ''}>
                  <LockboxChest
                    state={shakingIndex === index ? 'shaking' : 'closed'}
                    onClick={() => void openBox(index)}
                    dimmed={busy && shakingIndex !== index}
                  />
                </div>
                <span className="font-semibold">Lockbox {index + 1}</span>
                {shakingIndex === index && <span className="text-sm">Opening...</span>}
              </div>
            ))}
          </fieldset>
        </>
      ) : (
        <section className="space-y-5 rounded-3xl border border-amber-200 bg-amber-50 p-6" aria-live="polite">
          <fieldset disabled className="grid grid-cols-3 gap-4">
            {activeReward.boxes.map((content, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <LockboxChest state="open" />
                {index === chosenIndex
                  ? <span className="text-center text-sm font-semibold">Lockbox {index + 1} chosen</span>
                  : <RewardSummary content={content} />}
              </div>
            ))}
          </fieldset>

          {reward?.kind === 'fp' && <RevealCard content={reward} />}

          {reward?.kind === 'creature' && (
            <CreatureReward creatureId={reward.creatureId} />
          )}

          {reward?.kind === 'move' && move && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{move.name}</h2>
              <p>
                {move.name} is now in your Move Scroll inventory. Teach it now or save it for later.
              </p>
              {state.creatures.length === 0 ? (
                <p>No owned Lockling can learn this move yet. The Scroll is saved for later.</p>
              ) : (
                <div className="grid gap-4 rounded-2xl bg-white p-4 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="block font-semibold">Teach to</span>
                    <select
                      value={selectedUid}
                      disabled={busy}
                      onChange={(event) => {
                        setSelectedUid(event.target.value);
                        setForgetMoveId('');
                      }}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="">Choose a Lockling</option>
                      {state.creatures.filter((creature) =>
                        CREATURES[creature.defId]?.element === move.element
                        && !creature.moveIds.includes(move.id))
                        .map((creature) => (
                          <option key={creature.uid} value={creature.uid}>
                            {CREATURES[creature.defId]?.name ?? creature.defId}
                          </option>
                        ))}
                    </select>
                  </label>
                  {selectedCreature && selectedCreature.moveIds.length === 4 && (
                    <label className="space-y-1">
                      <span className="block font-semibold">Move to forget</span>
                      <select
                        value={forgetMoveId}
                        disabled={busy}
                        onChange={(event) => setForgetMoveId(event.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                      >
                        <option value="">Choose a move</option>
                        {forgetOptions.map((moveId) => (
                          <option key={moveId} value={moveId}>{MOVES[moveId]?.name ?? moveId}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={
                    busy
                    || !selectedCreature
                    || (selectedCreature.moveIds.length === 4 && !forgetMoveId)
                  }
                  onClick={() => void teachMoveNow()}
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-40"
                >
                  Teach now
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void saveMoveForLater()}
                  className="rounded-xl border bg-white px-5 py-3 font-bold disabled:opacity-40"
                >
                  Save for later
                </button>
              </div>
            </div>
          )}

          {message && <p role="status" className="font-semibold text-indigo-800">{message}</p>}
          <button
            type="button"
            disabled={busy || !activeReward.applied}
            onClick={() => void continueAfterReward()}
            className="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}
      {message && chosenIndex === null && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-800">{message}</p>
      )}
    </main>
  );
}

function CreatureReward({ creatureId }: { creatureId: string }) {
  const creature = CREATURES[creatureId];
  if (!creature) return <p role="alert">This reward references an unknown Lockling.</p>;
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
      <CreatureSprite defId={creatureId} state="celebrate" showParticles />
      <div>
        <p className="text-lg font-bold">{creature.name} joined your Lockdex!</p>
        <ElementBadge element={creature.element} size="sm" />
        <p className="mt-1 text-sm capitalize text-slate-600">{creature.rarity}</p>
        <p className="mt-2">{creature.description}</p>
        <p className="mt-2 text-sm text-slate-600">
          Default moves: {creature.defaultMoveIds.map((id) => MOVES[id]?.name ?? id).join(', ')}
        </p>
        <p className="mt-2 text-sm text-slate-600">Your Squad can hold up to {MAX_SQUAD_SIZE} Locklings.</p>
      </div>
    </div>
  );
}

function RewardSummary({ content }: { content: LockboxContent }) {
  if (content.kind === 'creature') {
    return <span className="text-center text-sm">{CREATURES[content.creatureId]?.name ?? 'Unknown Lockling'}</span>;
  }
  if (content.kind === 'move') {
    return <span className="text-center text-sm">{MOVES[content.moveId]?.name ?? 'Unknown Move Scroll'}</span>;
  }
  return <span className="text-center text-sm">Spark Pouch: {content.amount} FP</span>;
}
