import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { LearnableMove, MoveDef } from '@/types'
import { CREATURES } from '@/data/creatures'
import { MOVES } from '@/data/moves'
import { CreatureSprite, ElementBadge, FpBadge, Modal, useToast } from '@/app/components'
import { learnableMoves, learnMove } from '@/engine/training'
import { useGameState } from '@/app/store'
import { platform } from '@/platform/platform'

interface PendingLearn {
  move: LearnableMove
  source: 'fp' | 'scroll'
}

export default function Dojo() {
  const state = useGameState()
  const { uid } = useParams<{ uid: string }>()
  const { toast } = useToast()
  const [pendingLearn, setPendingLearn] = useState<PendingLearn | null>(null)
  const [forgetMoveId, setForgetMoveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = state?.creatures.find((creature) => creature.uid === uid)
  const selectedDef = selected ? CREATURES[selected.defId] : undefined
  const learnable = useMemo(
    () => state && selected ? learnableMoves(state, selected.uid) : [],
    [state, selected],
  )
  const knownMoves = selected?.moveIds.map((id) => MOVES[id]).filter((move): move is MoveDef => Boolean(move)) ?? []
  const attackCount = knownMoves.filter((move) => move.effect === 'attack').length
  const forgetOptions = knownMoves.map((move) => ({
    move,
    canForget: move.effect !== 'attack' || attackCount > 1,
  }))
  const adventureLocked = Boolean(state?.activeSession)

  async function teach(item: LearnableMove) {
    if (!selected || saving) return
    const source = item.free ? 'scroll' : 'fp'
    if (selected.moveIds.length >= 4) {
      setPendingLearn({ move: item, source })
      setForgetMoveId(null)
      return
    }
    await confirmTeach(item, source)
  }

  async function confirmTeach(item: LearnableMove, source: 'fp' | 'scroll', forgetId?: string) {
    if (!selected || saving) return
    setSaving(true)
    try {
      await platform.updateState((current) => learnMove(current, selected.uid, item.move.id, {
        ...(forgetId ? { forgetMoveId: forgetId } : {}),
        source,
      }))
      toast(`${selectedDef?.name ?? 'Your Lockling'} learned ${item.move.name}!`)
      setPendingLearn(null)
      setForgetMoveId(null)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not teach that move.')
    } finally {
      setSaving(false)
    }
  }

  if (!state) return <main className="p-6" aria-busy="true">Loading your Locklings…</main>

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-16 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Training Centre</p>
          <h1 className="text-4xl">The Dojo</h1>
          <p className="mt-1 text-muted">Teach your Locklings new moves with FocuPoints or a Move Scroll.</p>
        </div>
        <div className="flex items-center gap-3">
          <FpBadge amount={state.fp} />
          <Link to="/" className="inline-flex min-h-tap items-center rounded-pill border border-ring-track bg-surface px-4 font-bold text-primary hover:bg-ring-track">Home</Link>
        </div>
      </header>

      {adventureLocked ? (
        <section className="rounded-card bg-surface p-8 text-center shadow-card">
          <span className="text-4xl" aria-hidden="true">🔒</span>
          <h2 className="mt-2 text-2xl">The Dojo is closed during an Adventure</h2>
          <p className="mt-2 text-muted">Finish your focus session and come back to train.</p>
          <Link to="/adventure" className="mt-5 inline-flex items-center rounded-pill bg-primary px-5 font-bold text-white">Return to your Adventure</Link>
        </section>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-card bg-surface p-4 shadow-card">
            <h2 className="mb-3 text-xl">Your Locklings <span className="text-sm font-normal text-muted">({state.creatures.length})</span></h2>
            {state.creatures.length ? (
              <div className="space-y-2">
                {state.creatures.map((owned) => {
                  const def = CREATURES[owned.defId]
                  if (!def) return null
                  const active = owned.uid === uid
                  return (
                    <Link key={owned.uid} to={`/dojo/${owned.uid}`} aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-card p-3 transition-colors ${active ? 'bg-ring-track ring-2 ring-primary' : 'bg-bg hover:bg-ring-track'}`}>
                      <CreatureSprite defId={owned.defId} uid={owned.uid} size={56} state={active ? 'selected' : 'idle'} />
                      <span className="min-w-0 flex-1"><span className="block font-display">{def.name}</span><span className="text-sm text-muted">{owned.moveIds.length}/4 moves</span></span>
                      <ElementBadge element={def.element} size="sm" />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted">No Locklings yet. Choose a starter to begin training.</p>
            )}
          </aside>

          <section className="min-w-0 space-y-5">
            {selected && selectedDef ? (
              <>
                <article className="flex flex-wrap items-center gap-4 rounded-card bg-surface p-5 shadow-card">
                  <CreatureSprite defId={selected.defId} uid={selected.uid} size={104} state="selected" showParticles />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl">{selectedDef.name}</h2><ElementBadge element={selectedDef.element} /><span className="rounded-pill bg-bg px-3 py-1 text-sm capitalize text-muted">{selectedDef.rarity}</span></div>
                    <p className="mt-1 text-muted">{selectedDef.description}</p>
                    <p className="mt-2 font-bold">Known moves <span className="text-muted">({knownMoves.length}/4)</span></p>
                  </div>
                </article>

                <section className="rounded-card bg-surface p-5 shadow-card">
                  <h2 className="mb-3 text-xl">Known moves <span className="text-sm font-normal text-muted">({knownMoves.length}/4)</span></h2>
                  {knownMoves.length ? <div className="grid gap-3 sm:grid-cols-2">
                    {knownMoves.map((move) => <KnownMove key={move.id} move={move} />)}
                  </div> : <p className="text-muted">No moves are recorded for this Lockling.</p>}
                </section>

                <section className="rounded-card bg-surface p-5 shadow-card">
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl">Learnable moves</h2>
                    <span className="text-sm text-muted">{learnable.length} available · {selectedDef.element} moves only</span>
                  </div>
                  {learnable.length ? <div className="space-y-3">
                    {learnable.map((item) => {
                      const need = Math.max(0, item.price - state.fp)
                      return (
                        <article key={item.move.id} className="grid gap-3 rounded-card border border-ring-track p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2"><ElementBadge element={item.move.element} size="sm" /><h3 className="font-display text-lg">{item.move.name}</h3>{item.free ? <span className="rounded-pill bg-grass/15 px-2 py-1 text-xs font-bold text-grass-ink">Free (Scroll)</span> : null}</div>
                            <p className="mt-1 text-sm text-muted">{item.move.effect === 'attack' ? 'Attack' : 'Heal'} · Power {item.move.power}{item.move.effect === 'heal' && item.move.usesPerBattle != null ? ` · ${item.move.usesPerBattle} uses per battle` : ''}</p>
                            <p className="mt-1 text-sm">{item.move.description}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                            <span className="font-display text-lg text-fp-gold-ink">{item.free ? 'Free' : `${item.price} FP`}</span>
                            {need > 0 && !item.free ? <span className="w-full text-sm font-bold text-danger sm:w-auto">Need {need} more FP</span> : null}
                            {need > 0 && !item.free ? <Link to="/adventure/setup" className="text-sm font-bold text-primary underline">Earn FP on an Adventure</Link> : null}
                            <button type="button" disabled={!item.affordable || saving} onClick={() => void teach(item)} className="min-h-tap rounded-pill bg-primary px-5 font-bold text-white enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
                              {item.free ? 'Teach free' : 'Teach'}
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div> : <p className="rounded-card bg-bg p-4 text-muted">This Lockling already knows every move it can learn.</p>}
                </section>
              </>
            ) : (
              <div className="rounded-card bg-surface p-8 text-center shadow-card">
                <span className="text-4xl" aria-hidden="true">🥋</span>
                <h2 className="mt-3 text-2xl">Choose a Lockling to train</h2>
                <p className="mt-1 text-muted">Select one from your roster to see its known and learnable moves.</p>
              </div>
            )}
          </section>
        </div>
      )}

      <Modal
        open={Boolean(pendingLearn)}
        title="Choose a move to forget"
        onClose={() => { setPendingLearn(null); setForgetMoveId(null) }}
        actions={<>
          <button type="button" className="min-h-tap rounded-pill bg-bg px-4" onClick={() => { setPendingLearn(null); setForgetMoveId(null) }}>Cancel</button>
          <button type="button" disabled={!forgetMoveId || saving} className="min-h-tap rounded-pill bg-primary px-4 font-bold text-white disabled:opacity-45" onClick={() => pendingLearn && void confirmTeach(pendingLearn.move, pendingLearn.source, forgetMoveId ?? undefined)}>
            {saving ? 'Teaching…' : 'Forget and teach'}
          </button>
        </>}
      >
        <p className="mb-4 text-sm text-muted">{pendingLearn ? `${pendingLearn.move.move.name} will replace one known move. You can never forget your last attack move.` : ''}</p>
        <div className="space-y-2">
          {forgetOptions.map(({ move, canForget }) => (
            <button key={move.id} type="button" disabled={!canForget} aria-pressed={forgetMoveId === move.id}
              onClick={() => setForgetMoveId(move.id)}
              className={`flex min-h-tap w-full items-center justify-between rounded-card border p-3 text-left ${forgetMoveId === move.id ? 'border-primary bg-ring-track' : 'border-ring-track'} disabled:cursor-not-allowed disabled:opacity-45`}>
              <span><span className="block font-display">{move.name}</span><span className="text-sm capitalize text-muted">{move.effect} · Power {move.power}</span></span>
              {!canForget ? <span className="text-right text-xs font-bold text-danger">Last attack<br />cannot be forgotten</span> : <span className="text-sm text-muted">{forgetMoveId === move.id ? 'Selected' : 'Choose'}</span>}
            </button>
          ))}
        </div>
        {!forgetOptions.some((option) => option.canForget) ? <p className="mt-3 text-sm font-bold text-danger">This Lockling has no move it can safely replace.</p> : null}
      </Modal>
    </main>
  )
}

function KnownMove({ move }: { move: MoveDef }) {
  return (
    <article className="flex items-center gap-3 rounded-card bg-bg p-3">
      <ElementBadge element={move.element} size="sm" />
      <div className="min-w-0 flex-1"><h3 className="font-display">{move.name}</h3><p className="text-sm capitalize text-muted">{move.effect} · Power {move.power}{move.effect === 'heal' && move.usesPerBattle != null ? ` · ${move.usesPerBattle} uses` : ''}</p></div>
    </article>
  )
}
