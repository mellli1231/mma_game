import { Link } from 'react-router-dom'
import { CREATURE_LIST, CREATURES } from '@/data/creatures'
import { MOVES } from '@/data/moves'
import { CreatureSprite, ElementBadge, ToastHost, useToast } from '@/app/components'
import { moveSquadMember, toggleSquadMember } from '@/engine/squad'
import { useGameState } from '@/app/store'
import { platform } from '@/platform/platform'
import type { ElementType } from '@/types'

const ELEMENTS: { id: ElementType; label: string; icon: string }[] = [
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'grass', label: 'Grass', icon: '🌿' },
]

export default function Lockdex() {
  const state = useGameState()
  const { toast } = useToast()

  if (!state) return <main className="p-6" aria-busy="true">Loading your Lockdex…</main>
  const currentState = state

  const squad = currentState.squad
    .map((uid) => currentState.creatures.find((creature) => creature.uid === uid))
    .filter((creature): creature is NonNullable<typeof creature> => Boolean(creature))

  async function toggleMember(uid: string) {
    const wasInSquad = currentState.squad.includes(uid)
    try {
      await platform.updateState((current) => toggleSquadMember(current, uid))
      toast(wasInSquad ? 'Lockling removed from your Squad.' : 'Lockling added to your Squad.')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update your Squad.')
    }
  }

  async function moveMember(uid: string, direction: -1 | 1) {
    await platform.updateState((current) => moveSquadMember(current, uid, direction))
  }

  const moveScrolls = state.moveScrolls
    .map((moveId) => MOVES[moveId])
    .filter((move) => Boolean(move))

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4 pb-16 sm:p-8">
      <ToastHost />
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Collection & team</p>
        <h1 className="text-4xl">Lockdex & Squad</h1>
        <p className="mt-1 text-muted">Build your team, put your lead first, and meet all nine Locklings.</p>
      </header>

      <section className="rounded-card bg-surface p-5 shadow-card" aria-labelledby="squad-title">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="squad-title" className="text-2xl">Your Squad</h2>
          <p className="text-sm text-muted">{squad.length}/3 Locklings · Slot 1 leads</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((slot) => {
            const member = squad[slot]
            const def = member ? CREATURES[member.defId] : undefined
            return (
              <article key={slot} className={`min-w-0 rounded-card border p-3 ${member ? 'border-ring-track bg-bg' : 'border-dashed border-ring-track bg-surface'}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-display text-white">{slot + 1}</div>
                  {member && def ? <>
                    <CreatureSprite defId={member.defId} uid={member.uid} size={64} state={slot === 0 ? 'selected' : 'idle'} />
                    <div className="min-w-0 flex-1"><h3 className="truncate font-display text-lg">{def.name}</h3><ElementBadge element={def.element} size="sm" /></div>
                    <div className="flex flex-col gap-1">
                      <button type="button" aria-label={`Move ${def.name} up`} title="Move up" disabled={slot === 0} onClick={() => void moveMember(member.uid, -1)} className="grid min-h-9 min-w-9 place-items-center rounded-full bg-surface text-lg font-bold disabled:opacity-30">↑</button>
                      <button type="button" aria-label={`Move ${def.name} down`} title="Move down" disabled={slot === squad.length - 1} onClick={() => void moveMember(member.uid, 1)} className="grid min-h-9 min-w-9 place-items-center rounded-full bg-surface text-lg font-bold disabled:opacity-30">↓</button>
                    </div>
                  </> : <div className="py-4 text-sm text-muted">Empty slot · tap a Lockling below to add</div>}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="collection-title">
        <div>
          <h2 id="collection-title" className="text-2xl">The Lockdex <span className="text-base font-normal text-muted">{state.creatures.length}/9 found</span></h2>
          <p className="mt-1 text-sm text-muted">Choose any owned Lockling to add or remove it from your Squad. Your Squad always keeps at least one member.</p>
        </div>
        {ELEMENTS.map((element) => {
          const members = CREATURE_LIST.filter((creature) => creature.element === element.id)
          return (
            <section key={element.id} className="rounded-card bg-surface p-4 shadow-card" aria-labelledby={`dex-${element.id}`}>
              <h3 id={`dex-${element.id}`} className="mb-3 flex items-center gap-2 font-display text-xl"><span aria-hidden="true">{element.icon}</span>{element.label}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {members.map((def) => {
                  const owned = state.creatures.find((creature) => creature.defId === def.id)
                  const isInSquad = Boolean(owned && state.squad.includes(owned.uid))
                  return (
                    <button key={def.id} type="button" disabled={!owned} onClick={() => owned && void toggleMember(owned.uid)} aria-pressed={isInSquad}
                      aria-label={owned ? `${isInSquad ? 'Remove' : 'Add'} ${def.name} ${isInSquad ? 'from' : 'to'} your Squad` : `Unknown ${element.label} Lockling`}
                      className={`flex min-h-40 flex-col items-center justify-center rounded-card p-3 text-center transition ${owned ? 'bg-bg hover:shadow-card' : 'cursor-default bg-ink/5'} ${isInSquad ? 'ring-2 ring-primary' : ''}`}>
                      {owned ? <CreatureSprite defId={def.id} uid={owned.uid} size={88} state={isInSquad ? 'selected' : 'idle'} /> : <span className="lockdex-silhouette"><CreatureSprite defId={def.id} uid={`silhouette-${def.id}`} size={88} showShadow={false} /></span>}
                      <span className={`mt-1 font-display text-lg ${owned ? '' : 'text-muted'}`}>{owned ? def.name : '???'}</span>
                      <span className="mt-1"><ElementBadge element={def.element} size="sm" /></span>
                      <span className="mt-1 text-xs text-muted">{owned ? isInSquad ? 'In your Squad · tap to remove' : 'Owned · tap to add' : 'Not found yet'}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </section>

      <section className="rounded-card bg-surface p-5 shadow-card" aria-labelledby="scrolls-title">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="scrolls-title" className="text-2xl">Move Scrolls</h2>
          <span className="text-sm text-muted">{moveScrolls.length} in your pack</span>
        </div>
        {moveScrolls.length ? <div className="space-y-3">
          {moveScrolls.map((move, index) => {
            const eligible = state.creatures.find((owned) => CREATURES[owned.defId]?.element === move.element && !owned.moveIds.includes(move.id))
            return (
              <article key={`${move.id}-${index}`} className="flex flex-wrap items-center gap-3 rounded-card bg-bg p-3">
                <ElementBadge element={move.element} size="sm" />
                <div className="min-w-0 flex-1"><h3 className="font-display">{move.name}</h3><p className="text-sm text-muted">{move.effect === 'attack' ? 'Attack' : 'Heal'} · Power {move.power}</p></div>
                {eligible ? <Link to={`/dojo/${eligible.uid}`} className="min-h-tap inline-flex items-center rounded-pill bg-primary px-4 text-sm font-bold text-white">Teach at Dojo</Link> : <span className="text-sm text-muted">No eligible Lockling right now</span>}
              </article>
            )
          })}
        </div> : <p className="rounded-card bg-bg p-4 text-muted">No Move Scrolls yet. Some Lockbox rewards contain a free move lesson.</p>}
      </section>
    </main>
  )
}
